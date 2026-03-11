import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from '@/hooks/useChat';
import api from '@/lib/api';
import type { Message, ApiResponse } from '@/types';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
const mockedApi = api as jest.Mocked<typeof api>;

jest.useFakeTimers();

const mockMessage: Message = {
  id: 'm1',
  senderId: 'u1',
  receiverId: null,
  content: 'Hello',
  isBot: false,
  sessionId: 'sess1',
  createdAt: '2024-01-01T00:00:00Z',
};

const botMessage: Message = {
  id: 'm2',
  senderId: null,
  receiverId: 'u1',
  content: 'Hi there!',
  isBot: true,
  sessionId: 'sess1',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('fetches chat history on mount', async () => {
    const response: ApiResponse<Message[]> = { success: true, data: [mockMessage] };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    const { result } = renderHook(() => useChat('sess1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.messages).toEqual([mockMessage]);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when sessionId is empty', () => {
    mockedApi.get = jest.fn();
    renderHook(() => useChat(''));
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it('sets error on history fetch failure', async () => {
    mockedApi.get = jest.fn().mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useChat('sess1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Server error');
  });

  it('polls every 5 seconds', async () => {
    const response: ApiResponse<Message[]> = { success: true, data: [] };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    const { result } = renderHook(() => useChat('sess1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callCount = (mockedApi.get as jest.Mock).mock.calls.length;
    act(() => { jest.advanceTimersByTime(5000); });
    await waitFor(() => {
      expect((mockedApi.get as jest.Mock).mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  it('sendMessage adds user and bot messages', async () => {
    const historyResponse: ApiResponse<Message[]> = { success: true, data: [] };
    const sendResponse: ApiResponse<{ userMessage: Message; botMessage: Message }> = {
      success: true,
      data: { userMessage: mockMessage, botMessage: botMessage },
    };
    mockedApi.get = jest.fn().mockResolvedValue({ data: historyResponse });
    mockedApi.post = jest.fn().mockResolvedValue({ data: sendResponse });

    const { result } = renderHook(() => useChat('sess1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.sendMessage('Hello'); });
    expect(result.current.messages).toContainEqual(mockMessage);
    expect(result.current.messages).toContainEqual(botMessage);
    expect(result.current.isSending).toBe(false);
  });

  it('sendMessage ignores empty/whitespace content', async () => {
    const response: ApiResponse<Message[]> = { success: true, data: [] };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    mockedApi.post = jest.fn();
    const { result } = renderHook(() => useChat('sess1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.sendMessage('   '); });
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it('sets error on sendMessage failure', async () => {
    const response: ApiResponse<Message[]> = { success: true, data: [] };
    mockedApi.get = jest.fn().mockResolvedValue({ data: response });
    mockedApi.post = jest.fn().mockRejectedValue(new Error('Failed to send'));
    const { result } = renderHook(() => useChat('sess1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.sendMessage('Hello'); });
    expect(result.current.error).toBe('Failed to send');
  });
});
