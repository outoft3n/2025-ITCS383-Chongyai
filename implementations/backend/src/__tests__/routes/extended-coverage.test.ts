import request from 'supertest';
import { Role, PaymentStatus, ConferenceStatus, InterviewType, InterviewStatus } from '@prisma/client';
import app from '../../app';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
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

// ─── Users routes ─────────────────────────────────────────────────────────────

describe('Users routes – extended coverage', () => {
  describe('PUT /api/users/profile (RECRUITER)', () => {
    const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
      mockPrisma.$transaction.mockResolvedValue([{ id: 'rec-1', email: 'r@x.com' }]);
      mockPrisma.recruiterProfile.upsert.mockResolvedValue({});
    });

    it('updates recruiter profile successfully', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer rec.token')
        .send({ companyName: 'Acme Corp', industry: 'Tech' });

      expect(res.status).toBe(200);
      expect(mockPrisma.recruiterProfile.upsert).toHaveBeenCalled();
    });

    it('returns 422 for invalid recruiter profile data', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer rec.token')
        .send({ website: 'not-a-url' });

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/users/profile (ADMIN)', () => {
    const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(adminPayload);
      mockPrisma.user.update.mockResolvedValue({ id: 'admin-1', email: 'admin@x.com' });
    });

    it('updates admin profile with basic fields', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer admin.token')
        .send({ firstName: 'Admin', lastName: 'User' });

      expect(res.status).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe('GET /api/users (admin list)', () => {
    const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(adminPayload);
    });

    it('returns paginated user list for admin', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'u1' }, { id: 'u2' }], 2]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer admin.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(2);
    });

    it('filters by role query parameter', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'u1' }], 1]);

      const res = await request(app)
        .get('/api/users?role=APPLICANT&page=1&limit=10')
        .set('Authorization', 'Bearer admin.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyToken.mockReturnValue({ id: 'u1', email: 'u@x.com', role: Role.APPLICANT });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer user.token');

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id (admin)', () => {
    const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

    beforeEach(() => {
      mockVerifyToken.mockReturnValue(adminPayload);
      mockPrisma.user.delete.mockResolvedValue({});
    });

    it('deletes user and returns 200', async () => {
      const res = await request(app)
        .delete('/api/users/target-user')
        .set('Authorization', 'Bearer admin.token');

      expect(res.status).toBe(200);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'target-user' } });
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyToken.mockReturnValue({ id: 'u1', email: 'u@x.com', role: Role.RECRUITER });

      const res = await request(app)
        .delete('/api/users/target-user')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(403);
    });
  });
});

// ─── Jobs routes ──────────────────────────────────────────────────────────────

describe('Jobs routes – extended coverage', () => {
  const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };
  const BASE_JOB = { id: 'job-1', title: 'Dev', recruiterId: 'rec-1', isActive: true, viewCount: 0 };

  describe('GET /api/jobs/recruiter/mine', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns recruiter own jobs with pagination', async () => {
      mockPrisma.$transaction.mockResolvedValue([[BASE_JOB], 1]);

      const res = await request(app)
        .get('/api/jobs/recruiter/mine')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns 403 for non-recruiter', async () => {
      mockVerifyToken.mockReturnValue({ id: 'u1', email: 'u@x.com', role: Role.APPLICANT });

      const res = await request(app)
        .get('/api/jobs/recruiter/mine')
        .set('Authorization', 'Bearer user.token');

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('updates job successfully for owner recruiter', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(BASE_JOB);
      mockPrisma.job.update.mockResolvedValue({ ...BASE_JOB, title: 'Senior Dev' });

      const res = await request(app)
        .put('/api/jobs/job-1')
        .set('Authorization', 'Bearer rec.token')
        .send({ title: 'Senior Dev' });

      expect(res.status).toBe(200);
    });

    it('returns 404 when job not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/jobs/no-job')
        .set('Authorization', 'Bearer rec.token')
        .send({ title: 'Test' });

      expect(res.status).toBe(404);
    });

    it('returns 403 when recruiter does not own job', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ ...BASE_JOB, recruiterId: 'other-rec' });

      const res = await request(app)
        .put('/api/jobs/job-1')
        .set('Authorization', 'Bearer rec.token')
        .send({ title: 'Test' });

      expect(res.status).toBe(403);
    });

    it('returns 422 for invalid data', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(BASE_JOB);

      const res = await request(app)
        .put('/api/jobs/job-1')
        .set('Authorization', 'Bearer rec.token')
        .send({ salaryMin: -100 });

      expect(res.status).toBe(422);
    });
  });
});

// ─── Interviews routes ────────────────────────────────────────────────────────

