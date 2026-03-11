import { ConferenceStatus } from '@prisma/client';
import { NextFunction, Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { errorResponse, successResponse } from '../lib/response';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const CreateRoomSchema = z.object({
  title: z.string().min(1),
  interviewId: z.string().optional(),
});

function generateRoomCode(): string {
  return uuidv4().replaceAll(/-/g, '').toUpperCase().slice(0, 8);
}

router.post(
  '/rooms',
  authenticateToken,
  validate(CreateRoomSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, interviewId } = req.body as z.infer<typeof CreateRoomSchema>;

      let roomCode = generateRoomCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prisma.conference.findUnique({ where: { roomCode } });
        if (!existing) break;
        roomCode = generateRoomCode();
        attempts++;
      }

      const conference = await prisma.conference.create({
        data: { roomCode, title, status: ConferenceStatus.WAITING },
      });

      if (interviewId) {
        await prisma.interview.update({
          where: { id: interviewId },
          data: { conferenceId: conference.id },
        }).catch(() => undefined);
      }

      successResponse(res, conference, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/rooms/mine',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conferences = await prisma.conference.findMany({
        where: { participants: { some: { userId: req.user!.id } } },
        include: { participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      successResponse(res, conferences);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/rooms/:roomCode',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conference = await prisma.conference.findUnique({
        where: { roomCode: req.params.roomCode },
        include: {
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, profileImageUrl: true } },
            },
          },
        },
      });
      if (!conference) {
        errorResponse(res, 'Conference room not found', 404);
        return;
      }
      successResponse(res, conference);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/rooms/:roomCode/join',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conference = await prisma.conference.findUnique({
        where: { roomCode: req.params.roomCode },
      });
      if (!conference) {
        errorResponse(res, 'Conference room not found', 404);
        return;
      }
      if (conference.status === ConferenceStatus.ENDED) {
        errorResponse(res, 'Conference has ended', 400);
        return;
      }

      await prisma.conferenceParticipant.upsert({
        where: { conferenceId_userId: { conferenceId: conference.id, userId: req.user!.id } },
        update: { joinedAt: new Date(), leftAt: null },
        create: { conferenceId: conference.id, userId: req.user!.id, joinedAt: new Date() },
      });

      if (conference.status === ConferenceStatus.WAITING) {
        await prisma.conference.update({
          where: { id: conference.id },
          data: { status: ConferenceStatus.ACTIVE, startedAt: new Date() },
        });
      }

      successResponse(res, { roomCode: req.params.roomCode, status: 'joined' });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/rooms/:roomCode/leave',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conference = await prisma.conference.findUnique({
        where: { roomCode: req.params.roomCode },
        include: { participants: { where: { leftAt: null } } },
      });
      if (!conference) {
        errorResponse(res, 'Conference room not found', 404);
        return;
      }

      await prisma.conferenceParticipant.updateMany({
        where: { conferenceId: conference.id, userId: req.user!.id },
        data: { leftAt: new Date() },
      });

      const remainingActive = conference.participants.filter(
        (p) => p.userId !== req.user!.id,
      ).length;

      if (remainingActive === 0) {
        await prisma.conference.update({
          where: { id: conference.id },
          data: { status: ConferenceStatus.ENDED, endedAt: new Date() },
        });
      }

      successResponse(res, { roomCode: req.params.roomCode, status: 'left' });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
