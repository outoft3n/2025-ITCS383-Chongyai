import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, JobType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const CreateJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  requirements: z.string().min(10),
  location: z.string().min(1),
  jobType: z.nativeEnum(JobType),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  skills: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});

const UpdateJobSchema = CreateJobSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [jobs, total] = await prisma.$transaction([
        prisma.job.findMany({
          where: { isActive: true },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            recruiter: {
              select: { id: true, firstName: true, lastName: true, recruiterProfile: { select: { companyName: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.job.count({ where: { isActive: true } }),
      ]);

      paginatedResponse(res, jobs, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/recruiter/mine',
  authenticateToken,
  requireRole(Role.RECRUITER),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [jobs, total] = await prisma.$transaction([
        prisma.job.findMany({
          where: { recruiterId: req.user!.id },
          skip: (page - 1) * limit,
          take: limit,
          include: { _count: { select: { applications: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.job.count({ where: { recruiterId: req.user!.id } }),
      ]);

      paginatedResponse(res, jobs, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
        include: {
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              recruiterProfile: { select: { companyName: true, industry: true, website: true, companyDescription: true } },
            },
          },
          _count: { select: { applications: true } },
        },
      });

      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }

      // Increment view count
      await prisma.job.update({
        where: { id: req.params.id },
        data: { viewCount: { increment: 1 } },
      });

      successResponse(res, { ...job, viewCount: job.viewCount + 1 });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/',
  authenticateToken,
  requireRole(Role.RECRUITER),
  validate(CreateJobSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user!.id) {
        errorResponse(res, 'User not found', 404);
        return;
      }

      const data = req.body as z.infer<typeof CreateJobSchema>;
      const job = await prisma.job.create({
        data: {
          ...data,
          recruiterId: req.user!.id,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        },
      });
      successResponse(res, job, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({ where: { id: req.params.id } });
      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized to edit this job', 403);
        return;
      }

      const parsed = UpdateJobSchema.safeParse(req.body);
      if (!parsed.success) {
        errorResponse(res, parsed.error.errors[0]?.message ?? 'Validation failed', 422);
        return;
      }

      const { expiresAt, ...rest } = parsed.data;
      const updated = await prisma.job.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
        },
      });
      successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({ where: { id: req.params.id } });
      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized to delete this job', 403);
        return;
      }

      await prisma.job.update({ where: { id: req.params.id }, data: { isActive: false } });
      successResponse(res, { message: 'Job deactivated' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
