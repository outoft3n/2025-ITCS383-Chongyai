import request from 'supertest';
import { Role, ApplicationStatus } from '@prisma/client';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import * as jwtLib from '../../lib/jwt';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    job: {
      findUnique: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../lib/jwt');

const mockPrismaJob = (prisma as any).job as {
  findUnique: jest.Mock;
};
const mockPrismaApplication = (prisma as any).application as {
  findUnique: jest.Mock;
  create: jest.Mock;
  findMany: jest.Mock;
  count: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};
const mockPrismaTransaction = (prisma as any).$transaction as jest.Mock;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

const APPLICANT_USER = { id: 'applicant-1', email: 'a@b.com', role: Role.APPLICANT };
const RECRUITER_USER = { id: 'recruiter-1', email: 'r@b.com', role: Role.RECRUITER };

const BASE_JOB = {
  id: 'job-1',
  title: 'Test Job',
  location: 'Bangkok',
  recruiterId: 'recruiter-1',
  isActive: true,
};

const BASE_APPLICATION = {
  id: 'app-1',
  applicantId: 'applicant-1',
  jobId: 'job-1',
  status: ApplicationStatus.APPLIED,
  coverLetter: 'Hello',
  job: { title: 'Test Job', location: 'Bangkok' },
  applicant: { id: 'applicant-1' },
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('POST /api/applications', () => {
  const endpoint = '/api/applications';
  const body = { jobId: 'job-1', coverLetter: 'Hello' };

  it('creates an application when job exists and no existing application', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);
    mockPrismaApplication.findUnique.mockResolvedValue(null);
    mockPrismaApplication.create.mockResolvedValue(BASE_APPLICATION);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job.title).toBe('Test Job');
  });

  it('returns 404 when job not found', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaJob.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(404);
  });

  it('returns 409 when already applied', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);
    mockPrismaApplication.findUnique.mockResolvedValue(BASE_APPLICATION);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(409);
  });

  it('returns 422 when jobId is missing', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);

    const res = await request(app)
      .post(endpoint)
      .set('Authorization', 'Bearer token')
      .send({});

    expect(res.status).toBe(422);
  });
});

describe('GET /api/applications/mine', () => {
  it('returns paginated applications for applicant', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaTransaction.mockResolvedValue([[BASE_APPLICATION], 1]);

    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/applications/job/:jobId', () => {
  it('returns 404 when job is missing', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaJob.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/applications/job/job-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  it('returns 403 when recruiter is not owner', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaJob.findUnique.mockResolvedValue({ ...BASE_JOB, recruiterId: 'other' });

    const res = await request(app)
      .get('/api/applications/job/job-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(403);
  });

  it('returns applications for authorized recruiter', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);
    mockPrismaTransaction.mockResolvedValue([[BASE_APPLICATION], 1]);

    const res = await request(app)
      .get('/api/applications/job/job-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('GET /api/applications/:id', () => {
  it('returns 404 if application not found', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaApplication.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  it('returns 403 if user is not applicant/recruiter/admin', async () => {
    mockVerifyToken.mockReturnValue({ id: 'other', email: 'x@b.com', role: Role.APPLICANT });
    mockPrismaApplication.findUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      applicantId: 'applicant-1',
      job: { recruiter: { id: 'recruiter-1' } },
    });

    const res = await request(app)
      .get('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(403);
  });

  it('returns 200 when authorized as applicant', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaApplication.findUnique.mockResolvedValue({
      ...BASE_APPLICATION,
      applicantId: 'applicant-1',
      job: { recruiter: { id: 'recruiter-1' } },
    });

    const res = await request(app)
      .get('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/applications/:id/status', () => {
  const body = { status: 'REJECTED' };

  it('returns 404 when application missing', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaApplication.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/applications/app-1/status')
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(404);
  });

  it('returns 403 when recruiter is not owner', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      job: { recruiterId: 'other' },
    });

    const res = await request(app)
      .put('/api/applications/app-1/status')
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(403);
  });

  it('updates status when authorized', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_USER);
    mockPrismaApplication.findUnique.mockResolvedValue({
      id: 'app-1',
      job: { recruiterId: 'recruiter-1' },
    });
    mockPrismaApplication.update.mockResolvedValue({ ...BASE_APPLICATION, status: ApplicationStatus.REJECTED });

    const res = await request(app)
      .put('/api/applications/app-1/status')
      .set('Authorization', 'Bearer token')
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ApplicationStatus.REJECTED);
  });
});

describe('DELETE /api/applications/:id', () => {
  it('returns 404 when application missing', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaApplication.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(404);
  });

  it('returns 403 when user is not applicant', async () => {
    mockVerifyToken.mockReturnValue({ id: 'other', email: 'x@b.com', role: Role.APPLICANT });
    mockPrismaApplication.findUnique.mockResolvedValue({ applicantId: 'applicant-1', status: ApplicationStatus.APPLIED });

    const res = await request(app)
      .delete('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(403);
  });

  it('returns 400 when application cannot be withdrawn', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaApplication.findUnique.mockResolvedValue({ applicantId: 'applicant-1', status: ApplicationStatus.REJECTED });

    const res = await request(app)
      .delete('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(400);
  });

  it('withdraws application when allowed', async () => {
    mockVerifyToken.mockReturnValue(APPLICANT_USER);
    mockPrismaApplication.findUnique.mockResolvedValue({ applicantId: 'applicant-1', status: ApplicationStatus.APPLIED });
    mockPrismaApplication.delete.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/applications/app-1')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
  });
});
