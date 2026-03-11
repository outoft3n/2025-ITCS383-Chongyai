import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrismaJob = (prisma as any).job as {
  findMany: jest.Mock;
  count: jest.Mock;
};
const mockPrismaTransaction = (prisma as any).$transaction as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/search/jobs', () => {
  it('returns paginated jobs when query is provided', async () => {
    mockPrismaTransaction.mockResolvedValue([[{ id: 'job-1', title: 'Foo' }], 1]);

    const res = await request(app).get('/api/search/jobs?q=foo&limit=5&page=2');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('defaults to page 1 and limit 20 when invalid values are provided', async () => {
    mockPrismaTransaction.mockResolvedValue([[{ id: 'job-1', title: 'Foo' }], 1]);

    const res = await request(app).get('/api/search/jobs?page=0&limit=100');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(50);
  });
});

describe('GET /api/search/suggestions', () => {
  it('returns empty list when q is missing', async () => {
    const res = await request(app).get('/api/search/suggestions');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns suggestions when q is provided', async () => {
    mockPrismaJob.findMany.mockResolvedValue([{ id: 'job-1', title: 'Foo' }]);

    const res = await request(app).get('/api/search/suggestions?q=foo');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].title).toBe('Foo');
  });
});
