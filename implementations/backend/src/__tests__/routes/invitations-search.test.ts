import request from 'supertest';
import { Role, InvitationStatus } from '@prisma/client';
import app from '../../app';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    job: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    invitation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../lib/jwt');

const { prisma } = require('../../lib/prisma');
const jwtLib = require('../../lib/jwt');

const mockPrisma = prisma as any;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

const recruiterPayload = { id: 'rec-1', email: 'r@x.com', role: Role.RECRUITER };
const applicantPayload = { id: 'app-1', email: 'a@x.com', role: Role.APPLICANT };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

// ─── Invitations routes ───────────────────────────────────────────────────────

describe('Invitations routes', () => {
  describe('POST /api/invitations (send invitation)', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('sends invitation successfully', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', recruiterId: 'rec-1', isActive: true });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'app-1', role: Role.APPLICANT });
      mockPrisma.invitation.findUnique.mockResolvedValue(null);
      mockPrisma.invitation.create.mockResolvedValue({
        id: 'inv-1',
        applicant: { id: 'app-1', firstName: 'A', lastName: 'B', email: 'a@x.com' },
        job: { id: 'job-1', title: 'Dev', location: 'Bangkok' },
      });

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicantId: 'app-1', jobId: 'job-1', message: 'Join us!' });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('inv-1');
    });

    it('returns 404 when job not found or inactive', async () => {
      mockPrisma.job.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicantId: 'app-1', jobId: 'no-job' });

      expect(res.status).toBe(404);
    });

    it('returns 403 when recruiter does not own the job', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', recruiterId: 'other-rec', isActive: true });

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicantId: 'app-1', jobId: 'job-1' });

      expect(res.status).toBe(403);
    });

    it('returns 404 when applicant not found', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', recruiterId: 'rec-1', isActive: true });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicantId: 'no-user', jobId: 'job-1' });

      expect(res.status).toBe(404);
    });

    it('returns 409 when invitation already sent', async () => {
      mockPrisma.job.findUnique.mockResolvedValue({ id: 'job-1', recruiterId: 'rec-1', isActive: true });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'app-1', role: Role.APPLICANT });
      mockPrisma.invitation.findUnique.mockResolvedValue({ id: 'inv-existing' });

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer rec.token')
        .send({ applicantId: 'app-1', jobId: 'job-1' });

      expect(res.status).toBe(409);
    });

    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/invitations')
        .send({ applicantId: 'app-1', jobId: 'job-1' });

      expect(res.status).toBe(401);
    });

    it('returns 403 for non-recruiter', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);

      const res = await request(app)
        .post('/api/invitations')
        .set('Authorization', 'Bearer app.token')
        .send({ applicantId: 'app-1', jobId: 'job-1' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/invitations/sent (recruiter)', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns sent invitations with pagination', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'inv-1' }], 1]);

      const res = await request(app)
        .get('/api/invitations/sent')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('filters by status', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app)
        .get('/api/invitations/sent?status=PENDING')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-recruiter', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);

      const res = await request(app)
        .get('/api/invitations/sent')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/invitations/received (applicant)', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('returns received invitations with pagination', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'inv-1' }, { id: 'inv-2' }], 2]);

      const res = await request(app)
        .get('/api/invitations/received')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(2);
    });

    it('returns 403 for non-applicant', async () => {
      mockVerifyToken.mockReturnValue(recruiterPayload);

      const res = await request(app)
        .get('/api/invitations/received')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/invitations/:id/respond', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(applicantPayload);
    });

    it('accepts invitation and creates application', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        applicantId: 'app-1',
        jobId: 'job-1',
        status: InvitationStatus.PENDING,
      });
      mockPrisma.invitation.update.mockResolvedValue({ id: 'inv-1', status: 'ACCEPTED' });
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({});

      const res = await request(app)
        .put('/api/invitations/inv-1/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.ACCEPTED });

      expect(res.status).toBe(200);
      expect(mockPrisma.application.create).toHaveBeenCalled();
    });

    it('rejects invitation without creating application', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        applicantId: 'app-1',
        jobId: 'job-1',
        status: InvitationStatus.PENDING,
      });
      mockPrisma.invitation.update.mockResolvedValue({ id: 'inv-1', status: 'REJECTED' });

      const res = await request(app)
        .put('/api/invitations/inv-1/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.REJECTED });

      expect(res.status).toBe(200);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('accepts invitation when application already exists', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        applicantId: 'app-1',
        jobId: 'job-1',
        status: InvitationStatus.PENDING,
      });
      mockPrisma.invitation.update.mockResolvedValue({ id: 'inv-1', status: 'ACCEPTED' });
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'existing-app' });

      const res = await request(app)
        .put('/api/invitations/inv-1/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.ACCEPTED });

      expect(res.status).toBe(200);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('returns 404 when invitation not found', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/invitations/no-inv/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.ACCEPTED });

      expect(res.status).toBe(404);
    });

    it('returns 403 when invitation belongs to another applicant', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        applicantId: 'other-app',
        status: InvitationStatus.PENDING,
      });

      const res = await request(app)
        .put('/api/invitations/inv-1/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.ACCEPTED });

      expect(res.status).toBe(403);
    });

    it('returns 409 when invitation already responded', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        applicantId: 'app-1',
        status: InvitationStatus.ACCEPTED,
      });

      const res = await request(app)
        .put('/api/invitations/inv-1/respond')
        .set('Authorization', 'Bearer app.token')
        .send({ status: InvitationStatus.REJECTED });

      expect(res.status).toBe(409);
    });
  });
});

