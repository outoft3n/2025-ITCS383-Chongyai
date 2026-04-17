import { Router, Request, Response, NextFunction } from 'express';
import { JobType, Role, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { successResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/jobs',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const q = req.query.q as string | undefined;
      const jobType = req.query.jobType as JobType | undefined;
      const location = req.query.location as string | undefined;
      const salaryMin = req.query.salaryMin ? Number.parseInt(String(req.query.salaryMin), 10) : undefined;
      const salaryMax = req.query.salaryMax ? Number.parseInt(String(req.query.salaryMax), 10) : undefined;
      const skillsParam = req.query.skills as string | undefined;
      const skills = skillsParam ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

      const where: Prisma.JobWhereInput = {
        isActive: true,
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { requirements: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(jobType && { jobType }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
        ...(salaryMin !== undefined && { salaryMax: { gte: salaryMin } }),
        ...(salaryMax !== undefined && { salaryMin: { lte: salaryMax } }),
        ...(skills && skills.length > 0 && { skills: { hasSome: skills } }),
      };

      const [jobs, total] = await prisma.$transaction([
        prisma.job.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            recruiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                recruiterProfile: { select: { companyName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.job.count({ where }),
      ]);

      paginatedResponse(res, jobs, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/suggestions',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = req.query.q as string | undefined;
      if (!q || q.trim().length === 0) {
        successResponse(res, []);
        return;
      }

      const jobs = await prisma.job.findMany({
        where: {
          isActive: true,
          title: { contains: q, mode: 'insensitive' },
        },
        select: { id: true, title: true },
        take: 10,
        distinct: ['title'],
      });

      successResponse(res, jobs);
    } catch (err) {
      next(err);
    }
  },
);

// Search applicants - RECRUITER/ADMIN only
router.get(
  '/applicants',
  authenticateToken,
  requireRole(Role.RECRUITER, Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const q = req.query.q as string | undefined;
      const location = req.query.location as string | undefined;
      const skillsParam = req.query.skills as string | undefined;
      const skills = skillsParam ? skillsParam.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
      const education = req.query.education as string | undefined;
      const experience = req.query.experience as string | undefined;

      const where: Prisma.UserWhereInput = {
        role: Role.APPLICANT,
        isPaid: true,
        ...(q && {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }),
        applicantProfile: {
          ...(location && { preferredLocation: { contains: location, mode: 'insensitive' } }),
          ...(skills && skills.length > 0 && { skills: { hasSome: skills } }),
          ...(education && { education: { contains: education, mode: 'insensitive' } }),
          ...(experience && { experience: { contains: experience, mode: 'insensitive' } }),
        },
      };

      const [applicants, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
            createdAt: true,
            applicantProfile: {
              select: {
                skills: true,
                experience: true,
                education: true,
                preferredLocation: true,
                preferredSalaryMin: true,
                preferredSalaryMax: true,
                resumeUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      paginatedResponse(res, applicants, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
