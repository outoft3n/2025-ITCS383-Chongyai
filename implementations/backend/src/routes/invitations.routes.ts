import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, InvitationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const SendInvitationSchema = z.object({
  applicantId: z.string().min(1),
  jobId: z.string().min(1),
  message: z.string().max(1000).optional(),
});

const RespondInvitationSchema = z.object({
  status: z.enum([InvitationStatus.ACCEPTED, InvitationStatus.REJECTED]),
});

// Send invitation - RECRUITER only
router.post(
  '/',
  authenticateToken,
  requireRole(Role.RECRUITER),
  validate(SendInvitationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicantId, jobId, message } = req.body as z.infer<typeof SendInvitationSchema>;

      const job = await prisma.job.findUnique({ where: { id: jobId, isActive: true } });
      if (!job) {
        errorResponse(res, 'Job not found or inactive', 404);
        return;
      }
      if (job.recruiterId !== req.user!.id) {
        errorResponse(res, 'Not authorized to invite for this job', 403);
        return;
      }

      const applicant = await prisma.user.findUnique({
        where: { id: applicantId, role: Role.APPLICANT },
      });
      if (!applicant) {
        errorResponse(res, 'Applicant not found', 404);
        return;
      }

      const existing = await prisma.invitation.findUnique({
        where: { recruiterId_applicantId_jobId: { recruiterId: req.user!.id, applicantId, jobId } },
      });
      if (existing) {
        errorResponse(res, 'Invitation already sent', 409);
        return;
      }

      const invitation = await prisma.invitation.create({
        data: { recruiterId: req.user!.id, applicantId, jobId, message },
        include: {
          applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
          job: { select: { id: true, title: true, location: true } },
        },
      });
      successResponse(res, invitation, 201);
    } catch (err) {
      next(err);
    }
  },
);

// Get sent invitations - RECRUITER only
router.get(
  '/sent',
  authenticateToken,
  requireRole(Role.RECRUITER),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));
      const status = req.query.status as InvitationStatus | undefined;

      const where = {
        recruiterId: req.user!.id,
        ...(status && { status }),
      };

      const [invitations, total] = await prisma.$transaction([
        prisma.invitation.findMany({
          where,
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
                applicantProfile: { select: { skills: true, experience: true, education: true } },
              },
            },
            job: { select: { id: true, title: true, location: true, jobType: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.invitation.count({ where }),
      ]);

      paginatedResponse(res, invitations, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

// Get received invitations - APPLICANT only
router.get(
  '/received',
  authenticateToken,
  requireRole(Role.APPLICANT),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));
      const status = req.query.status as InvitationStatus | undefined;

      const where = {
        applicantId: req.user!.id,
        ...(status && { status }),
      };

      const [invitations, total] = await prisma.$transaction([
        prisma.invitation.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            recruiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                recruiterProfile: { select: { companyName: true, industry: true } },
              },
            },
            job: { select: { id: true, title: true, location: true, jobType: true, salaryMin: true, salaryMax: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.invitation.count({ where }),
      ]);

      paginatedResponse(res, invitations, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

// Accept or reject an invitation - APPLICANT only
router.put(
  '/:id/respond',
  authenticateToken,
  requireRole(Role.APPLICANT),
  validate(RespondInvitationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: req.params.id },
      });
      if (!invitation) {
        errorResponse(res, 'Invitation not found', 404);
        return;
      }
      if (invitation.applicantId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }
      if (invitation.status !== InvitationStatus.PENDING) {
        errorResponse(res, 'Invitation already responded to', 409);
        return;
      }

      const { status } = req.body as z.infer<typeof RespondInvitationSchema>;

      const updated = await prisma.invitation.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          job: { select: { id: true, title: true, location: true } },
          recruiter: { select: { id: true, firstName: true, lastName: true, recruiterProfile: { select: { companyName: true } } } },
        },
      });

      // On acceptance, create an application if one doesn't exist
      if (status === InvitationStatus.ACCEPTED) {
        const existing = await prisma.application.findUnique({
          where: { applicantId_jobId: { applicantId: req.user!.id, jobId: invitation.jobId } },
        });
        if (!existing) {
          await prisma.application.create({
            data: {
              applicantId: req.user!.id,
              jobId: invitation.jobId,
              status: 'REVIEWING',
            },
          });
        }
      }

      successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
