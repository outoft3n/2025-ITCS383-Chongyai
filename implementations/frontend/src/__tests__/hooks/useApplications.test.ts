import { renderHook, waitFor, act } from '@testing-library/react';
import { useMyApplications, useJobApplications } from '@/hooks/useApplications';
import api from '@/lib/api';
import type { Application, PaginatedResponse, ApiResponse } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const mockApplication: Application = {
  id: 'app1',
  applicantId: 'u1',
  jobId: 'j1',
  status: 'APPLIED',
  coverLetter: 'I am interested',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const paginatedResponse: PaginatedResponse<Application> = {
  success: true,
  data: [mockApplication],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe('useMyApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches applications on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useMyApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.applications).toEqual([mockApplication]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => useMyApplications());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Unauthorized');
  });

  it('apply calls POST and refetches', async () => {
    const createdApp: ApiResponse<Application> = { success: true, data: { ...mockApplication, id: 'app2' } };
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.post = jest.fn().mockResolvedValue({ data: createdApp });
    const { result } = renderHook(() => useMyApplications());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const app = await result.current.apply('j1', 'Cover letter');
    expect(app.id).toBe('app2');
    expect(mockedApi.post).toHaveBeenCalledWith('/applications', { jobId: 'j1', coverLetter: 'Cover letter' });
  });

  it('withdraw calls DELETE and refetches', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.delete = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useMyApplications());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.withdraw('app1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/applications/app1');
  });

  it('refetch fetches with page number', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useMyApplications());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { result.current.refetch(2); });
    expect(mockedApi.get).toHaveBeenCalledWith('/applications/mine?page=2');
  });
});

describe('useJobApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches job applications on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useJobApplications('j1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.applications).toEqual([mockApplication]);
  });

  it('does not fetch when jobId is empty', () => {
    mockedApi.get = jest.fn();
    renderHook(() => useJobApplications(''));
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useJobApplications('j1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Not found');
  });

  it('updateStatus calls PUT and refetches', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.put = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useJobApplications('j1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.updateStatus('app1', 'REVIEWING');
    expect(mockedApi.put).toHaveBeenCalledWith('/applications/app1/status', { status: 'REVIEWING' });
  });
});
