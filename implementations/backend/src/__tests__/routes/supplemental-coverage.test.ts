import request from 'supertest';
import { Role, ConferenceStatus, ApplicationStatus } from '@prisma/client';
import app from '../../app';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    conference: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conferenceParticipant: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
    interview: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../lib/jwt');
jest.mock('../../lib/password');

const { prisma } = require('../../lib/prisma');
const jwtLib = require('../../lib/jwt');
const passwordLib = require('../../lib/password');

const mockPrisma = prisma as any;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;
const mockComparePassword = passwordLib.comparePassword as jest.Mock;
const mockHashPassword = passwordLib.hashPassword as jest.Mock;

const applicantPayload = { id: 'app-1', email: 'a@x.com', role: Role.APPLICANT };
const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };
const adminPayload = { id: 'admin-1', email: 'admin@x.com', role: Role.ADMIN };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

// ─── Auth: PUT /change-password ───────────────────────────────────────────────

describe('PUT /api/auth/change-password', () => {
  const validBody = { currentPassword: 'oldpass123', newPassword: 'newpass456' };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(applicantPayload);
  });

  it('changes password successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: 'hashed-old' });
    mockComparePassword.mockResolvedValue(true);
    mockHashPassword.mockResolvedValue('hashed-new');
    mockPrisma.user.update.mockResolvedValue({});

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', 'Bearer app.token')
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Password changed successfully');
    expect(mockPrisma.user.update).toHaveBeenCalled();
  });

  it('returns 404 when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', 'Bearer app.token')
      .send(validBody);

    expect(res.status).toBe(404);
  });

  it('returns 400 when current password is incorrect', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: 'hashed-old' });
    mockComparePassword.mockResolvedValue(false);

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', 'Bearer app.token')
      .send(validBody);

    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid body (short new password)', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', 'Bearer app.token')
      .send({ currentPassword: 'oldpass123', newPassword: 'short' });

    expect(res.status).toBe(422);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send(validBody);

    expect(res.status).toBe(401);
  });
});

// ─── Conference: edge cases ───────────────────────────────────────────────────

describe('Conference routes – edge cases', () => {
  const userPayload = { id: 'user-1', email: 'u@x.com', role: Role.APPLICANT };

  beforeEach(() => {
    mockVerifyToken.mockReturnValue(userPayload);
  });

  it('returns 400 when joining an ENDED room', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue({
      id: 'conf-1',
      roomCode: 'ENDEDROOM',
      status: ConferenceStatus.ENDED,
    });

    const res = await request(app)
      .post('/api/conference/rooms/ENDEDROOM/join')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(400);
  });

  it('returns 404 when leaving a room that does not exist', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/conference/rooms/NOROOM/leave')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(404);
  });

  it('joins ACTIVE room without updating status to ACTIVE again', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue({
      id: 'conf-1',
      roomCode: 'ACTIVEROOM',
      status: ConferenceStatus.ACTIVE,
    });
    mockPrisma.conferenceParticipant.upsert.mockResolvedValue({});

    const res = await request(app)
      .post('/api/conference/rooms/ACTIVEROOM/join')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(mockPrisma.conference.update).not.toHaveBeenCalled();
  });

  it('creates room with interviewId and links to interview', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue(null);
    mockPrisma.conference.create.mockResolvedValue({ id: 'conf-1', roomCode: 'NEWROOM' });
    mockPrisma.interview.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/conference/rooms')
      .set('Authorization', 'Bearer user.token')
      .send({ title: 'Interview Room', interviewId: 'int-1' });

    expect(res.status).toBe(201);
    expect(mockPrisma.interview.update).toHaveBeenCalledWith({
      where: { id: 'int-1' },
      data: { conferenceId: 'conf-1' },
    });
  });

  it('leaves room with other participants still active (does not end conference)', async () => {
    mockPrisma.conference.findUnique.mockResolvedValue({
      id: 'conf-1',
      roomCode: 'ROOM1',
      participants: [
        { userId: 'user-1', leftAt: null },
        { userId: 'user-2', leftAt: null },
      ],
    });
    mockPrisma.conferenceParticipant.updateMany.mockResolvedValue({});

    const res = await request(app)
      .post('/api/conference/rooms/ROOM1/leave')
      .set('Authorization', 'Bearer user.token');

    expect(res.status).toBe(200);
    expect(mockPrisma.conference.update).not.toHaveBeenCalled();
  });
});

// ─── Applications: missing endpoints ─────────────────────────────────────────

describe('Applications routes – extended coverage', () => {
  describe('GET /api/applications/applicant/:id (recruiter/admin)', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns applications for a specific applicant', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'app-1' }, { id: 'app-2' }], 2]);

      const res = await request(app)
        .get('/api/applications/applicant/user-1')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(2);
    });

    it('returns empty list when applicant has no applications', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app)
        .get('/api/applications/applicant/user-no-apps')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(0);
    });

    it('returns 403 for applicant role', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);

      const res = await request(app)
        .get('/api/applications/applicant/user-1')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/applications/job/:jobId', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns 403 when recruiter does not own the job', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', recruiterId: 'other-rec' });

      const res = await request(app)
        .get('/api/applications/job/job-1')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/applications/:id', () => {
    it('returns 403 when user does not own or manage the application', async () => {
      mockVerifyToken.mockReturnValue({ id: 'stranger', email: 's@x.com', role: Role.APPLICANT });
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        applicantId: 'app-1',
        job: { recruiter: { id: 'rec-1' } },
      });

      const res = await request(app)
        .get('/api/applications/app-1')
        .set('Authorization', 'Bearer stranger.token');

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('returns 400 when application is not in APPLIED status', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        applicantId: 'app-1',
        status: ApplicationStatus.INTERVIEWING,
      });

      const res = await request(app)
        .delete('/api/applications/app-1')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(400);
    });

    it('withdraws application successfully when in APPLIED status', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        applicantId: 'app-1',
        status: ApplicationStatus.APPLIED,
      });
      mockPrisma.application.delete.mockResolvedValue({});

      const res = await request(app)
        .delete('/api/applications/app-1')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(200);
    });

    it('returns 403 when applicant does not own the application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-1',
        applicantId: 'other-app',
        status: ApplicationStatus.APPLIED,
      });

      const res = await request(app)
        .delete('/api/applications/app-1')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(403);
    });
  });
});
