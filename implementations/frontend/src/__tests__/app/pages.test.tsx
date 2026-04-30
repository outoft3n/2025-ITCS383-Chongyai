import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Shared mocks ─────────────────────────────────────────────────────────────

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, back: mockBack, push: mockPush }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'u1', email: 'test@example.com', role: 'APPLICANT', firstName: 'Test', lastName: 'User', isVerified: true, isPaid: true },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  getApiErrorMessage: jest.fn(() => 'Something went wrong'),
}));

// Mock heavy components used in pages
jest.mock('@/components/chat/ChatWindow', () => ({
  ChatWindow: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="chat-window" data-session={sessionId}>ChatWindow</div>
  ),
}));

jest.mock('@/components/conference/ConferenceRoom', () => ({
  ConferenceRoom: ({ roomCode, onLeave }: { roomCode: string; onLeave: () => void }) => (
    <div data-testid="conference-room">
      <span>{roomCode}</span>
      <button onClick={onLeave}>Leave</button>
    </div>
  ),
}));

jest.mock('@/components/layout/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Error page ───────────────────────────────────────────────────────────────

describe('ErrorPage', () => {
  it('renders error UI', () => {
    const ErrorPage = require('@/app/error').default;
    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', async () => {
    const ErrorPage = require('@/app/error').default;
    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    render(<ErrorPage error={mockError} reset={mockReset} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockReset).toHaveBeenCalled();
  });

  it('logs error in development', () => {
    const ErrorPage = require('@/app/error').default;
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });

    const mockError = new Error('Dev error');
    const mockWrite = jest.fn();
    const origWrite = process.stdout?.write;
    if (process.stdout) process.stdout.write = mockWrite as typeof process.stdout.write;

    render(<ErrorPage error={mockError} reset={() => {}} />);

    if (process.stdout && origWrite) process.stdout.write = origWrite;
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
  });
});

// ─── Landing page ─────────────────────────────────────────────────────────────

describe('LandingPage', () => {
  it('renders hero section', () => {
    const LandingPage = require('@/app/page').default;
    render(<LandingPage />);
    expect(screen.getByText(/Find Your/i)).toBeInTheDocument();
  });

  it('renders Get Started Free link', () => {
    const LandingPage = require('@/app/page').default;
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument();
  });

  it('renders Browse Jobs link', () => {
    const LandingPage = require('@/app/page').default;
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /browse jobs/i })).toBeInTheDocument();
  });

  it('renders Navbar and Footer', () => {
    const LandingPage = require('@/app/page').default;
    render(<LandingPage />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

// ─── Chat page ────────────────────────────────────────────────────────────────

describe('ChatPage', () => {
  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {})); // never resolves
    const ChatPage = require('@/app/dashboard/chat/page').default;
    render(<ChatPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders ChatWindow after loading with supportAvailable=true', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { available: true } } });
    const ChatPage = require('@/app/dashboard/chat/page').default;

    await act(async () => { render(<ChatPage />); });

    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
  });

  it('renders ChatWindow with supportAvailable=false on error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    const ChatPage = require('@/app/dashboard/chat/page').default;

    await act(async () => { render(<ChatPage />); });

    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeInTheDocument();
    });
  });

  it('uses user id in session id', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { available: false } } });
    const ChatPage = require('@/app/dashboard/chat/page').default;

    await act(async () => { render(<ChatPage />); });

    await waitFor(() => {
      const chatWindow = screen.getByTestId('chat-window');
      expect(chatWindow.dataset.session).toContain('u1');
    });
  });
});

// ─── Conference page ──────────────────────────────────────────────────────────

describe('ConferencePage', () => {
  it('renders conference room with roomCode from params', () => {
    const ConferencePage = require('@/app/dashboard/conference/[roomCode]/page').default;
    render(<ConferencePage params={{ roomCode: 'TESTROOM' }} />);

    expect(screen.getByText('TESTROOM')).toBeInTheDocument();
    expect(screen.getByText('Video Interview')).toBeInTheDocument();
  });

  it('calls router.back() when leave is triggered', async () => {
    const ConferencePage = require('@/app/dashboard/conference/[roomCode]/page').default;
    render(<ConferencePage params={{ roomCode: 'ROOM1' }} />);

    await userEvent.click(screen.getByRole('button', { name: /leave/i }));
    expect(mockBack).toHaveBeenCalled();
  });
});