// ─── Search routes ────────────────────────────────────────────────────────────

describe('Search routes', () => {
  describe('GET /api/search/jobs', () => {
    it('returns jobs without filters', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'j1' }], 1]);

      const res = await request(app).get('/api/search/jobs');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns jobs filtered by keyword q', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'j1', title: 'Developer' }], 1]);

      const res = await request(app).get('/api/search/jobs?q=developer');

      expect(res.status).toBe(200);
    });

    it('filters by jobType', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app).get('/api/search/jobs?jobType=FULL_TIME');

      expect(res.status).toBe(200);
    });

    it('filters by location', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app).get('/api/search/jobs?location=Bangkok');

      expect(res.status).toBe(200);
    });

    it('filters by salary range', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app).get('/api/search/jobs?salaryMin=30000&salaryMax=80000');

      expect(res.status).toBe(200);
    });

    it('filters by skills', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app).get('/api/search/jobs?skills=TypeScript,Node.js');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('returns empty array when no q provided', async () => {
      const res = await request(app).get('/api/search/suggestions');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('returns empty array when q is blank', async () => {
      const res = await request(app).get('/api/search/suggestions?q=');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('returns suggestions when q is provided', async () => {
      mockPrisma.job.findMany.mockResolvedValue([
        { id: 'j1', title: 'Developer' },
        { id: 'j2', title: 'DevOps' },
      ]);

      const res = await request(app).get('/api/search/suggestions?q=dev');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/search/applicants', () => {
    beforeEach(() => {
      mockVerifyToken.mockReturnValue(recruiterPayload);
    });

    it('returns applicants without filters', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'u1' }], 1]);

      const res = await request(app)
        .get('/api/search/applicants')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBe(1);
    });

    it('returns applicants filtered by keyword q', async () => {
      mockPrisma.$transaction.mockResolvedValue([[{ id: 'u1' }], 1]);

      const res = await request(app)
        .get('/api/search/applicants?q=alice')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
    });

    it('filters by skills and location', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app)
        .get('/api/search/applicants?skills=TypeScript&location=Bangkok')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
    });

    it('filters by education and experience', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const res = await request(app)
        .get('/api/search/applicants?education=Bachelor&experience=3 years')
        .set('Authorization', 'Bearer rec.token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for applicant role', async () => {
      mockVerifyToken.mockReturnValue(applicantPayload);

      const res = await request(app)
        .get('/api/search/applicants')
        .set('Authorization', 'Bearer app.token');

      expect(res.status).toBe(403);
    });

    it('returns 401 for unauthenticated', async () => {
      const res = await request(app).get('/api/search/applicants');

      expect(res.status).toBe(401);
    });
  });
});
