import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const CreateBookmarkSchema = z.object({
  jobId: z.string().min(1),
});

router.post(
  '/',
  authenticateToken,
  requireRole(Role.APPLICANT),
  validate(CreateBookmarkSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.body as z.infer<typeof CreateBookmarkSchema>;

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) {
        errorResponse(res, 'Job not found', 404);
        return;
      }

      const bookmark = await prisma.bookmark.upsert({
        where: { applicantId_jobId: { applicantId: req.user!.id, jobId } },
        update: {},
        create: { applicantId: req.user!.id, jobId },
      });
      successResponse(res, bookmark, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:jobId',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: { applicantId_jobId: { applicantId: req.user!.id, jobId: req.params.jobId } },
      });
      if (!bookmark) {
        errorResponse(res, 'Bookmark not found', 404);
        return;
      }
      await prisma.bookmark.delete({
        where: { applicantId_jobId: { applicantId: req.user!.id, jobId: req.params.jobId } },
      });
      successResponse(res, { message: 'Bookmark removed' });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [bookmarks, total] = await prisma.$transaction([
        prisma.bookmark.findMany({
          where: { applicantId: req.user!.id },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            job: {
              include: {
                recruiter: { select: { recruiterProfile: { select: { companyName: true } } } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.bookmark.count({ where: { applicantId: req.user!.id } }),
      ]);
      paginatedResponse(res, bookmarks, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/check/:jobId',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: { applicantId_jobId: { applicantId: req.user!.id, jobId: req.params.jobId } },
      });
      successResponse(res, { bookmarked: bookmark !== null });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
