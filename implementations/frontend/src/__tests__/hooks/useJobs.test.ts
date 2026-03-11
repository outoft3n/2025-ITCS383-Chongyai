import { renderHook, waitFor, act } from '@testing-library/react';
import { useJobs, useJob, useMyJobs } from '@/hooks/useJobs';
import api from '@/lib/api';
import type { Job, PaginatedResponse, ApiResponse } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const mockJob: Job = {
  id: '1',
  recruiterId: 'r1',
  title: 'Software Engineer',
  description: 'A great job',
  requirements: 'Some skills',
  location: 'Bangkok',
  jobType: 'FULL_TIME',
  salaryMin: 50000,
  salaryMax: 80000,
  skills: ['TypeScript', 'React'],
  viewCount: 10,
  isActive: true,
  expiresAt: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const paginatedResponse: PaginatedResponse<Job> = {
  success: true,
  data: [mockJob],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe('useJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches jobs on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useJobs());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.jobs).toEqual([mockJob]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useJobs());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });

  it('fetches with search filters', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const filters = { q: 'engineer', jobType: 'FULL_TIME' as const };
    const { result } = renderHook(() => useJobs(filters));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('/search/jobs'));
  });

  it('refetch re-runs the fetch', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useJobs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { result.current.refetch(); });
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
  });
});

describe('useJob', () => {
  it('fetches single job by id', async () => {
    const response: ApiResponse<Job> = { success: true, data: mockJob };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    const { result } = renderHook(() => useJob('1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.job).toEqual(mockJob);
  });

  it('sets error on failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useJob('999'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Not found');
  });

  it('does not fetch when id is empty', async () => {
    mockedApi.get = jest.fn();
    renderHook(() => useJob(''));
    expect(mockedApi.get).not.toHaveBeenCalled();
  });
});

describe('useMyJobs', () => {
  it('fetches recruiter jobs on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useMyJobs());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.jobs).toEqual([mockJob]);
  });

  it('createJob calls POST and refetches', async () => {
    const newJob: ApiResponse<Job> = { success: true, data: { ...mockJob, id: '2' } };
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.post = jest.fn().mockResolvedValue({ data: newJob });
    const { result } = renderHook(() => useMyJobs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const created = await result.current.createJob({
      title: 'New Job', description: '', requirements: '',
      location: 'Bangkok', jobType: 'FULL_TIME', skills: [],
    });
    expect(created.id).toBe('2');
    expect(mockedApi.post).toHaveBeenCalledWith('/jobs', expect.any(Object));
  });

  it('updateJob calls PUT and refetches', async () => {
    const updated: ApiResponse<Job> = { success: true, data: { ...mockJob, title: 'Updated' } };
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.put = jest.fn().mockResolvedValue({ data: updated });
    const { result } = renderHook(() => useMyJobs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const job = await result.current.updateJob('1', { title: 'Updated' });
    expect(job.title).toBe('Updated');
    expect(mockedApi.put).toHaveBeenCalledWith('/jobs/1', { title: 'Updated' });
  });

  it('deleteJob calls DELETE and refetches', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.delete = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useMyJobs());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.deleteJob('1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/jobs/1');
  });
});
