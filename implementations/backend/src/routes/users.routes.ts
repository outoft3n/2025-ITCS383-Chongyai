import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const UpdateApplicantSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  preferredLocation: z.string().optional(),
  preferredSalaryMin: z.number().int().positive().optional(),
  preferredSalaryMax: z.number().int().positive().optional(),
});

const UpdateRecruiterSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  companyName: z.string().min(1).optional(),
  companyDescription: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
});

router.get(
  '/profile',
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
          updatedAt: true,
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

router.put(
  '/profile',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role, id } = req.user!;

      if (role === Role.APPLICANT) {
        const parsed = UpdateApplicantSchema.safeParse(req.body);
        if (!parsed.success) {
          errorResponse(res, parsed.error.errors[0]?.message ?? 'Validation failed', 422);
          return;
        }
        const {
          firstName,
          lastName,
          phone,
          profileImageUrl,
          resumeUrl,
          skills,
          experience,
          education,
          preferredLocation,
          preferredSalaryMin,
          preferredSalaryMax,
        } = parsed.data;

        const [user] = await prisma.$transaction([
          prisma.user.update({
            where: { id },
            data: { firstName, lastName, phone, profileImageUrl },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, isVerified: true, isPaid: true },
          }),
        ]);

        await prisma.applicantProfile.upsert({
          where: { userId: id },
          update: { resumeUrl, skills, experience, education, preferredLocation, preferredSalaryMin, preferredSalaryMax },
          create: { userId: id, resumeUrl, skills: skills ?? [], experience, education, preferredLocation, preferredSalaryMin, preferredSalaryMax },
        });

        successResponse(res, user);
      } else if (role === Role.RECRUITER) {
        const parsed = UpdateRecruiterSchema.safeParse(req.body);
        if (!parsed.success) {
          errorResponse(res, parsed.error.errors[0]?.message ?? 'Validation failed', 422);
          return;
        }
        const { firstName, lastName, phone, profileImageUrl, companyName, companyDescription, website, industry } = parsed.data;

        const [user] = await prisma.$transaction([
          prisma.user.update({
            where: { id },
            data: { firstName, lastName, phone, profileImageUrl },
            select: { id: true, email: true, role: true, firstName: true, lastName: true, isVerified: true, isPaid: true },
          }),
        ]);

        await prisma.recruiterProfile.upsert({
          where: { userId: id },
          update: { companyName, companyDescription, website, industry },
          create: { userId: id, companyName: companyName ?? 'My Company', companyDescription, website, industry },
        });

        successResponse(res, user);
      } else {
        const { firstName, lastName, phone, profileImageUrl } = req.body as Record<string, string>;
        const user = await prisma.user.update({
          where: { id },
          data: { firstName, lastName, phone, profileImageUrl },
          select: { id: true, email: true, role: true, firstName: true, lastName: true },
        });
        successResponse(res, user);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          id: true,
          role: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          createdAt: true,
          recruiterProfile: {
            select: { companyName: true, industry: true, website: true, companyDescription: true },
          },
          applicantProfile: true,
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

router.get(
  '/',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));
      const role = req.query.role as Role | undefined;

      const where = role ? { role } : {};
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            isVerified: true,
            isPaid: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      paginatedResponse(res, users, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      successResponse(res, { message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
