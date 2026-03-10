import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role, PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../lib/response';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const PAYMENT_AMOUNTS: Record<Role, number> = {
  [Role.APPLICANT]: 500,
  [Role.RECRUITER]: 5000,
  [Role.ADMIN]: 0,
};

const ConfirmPaymentSchema = z.object({
  paymentId: z.string().min(1),
  cardNumber: z.string().min(12).max(19),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(2024),
  cvv: z.string().length(3),
});

router.post(
  '/initiate',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { isPaid: true, role: true },
      });
      if (user?.isPaid) {
        errorResponse(res, 'Registration fee already paid', 400);
        return;
      }

      const amount = PAYMENT_AMOUNTS[req.user!.role] ?? 0;
      if (amount === 0) {
        errorResponse(res, 'No payment required for this role', 400);
        return;
      }

      const payment = await prisma.payment.create({
        data: { userId: req.user!.id, amount, status: PaymentStatus.PENDING },
      });

      successResponse(res, { payment, amount, currency: 'THB' }, 201);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/confirm',
  authenticateToken,
  validate(ConfirmPaymentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentId, cardNumber } = req.body as z.infer<typeof ConfirmPaymentSchema>;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        select: { id: true, userId: true, status: true, amount: true },
      });
      if (!payment) {
        errorResponse(res, 'Payment not found', 404);
        return;
      }
      if (payment.userId !== req.user!.id) {
        errorResponse(res, 'Not authorized', 403);
        return;
      }
      if (payment.status !== PaymentStatus.PENDING) {
        errorResponse(res, 'Payment is not in pending state', 400);
        return;
      }

      // Mock banking: card ending in "0000" fails, all others succeed
      const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
      const isSuccess = lastFour !== '0000';

      if (isSuccess) {
        const transactionRef = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16);
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: PaymentStatus.COMPLETED,
              transactionRef,
              paymentMethod: 'CARD',
              paidAt: new Date(),
            },
          }),
          prisma.user.update({
            where: { id: req.user!.id },
            data: { isPaid: true },
          }),
        ]);
        successResponse(res, { status: 'COMPLETED', transactionRef, amount: payment.amount });
      } else {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        });
        errorResponse(res, 'Payment declined by bank. Please try a different card.', 402);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/history',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      successResponse(res, payments);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/all',
  authenticateToken,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10));
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '20'), 10)));

      const [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count(),
      ]);
      paginatedResponse(res, payments, total, page, limit);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
