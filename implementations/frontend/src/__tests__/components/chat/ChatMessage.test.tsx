import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import type { Message } from '@/types';

const baseMessage: Message = {
  id: 'm1',
  senderId: null,
  receiverId: null,
  content: 'Hello world',
  isBot: false,
  sessionId: 'sess1',
  createdAt: new Date().toISOString(),
};

describe('ChatMessage', () => {
  it('renders message content', () => {
    render(<ChatMessage message={baseMessage} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders user message without bot icon', () => {
    render(<ChatMessage message={{ ...baseMessage, isBot: false }} />);
    // Bot icon should NOT be visible for user messages
    expect(screen.queryByTestId('bot-icon')).not.toBeInTheDocument();
  });

  it('renders bot message with bot layout', () => {
    render(<ChatMessage message={{ ...baseMessage, isBot: true }} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders time ago text', () => {
    render(<ChatMessage message={baseMessage} />);
    // formatDistanceToNow should produce something like "less than a minute ago"
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('renders bot message content', () => {
    const botMessage = { ...baseMessage, isBot: true, content: 'How can I help?' };
    render(<ChatMessage message={botMessage} />);
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
  });
});
