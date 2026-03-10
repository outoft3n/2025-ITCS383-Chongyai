import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, ApplicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const CreateApplicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

router.post(
  '/',
  authenticateToken,
  requireRole(Role.APPLICANT),
  validate(CreateApplicationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicantUser = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { isPaid: true },
      });
      if (!applicantUser?.isPaid) {
        errorResponse(res, 'Payment required to apply for jobs', 402);
        return;
      }

      const { jobId, coverLetter } = req.body as z.infer<typeof CreateApplicationSchema>;

      const job = await prisma.job.findUnique({ where: { id: jobId, isActive: true } });
      if (!job) {
        errorResponse(res, 'Job not found or inactive', 404);
        return;
      }

      const existing = await prisma.application.findUnique({
        where: { applicantId_jobId: { applicantId: req.user!.id, jobId } },
      });
      if (existing) {
        errorResponse(res, 'Already applied to this job', 409);
        return;
      }

      const application = await prisma.application.create({
        data: { applicantId: req.user!.id, jobId, coverLetter },
        include: { job: { select: { title: true, location: true } } },
      });
      successResponse(res, application, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/mine',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [applications, total] = await prisma.$transaction([
        prisma.application.findMany({
          where: { applicantId: req.user!.id },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                location: true,
                jobType: true,
                recruiter: { select: { recruiterProfile: { select: { companyName: true } } } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.application.count({ where: { applicantId: req.user!.id } }),
      ]);
      paginatedResponse(res, applications, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/job/:jobId',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }

      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [applications, total] = await prisma.$transaction([
        prisma.application.findMany({
          where: { jobId: req.params.jobId },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
                applicantProfile: { select: { skills: true, experience: true, resumeUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.application.count({ where: { jobId: req.params.jobId } }),
      ]);
      paginatedResponse(res, applications, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/applicant/:id',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [applications, total] = await prisma.$transaction([
        prisma.application.findMany({
          where: { applicantId: req.params.id },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                location: true,
                jobType: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.application.count({ where: { applicantId: req.params.id } }),
      ]);
      paginatedResponse(res, applications, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: {
          job: { include: { recruiter: { select: { id: true, recruiterProfile: { select: { companyName: true } } } } } },
          applicant: { select: { id: true, firstName: true, lastName: true, email: true, applicantProfile: true } },
        },
      });
      if (!application) {
        errorResponse(res, 'Application not found', 404);
        return;
      }

      const { role, id } = req.user!;
      const isApplicant = role === Role.APPLICANT && application.applicantId === id;
      const isRecruiter = role === Role.RECRUITER && application.job.recruiter.id === id;
      const isAdmin = role === Role.ADMIN;

      if (!isApplicant && !isRecruiter && !isAdmin) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }
      successResponse(res, application);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id/status',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  validate(UpdateStatusSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: req.params.id },
        include: { job: { select: { recruiterId: true } } },
      });
      if (!application) {
        errorResponse(res, 'Application not found', 404);
        return;
      }
      if (req.user!.role === Role.RECRUITER && application.job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }

      const updated = await prisma.application.update({
        where: { id: req.params.id },
        data: { status: req.body.status as ApplicationStatus },
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
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const application = await prisma.application.findUnique({
        where: { id: req.params.id },
        select: { applicantId: true, status: true },
      });
      if (!application) {
        errorResponse(res, 'Application not found', 404);
        return;
      }
      if (application.applicantId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }
      if (application.status !== ApplicationStatus.APPLIED) {
        errorResponse(res, 'Cannot withdraw application at this stage', 400);
        return;
      }
      await prisma.application.delete({ where: { id: req.params.id } });
      successResponse(res, { message: 'Application withdrawn' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
