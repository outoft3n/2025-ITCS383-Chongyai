import { renderHook, waitFor } from '@testing-library/react';
import { useSentInvitations, useReceivedInvitations } from '@/hooks/useInvitations';
import api from '@/lib/api';
import type { Invitation, PaginatedResponse, ApiResponse } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const mockInvitation: Invitation = {
  id: 'inv1',
  recruiterId: 'r1',
  applicantId: 'a1',
  jobId: 'j1',
  message: 'We would like to invite you',
  status: 'PENDING',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const paginatedResponse: PaginatedResponse<Invitation> = {
  success: true,
  data: [mockInvitation],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe('useSentInvitations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches sent invitations on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useSentInvitations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.invitations).toEqual([mockInvitation]);
    expect(result.current.error).toBeNull();
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('/invitations/sent'));
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useSentInvitations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.invitations).toEqual([]);
  });

  it('sendInvitation calls POST /invitations with correct payload', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const sentResponse: ApiResponse<Invitation> = { success: true, data: mockInvitation };
    mockedApi.post = jest.fn().mockResolvedValue({ data: sentResponse });
    const { result } = renderHook(() => useSentInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.sendInvitation('a1', 'j1', 'Hello!');
    expect(mockedApi.post).toHaveBeenCalledWith('/invitations', {
      applicantId: 'a1',
      jobId: 'j1',
      message: 'Hello!',
    });
  });

  it('sendInvitation refetches after POST', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const sentResponse: ApiResponse<Invitation> = { success: true, data: mockInvitation };
    mockedApi.post = jest.fn().mockResolvedValue({ data: sentResponse });
    const { result } = renderHook(() => useSentInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.sendInvitation('a1', 'j1');
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
  });

  it('refetch with page param sends correct query', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useSentInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.refetch(3);
    expect(mockedApi.get).toHaveBeenLastCalledWith(expect.stringContaining('page=3'));
  });

  it('refetch with status param sends correct query', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useSentInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.refetch(1, 'PENDING');
    expect(mockedApi.get).toHaveBeenLastCalledWith(expect.stringContaining('status=PENDING'));
  });

  it('exposes pagination from response', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useSentInvitations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pagination.total).toBe(1);
    expect(result.current.pagination.totalPages).toBe(1);
  });
});

describe('useReceivedInvitations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches received invitations on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useReceivedInvitations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.invitations).toEqual([mockInvitation]);
    expect(result.current.error).toBeNull();
    expect(mockedApi.get).toHaveBeenCalledWith(expect.stringContaining('/invitations/received'));
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Forbidden'));
    const { result } = renderHook(() => useReceivedInvitations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Forbidden');
    expect(result.current.invitations).toEqual([]);
  });

  it('respond ACCEPTED calls PUT with correct payload', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.put = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useReceivedInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.respond('inv1', 'ACCEPTED');
    expect(mockedApi.put).toHaveBeenCalledWith('/invitations/inv1/respond', { status: 'ACCEPTED' });
  });

  it('respond REJECTED calls PUT with correct payload', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.put = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useReceivedInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.respond('inv1', 'REJECTED');
    expect(mockedApi.put).toHaveBeenCalledWith('/invitations/inv1/respond', { status: 'REJECTED' });
  });

  it('respond refetches after PUT', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.put = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useReceivedInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.respond('inv1', 'ACCEPTED');
    expect(mockedApi.get).toHaveBeenCalledTimes(2);
  });

  it('refetch with status filter sends correct query', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useReceivedInvitations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.refetch(1, 'ACCEPTED');
    expect(mockedApi.get).toHaveBeenLastCalledWith(expect.stringContaining('status=ACCEPTED'));
  });
});
