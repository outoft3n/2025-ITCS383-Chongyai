import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { hashPassword, comparePassword } from '../lib/password';
import { successResponse, errorResponse } from '../lib/response';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).refine((r) => r !== Role.ADMIN, {
    message: 'Cannot self-register as admin',
  }),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post(
  '/register',
  validate(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role, firstName, lastName, companyName } =
        req.body as z.infer<typeof RegisterSchema>;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errorResponse(res, 'Email already registered', 409);
        return;
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          firstName,
          lastName,
          ...(role === Role.APPLICANT && {
            applicantProfile: { create: { skills: [] } },
          }),
          ...(role === Role.RECRUITER && {
            recruiterProfile: {
              create: { companyName: companyName ?? 'My Company' },
            },
          }),
        },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVerified: true,
          isPaid: true,
          createdAt: true,
        },
      });

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      successResponse(res, { token, user }, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  validate(LoginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as z.infer<typeof LoginSchema>;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVerified: true,
          isPaid: true,
          profileImageUrl: true,
        },
      });

      if (!user) {
        errorResponse(res, 'Invalid email or password', 401);
        return;
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        errorResponse(res, 'Invalid email or password', 401);
        return;
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const { passwordHash: _, ...safeUser } = user;
      successResponse(res, { token, user: safeUser });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/me',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isVerified: true,
          isPaid: true,
          profileImageUrl: true,
          createdAt: true,
          applicantProfile: true,
          recruiterProfile: true,
        },
      });
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }
      successResponse(res, user);
    } catch (err) {
      next(err);
    }
  },
);

router.post('/logout', authenticateToken, (_req: Request, res: Response): void => {
  successResponse(res, { message: 'Logged out successfully' });
});

router.put(
  '/change-password',
  authenticateToken,
  validate(ChangePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } =
        req.body as z.infer<typeof ChangePasswordSchema>;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { passwordHash: true },
      });
      if (!user) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      const valid = await comparePassword(currentPassword, user.passwordHash);
      if (!valid) {
        errorResponse(res, 'Current password is incorrect', 400);
        return;
      }

      const newHash = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { passwordHash: newHash },
      });

      successResponse(res, { message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
