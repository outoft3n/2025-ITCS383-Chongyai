import { renderHook, waitFor } from '@testing-library/react';
import { useBookmarks, useBookmarkCheck } from '@/hooks/useBookmarks';
import api from '@/lib/api';
import type { Bookmark, PaginatedResponse, ApiResponse } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

const mockBookmark: Bookmark = {
  id: 'b1',
  applicantId: 'u1',
  jobId: 'j1',
  createdAt: '2024-01-01T00:00:00Z',
};

const paginatedResponse: PaginatedResponse<Bookmark> = {
  success: true,
  data: [mockBookmark],
  pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe('useBookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches bookmarks on mount', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bookmarks).toEqual([mockBookmark]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Forbidden'));
    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Forbidden');
  });

  it('addBookmark calls POST', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.post = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.addBookmark('j2');
    expect(mockedApi.post).toHaveBeenCalledWith('/bookmarks', { jobId: 'j2' });
  });

  it('removeBookmark calls DELETE', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    mockedApi.delete = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.removeBookmark('j1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/bookmarks/j1');
  });

  it('isBookmarked returns true for bookmarked job', async () => {
    mockedApi.get = jest.fn().mockResolvedValue({ data: paginatedResponse });
    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isBookmarked('j1')).toBe(true);
    expect(result.current.isBookmarked('j99')).toBe(false);
  });
});

describe('useBookmarkCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks bookmark status on mount', async () => {
    const response: ApiResponse<{ bookmarked: boolean }> = {
      success: true,
      data: { bookmarked: true },
    };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    const { result } = renderHook(() => useBookmarkCheck('j1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bookmarked).toBe(true);
  });

  it('defaults to false on fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Error'));
    const { result } = renderHook(() => useBookmarkCheck('j1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bookmarked).toBe(false);
  });

  it('does not fetch when jobId is empty', () => {
    mockedApi.get = jest.fn();
    renderHook(() => useBookmarkCheck(''));
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('toggle adds bookmark when not bookmarked', async () => {
    const notBookmarked: ApiResponse<{ bookmarked: boolean }> = { success: true, data: { bookmarked: false } };
    mockedApi.get = jest.fn().mockResolvedValue({ data: notBookmarked });
    mockedApi.post = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useBookmarkCheck('j1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.toggle();
    expect(mockedApi.post).toHaveBeenCalledWith('/bookmarks', { jobId: 'j1' });
  });

  it('toggle removes bookmark when bookmarked', async () => {
    const isBookmarked: ApiResponse<{ bookmarked: boolean }> = { success: true, data: { bookmarked: true } };
    mockedApi.get = jest.fn().mockResolvedValue({ data: isBookmarked });
    mockedApi.delete = jest.fn().mockResolvedValue({});
    const { result } = renderHook(() => useBookmarkCheck('j1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.toggle();
    expect(mockedApi.delete).toHaveBeenCalledWith('/bookmarks/j1');
  });
});