describe('Interviews routes – extended coverage', () => {
  const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };
  const applicantPayload = { id: 'app-1', email: 'a@x.com', role: Role.APPLICANT };
  const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

  describe('POST /api/interviews', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns 404 when application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicationId: 'no-app', scheduledAt: new Date().toISOString(), type: InterviewType.VIDEO });

      expect(res.status).toBe(404);
    });

    it('returns 403 when recruiter does not own the job', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        job: { recruiterId: 'other-rec' },
      });

      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicationId: 'app-1', scheduledAt: new Date().toISOString(), type: InterviewType.VIDEO });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/interviews/mine', () => {
    it('returns interviews for APPLICANT', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);
      mockPrisma.interview.findMany.mockResolvedValue([{ id: 'int-1' }]);

      const res = await request(app)
        .get('/api/interviews/mine')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns interviews for RECRUITER', async () => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
      mockPrisma.interview.findMany.mockResolvedValue([{ id: 'int-2' }]);

      const res = await request(app)
        .get('/api/interviews/mine')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
    });

    it('returns all interviews for ADMIN', async () => {
      mockVerifyToken.mockReturnValue(adminPayload);
      mockPrisma.interview.findMany.mockResolvedValue([{ id: 'int-3' }, { id: 'int-4' }]);

      const res = await request(app)
        .get('/api/interviews/mine')
        .set('Authorization', 'Bearer admin.token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/interviews/:id', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns interview details when found', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue({
        id: 'int-1',
        application: { job: {}, applicant: {} },
      });

      const res = await request(app)
        .get('/api/interviews/int-1')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('int-1');
    });
  });

  describe('PUT /api/interviews/:id', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns 404 when interview not found', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/interviews/no-int')
        .set('Authorization', 'Bearer rec.token')
        .send({ status: InterviewStatus.SCHEDULED });

      expect(res.status).toBe(404);
    });

    it('returns 403 when recruiter does not own interview', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue({
        id: 'int-1',
        application: { job: { recruiterId: 'other-rec' } },
      });

      const res = await request(app)
        .put('/api/interviews/int-1')
        .set('Authorization', 'Bearer rec.token')
        .send({ status: InterviewStatus.SCHEDULED });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/interviews/:id', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns 404 when interview not found', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/interviews/no-int')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(404);
    });

    it('returns 403 when recruiter does not own interview', async () => {
      mockPrisma.interview.findUnique.mockResolvedValue({
        id: 'int-1',
        application: { job: { recruiterId: 'other-rec' } },
      });

      const res = await request(app)
        .delete('/api/interviews/int-1')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(403);
    });
  });
});

// ─── Reports routes ───────────────────────────────────────────────────────────

describe('Reports routes – extended coverage', () => {
  const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(adminPayload);
  });

  it('returns application report grouped by status', async () => {
    mockPrisma.application.groupBy.mockResolvedValue([
      { status: 'PENDING', _count: { id: 5 } },
      { status: 'ACCEPTED', _count: { id: 3 } },
    ]);

    const res = await request(app)
      .get('/api/reports/applications')
      .set('Authorization', 'Bearer admin.token');

    expect(res.status).toBe(200);
    expect(res.body.data.byStatus).toHaveLength(2);
  });

  it('returns user report by role', async () => {
    mockPrisma.user.groupBy.mockResolvedValue([
      { role: 'APPLICANT', _count: { id: 10 } },
    ]);
    mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1' }]);

    const res = await request(app)
      .get('/api/reports/users')
      .set('Authorization', 'Bearer admin.token');

    expect(res.status).toBe(200);
    expect(res.body.data.byRole).toHaveLength(1);
  });

  it('returns payment report by status', async () => {
    mockPrisma.payment.groupBy.mockResolvedValue([
      { status: 'COMPLETED', _count: { id: 8 }, _sum: { amount: 4000 } },
    ]);
    mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 4000 } });

    const res = await request(app)
      .get('/api/reports/payments')
      .set('Authorization', 'Bearer admin.token');

    expect(res.status).toBe(200);
    expect(res.body.data.byStatus).toHaveLength(1);
  });
});

// ─── Payments routes ──────────────────────────────────────────────────────────

describe('Payments routes – extended coverage', () => {
  const applicantPayload = { id: 'app-1', email: 'a@x.com', role: Role.APPLICANT };
  const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

  describe('POST /api/payments/initiate', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('returns 400 when user already paid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ isPaid: true, role: Role.APPLICANT });

      const res = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/payments/confirm', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('returns 404 when payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', 'Bearer app.token')
        .send({ paymentId: 'no-pay', cardNumber: '4111111111111234', expiryMonth: 12, expiryYear: 2025, cvv: '123' });

      expect(res.status).toBe(404);
    });

    it('returns 403 when payment belongs to another user', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'p1',
        userId: 'other-user',
        status: PaymentStatus.PENDING,
        amount: 500,
      });

      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', 'Bearer app.token')
        .send({ paymentId: 'p1', cardNumber: '4111111111111234', expiryMonth: 12, expiryYear: 2025, cvv: '123' });

      expect(res.status).toBe(403);
    });

    it('returns 400 when payment is not pending', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'p1',
        userId: 'app-1',
        status: PaymentStatus.COMPLETED,
        amount: 500,
      });

      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', 'Bearer app.token')
        .send({ paymentId: 'p1', cardNumber: '4111111111111234', expiryMonth: 12, expiryYear: 2025, cvv: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/payments/all (admin)', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(adminPayload);
    });

    it('returns paginated payments for admin', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'p1' }, { id: 'p2' }], 2]);

      const res = await request(app)
        .get('/api/payments/all')
        .set('Authorization', 'Bearer admin.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(2);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);

      const res = await request(app)
        .get('/api/payments/all')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(403);
    });
  });
});

