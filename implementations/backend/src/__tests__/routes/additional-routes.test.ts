import request from 'supertest';
import { Role, PaymentStatus, ConferenceStatus, InterviewStatus, InterviewType } from '@prisma/client';
import app from '../../app';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    bookmark: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    applicantProfile: {
      upsert: jest.fn(),
    },
    recruiterProfile: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    conference: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conferenceParticipant: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    interview: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../lib/jwt');

const { prisma } = require('../../lib/prisma');
const jwtLib = require('../../lib/jwt');

const mockPrisma = prisma as any;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('Backend route coverage tests', () => {
  describe('Bookmarks routes', () => {
    const applicantToken = 'applicant.token';
    const applicantPayload = { id: 'applicant-1', email: 'a@b.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('creates a bookmark when job exists', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1' });
      mockPrisma.bookmark.upsert.mockResolvedValue({ id: 'bm-1', jobId: 'job-1', applicantId: applicantPayload.id });

      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ jobId: 'job-1' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.bookmark.upsert).toHaveBeenCalled();
    });

    it('returns 404 when job does not exist', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ jobId: 'missing' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('lists bookmarks with pagination', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'bm-1' }], 1]);
      const res = await request(app)
        .get('/api/bookmarks?page=1&limit=5')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns bookmark status', async () => {
      mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 'bm-1' });
      const res = await request(app)
        .get('/api/bookmarks/check/job-1')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookmarked).toBe(true);
    });
  });

  describe('Reports routes', () => {
    const adminToken = 'admin.token';
    const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(adminPayload);
    });

    it('returns summary report', async () => {
      mockPrisma.$transaction.mockResolvedValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 1234 } });

      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.total).toBe(6);
      expect(res.body.data.payments.revenue).toBe(1234);
    });

    it('returns job reports', async () => {
      mockPrisma.job.findMany.mockResolvedValue([{ id: 'j1' }]);
      mockPrisma.job.groupBy.mockResolvedValue([{ jobType: 'FULL_TIME', _count: { id: 1 } }]);

      const res = await request(app)
        .get('/api/reports/jobs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.topViewed).toHaveLength(1);
    });
  });

  describe('Verifications routes', () => {
    const userToken = 'user.token';
    const userPayload = { id: 'user-1', email: 'user@x.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(userPayload);
    });

    function makeValidThaiId() {
      const base = '123456789012';
      const digits = base.split('').map(Number);
      const sum = digits.reduce((acc, digit, idx) => acc + digit * (13 - idx), 0);
      const check = (11 - (sum % 11)) % 10;
      return base + check.toString();
    }

    it('returns failed verification when ID is invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isVerified: false });
      mockPrisma.verification.upsert.mockResolvedValue({ status: 'FAILED' });

      const res = await request(app)
        .post('/api/verifications/verify-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ citizenId: '0000000000000' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('FAILED');
    });

    it('verifies valid ID and updates user', async () => {
      const validId = makeValidThaiId();
      mockPrisma.user.findUnique.mockResolvedValue({ isVerified: false });
      mockPrisma.verification.upsert.mockResolvedValue({ status: 'VERIFIED' });
      mockPrisma.user.update.mockResolvedValue({ isVerified: true });

      const res = await request(app)
        .post('/api/verifications/verify-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ citizenId: validId });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('VERIFIED');
    });

    it('returns verification status', async () => {
      mockPrisma.verification.findUnique.mockResolvedValue({ status: 'VERIFIED' });
      mockPrisma.user.findUnique.mockResolvedValue({ isVerified: true });

      const res = await request(app)
        .get('/api/verifications/status')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isVerified).toBe(true);
    });
  });

  describe('Recommendations routes', () => {
    const applicantToken = 'applicant.token';
    const applicantPayload = { id: 'applicant-1', email: 'a@b.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('returns 402 when user has not paid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isPaid: false, applicantProfile: { skills: ['TypeScript'] } });
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(402);
    });

    it('returns recommendations when paid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isPaid: true, applicantProfile: { skills: ['TypeScript'] } });
      mockPrisma.application.findMany.mockResolvedValue([{ jobId: 'job-1' }]);
      mockPrisma.job.findMany.mockResolvedValue([{ id: 'job-2', skills: ['TypeScript'], jobType: 'FULL_TIME' }]);

      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 404 for similar job when job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/recommendations/similar/does-not-exist');

      expect(res.status).toBe(404);
    });
  });

  describe('Payments routes', () => {
    const applicantToken = 'applicant.token';
    const applicantPayload = { id: 'applicant-1', email: 'a@b.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('prevents payment initiate if user not ready', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isPaid: false, role: Role.APPLICANT });
      mockPrisma.application.count.mockResolvedValue(0);

      const res = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(403);
    });

    it('creates payment when ready and has accepted application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isPaid: false, role: Role.APPLICANT });
      mockPrisma.application.count.mockResolvedValue(1);
      mockPrisma.payment.create.mockResolvedValue({ id: 'p1', amount: 500 });

      const res = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.payment.id).toBe('p1');
    });

    it('declines payment when card ends in 0000', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 'p1', userId: applicantPayload.id, status: PaymentStatus.PENDING, amount: 500 });

      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ paymentId: 'p1', cardNumber: '4111111111110000', expiryMonth: 12, expiryYear: 2025, cvv: '123' });

      expect(res.status).toBe(402);
      expect(res.body.success).toBe(false);
    });

    it('confirms payment when card is valid', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 'p1', userId: applicantPayload.id, status: PaymentStatus.PENDING, amount: 500 });
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ paymentId: 'p1', cardNumber: '4111111111111234', expiryMonth: 12, expiryYear: 2025, cvv: '123' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('returns payment history', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([{ id: 'p1' }]);
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Conference routes', () => {
    const userToken = 'user.token';
    const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(userPayload);
    });

    it('creates a new conference room', async () => {
      mockPrisma.conference.findUnique.mockResolvedValue(null);
      mockPrisma.conference.create.mockResolvedValue({ id: 'conf-1', roomCode: 'ROOMCODE' });

      const res = await request(app)
        .post('/api/conference/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Demo room' });

      expect(res.status).toBe(201);
      expect(res.body.data.roomCode).toBe('ROOMCODE');
    });

    it('joins a conference room', async () => {
      mockPrisma.conference.findUnique.mockResolvedValue({ id: 'conf-1', roomCode: 'ROOMCODE', status: ConferenceStatus.WAITING });
      mockPrisma.conferenceParticipant.upsert.mockResolvedValue({});
      mockPrisma.conference.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/conference/rooms/ROOMCODE/join')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('joined');
    });

    it('leaves a conference room and ends when no one left', async () => {
      mockPrisma.conference.findUnique.mockResolvedValue({ id: 'conf-1', roomCode: 'ROOMCODE', participants: [{ userId: 'user-1' }] });
      mockPrisma.conferenceParticipant.updateMany.mockResolvedValue({});
      mockPrisma.conference.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/conference/rooms/ROOMCODE/leave')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('left');
    });
  });

  describe('Users routes', () => {
    const userToken = 'user.token';
    const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(userPayload);
    });

    it('returns profile and handles missing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      let res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);

      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1' });
      res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('updates applicant profile', async () => {
      mockPrisma.$transaction.mockResolvedValue([{ id: 'user-1', email: 'u@x.com' }]);
      mockPrisma.applicantProfile.upsert = jest.fn().mockResolvedValue({});

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ firstName: 'Updated' });

      expect(res.status).toBe(200);
    });

    it('gets user by id and returns 404 when missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      let res = await request(app).get('/api/users/does-not-exist');
      expect(res.status).toBe(404);

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      res = await request(app).get('/api/users/user-1');
      expect(res.status).toBe(200);
    });
  });

  describe('Interviews routes', () => {
    const recruiterToken = 'recruiter.token';
    const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('creates interview for recruiter with authorization checks', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'app-1', job: { recruiterId: 'rec-1' } });
      mockPrisma.interview.create.mockResolvedValue({ id: 'int-1' });
      mockPrisma.application.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ applicationId: 'app-1', scheduledAt: new Date().toISOString(), type: InterviewType.VIDEO });

      expect(res.status).toBe(201);
    });

    it('returns interview not found', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/interviews/does-not-exist')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(404);
    });

    it('updates and cancels interview', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue({ id: 'int-1', application: { job: { recruiterId: 'rec-1' } } });
      mockPrisma.interview.update.mockResolvedValue({ id: 'int-1' });

      let res = await request(app)
        .put('/api/interviews/int-1')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: InterviewStatus.SCHEDULED });
      expect(res.status).toBe(200);

      res = await request(app)
        .delete('/api/interviews/int-1')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Chat routes', () => {
    const userToken = 'user.token';
    const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(userPayload);
    });

    it('sends a chat message and returns bot response', async () => {
      mockPrisma.message.create
        .mockResolvedValueOnce({ id: 'm1', content: 'hi' })
        .mockResolvedValueOnce({ id: 'm2', content: 'Hello' });

      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'hi', sessionId: 's1' });

      expect(res.status).toBe(200);
      expect(res.body.data.userMessage.content).toBe('hi');
    });

    it('returns support status', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-03-11T08:00:00Z'));
      const res = await request(app).get('/api/chat/support-status');
      expect(res.status).toBe(200);
      expect(res.body.data.available).toBe(true);
      jest.useRealTimers();
    });
  });
});
