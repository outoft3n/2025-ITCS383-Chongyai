import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/hooks/useChat';

jest.mock('@/hooks/useChat');

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>;

describe('ChatWindow', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when loading', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: true,
      isSending: false,
      error: null,
      sendMessage: jest.fn().mockResolvedValue(undefined),
    });

    render(<ChatWindow sessionId="abc" supportAvailable={false} />);

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('renders an empty state when there are no messages', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      sendMessage: jest.fn().mockResolvedValue(undefined),
    });

    render(<ChatWindow sessionId="abc" supportAvailable={false} />);

    expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
  });

  it('allows sending a new message and clears the input', async () => {
    const sendMessage = jest.fn().mockResolvedValue(undefined);

    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      sendMessage,
    });

    render(<ChatWindow sessionId="abc" supportAvailable={true} />);

    const input = screen.getByPlaceholderText(/Type a message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await userEvent.type(input, 'hello world');
    await userEvent.click(sendButton);

    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith('hello world'));
    expect(input).toHaveValue('');
  });

  it('shows support availability state based on prop', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      sendMessage: jest.fn().mockResolvedValue(undefined),
    });

    const { rerender } = render(<ChatWindow sessionId="abc" supportAvailable={false} />);
    expect(screen.getByText(/Bot only/i)).toBeInTheDocument();

    rerender(<ChatWindow sessionId="abc" supportAvailable={true} />);
    expect(screen.getByText(/Support online/i)).toBeInTheDocument();
  });
});