// ─── Bookmarks routes ─────────────────────────────────────────────────────────

describe('Bookmarks routes – extended coverage', () => {
  const applicantPayload = { id: 'app-1', email: 'a@x.com', role: Role.APPLICANT };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(applicantPayload);
  });

  it('deletes a bookmark and returns 200', async () => {
    mockPrisma.bookmark.findUnique.mockResolvedValue({ applicantId: 'app-1', jobId: 'job-1' });
    mockPrisma.bookmark.delete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/bookmarks/job-1')
      .set('Authorization', 'Bearer app.token');

    expect(res.status).toBe(200);
    expect(mockPrisma.bookmark.delete).toHaveBeenCalled();
  });

  it('returns 404 when deleting a bookmark that does not exist', async () => {
    mockPrisma.bookmark.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/bookmarks/job-99')
      .set('Authorization', 'Bearer app.token');

    expect(res.status).toBe(404);
  });

  it('returns false when job is not bookmarked', async () => {
    mockPrisma.bookmark.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/bookmarks/check/job-99')
      .set('Authorization', 'Bearer app.token');

    expect(res.status).toBe(200);
    expect(res.body.data.bookmarked).toBe(false);
  });
});

// ─── Conference routes ────────────────────────────────────────────────────────

describe('Conference routes – extended coverage', () => {
  const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(userPayload);
  });

  it('returns 404 when joining a room that does not exist', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/conference/rooms/NOROOM/join')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(404);
  });

  it('gets mine conference rooms', async () => {
    mockPrisma.conference.findMany.mockResolvedValue([{ id: 'conf-1', roomCode: 'ROOM1' }]);

    const res = await request(app)
      .get('/api/conference/rooms/mine')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('gets a room by roomCode', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue({
      id: 'conf-1',
      roomCode: 'ROOM1',
      participants: [],
    });

    const res = await request(app)
      .get('/api/conference/rooms/ROOM1')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(res.body.data.roomCode).toBe('ROOM1');
  });

  it('returns 404 when room not found by roomCode', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/conference/rooms/NOROOM')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(404);
  });
});

// ─── Chat routes ──────────────────────────────────────────────────────────────

describe('Chat routes – extended coverage', () => {
  const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(userPayload);
  });

  it('returns chat history for a session', async () => {
    mockPrisma.message.findMany.mockResolvedValue([
      { id: 'm1', content: 'hi', isBot: false },
      { id: 'm2', content: 'Hello!', isBot: true },
    ]);

    const res = await request(app)
      .get('/api/chat/history/session-abc')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns list of sessions for user', async () => {
    mockPrisma.message.findMany.mockResolvedValue([
      { sessionId: 'session-1', createdAt: new Date() },
      { sessionId: 'session-2', createdAt: new Date() },
    ]);

    const res = await request(app)
      .get('/api/chat/sessions')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  const botKeywords = [
    { content: 'how to apply for a position', desc: 'apply keyword' },
    { content: 'payment info please', desc: 'payment keyword' },
    { content: 'how to verify my id', desc: 'verify keyword' },
    { content: 'when is my interview', desc: 'interview keyword' },
    { content: 'how to bookmark jobs', desc: 'bookmark keyword' },
    { content: 'forgot my password', desc: 'password keyword' },
    { content: 'hello there', desc: 'hello keyword' },
    { content: 'something completely different', desc: 'default response' },
  ];

  botKeywords.forEach(({ content, desc }) => {
    it(`returns bot response for ${desc}`, async () => {
      mockPrisma.message.create
        .mockResolvedValueOnce({ id: 'm1', content })
        .mockResolvedValueOnce({ id: 'm2', content: 'bot reply' });

      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', 'Bearer user.token')
        .send({ content, sessionId: 'sess-1' });

      expect(res.status).toBe(200);
      expect(res.body.data.userMessage.content).toBe(content);
    });
  });

  it('returns unavailable outside business hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-03-15T20:00:00Z')); // Saturday UTC = weekend
    const res = await request(app).get('/api/chat/support-status');
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
    jest.useRealTimers();
  });
});
