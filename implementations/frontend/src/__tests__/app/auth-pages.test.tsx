import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockReplace = jest.fn();
const mockLogin = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), push: jest.fn() }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    login: mockLogin,
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  getApiErrorMessage: jest.fn((err) => err?.response?.data?.message ?? 'Unable to connect to server.'),
}));

jest.mock('@/lib/auth', () => ({
  getDashboardPath: jest.fn((role: string) => `/dashboard/${role.toLowerCase()}`),
}));

const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Login page ───────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    const LoginPage = require('@/app/auth/login/page').default;
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Sign In button', () => {
    const LoginPage = require('@/app/auth/login/page').default;
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Sign up link', () => {
    const LoginPage = require('@/app/auth/login/page').default;
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email on submit', async () => {
    const LoginPage = require('@/app/auth/login/page').default;
    render(<LoginPage />);

    // Submit without filling email — empty value bypasses native type="email" constraint
    // but fails Zod's .email() rule, so React Hook Form shows the error
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('calls login and redirects on success', async () => {
    const LoginPage = require('@/app/auth/login/page').default;
    api.post.mockResolvedValueOnce({
      data: { data: { token: 'tok123', user: { id: 'u1', role: 'APPLICANT', email: 'a@b.com', firstName: 'A', lastName: 'B', isVerified: true, isPaid: true } } },
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('tok123', expect.objectContaining({ role: 'APPLICANT' }));
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/applicant');
    });
  });

  it('shows error message on login failure', async () => {
    const LoginPage = require('@/app/auth/login/page').default;
    const err = { response: { data: { message: 'Invalid credentials' } } };
    api.post.mockRejectedValueOnce(err);
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValueOnce('Invalid credentials');

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('renders demo accounts section', () => {
    const LoginPage = require('@/app/auth/login/page').default;
    render(<LoginPage />);
    expect(screen.getByText(/demo accounts/i)).toBeInTheDocument();
  });
});

// ─── Register page ────────────────────────────────────────────────────────────

describe('RegisterPage', () => {
  it('renders role selector with APPLICANT and RECRUITER options', () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    render(<RegisterPage />);
    expect(screen.getByText('Job Seeker')).toBeInTheDocument();
    expect(screen.getByText('Employer')).toBeInTheDocument();
  });

  it('renders Create Account button', () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders Sign in link', () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    render(<RegisterPage />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows company name field when RECRUITER role is selected', async () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    render(<RegisterPage />);

    const recruiterRadio = screen.getByRole('radio', { name: /employer/i });
    await userEvent.click(recruiterRadio);

    await waitFor(() => {
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    });
  });

  it('does not show company name field for APPLICANT role', () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    render(<RegisterPage />);
    expect(screen.queryByLabelText(/company name/i)).not.toBeInTheDocument();
  });

  it('calls login and redirects on successful registration', async () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    api.post.mockResolvedValueOnce({
      data: { data: { token: 'tok456', user: { id: 'u2', role: 'APPLICANT', email: 'new@b.com', firstName: 'New', lastName: 'User', isVerified: false, isPaid: false } } },
    });

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'New');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/email/i), 'new@b.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('tok456', expect.objectContaining({ role: 'APPLICANT' }));
    });
  });

  it('shows error message on registration failure', async () => {
    const RegisterPage = require('@/app/auth/register/page').default;
    api.post.mockRejectedValueOnce(new Error('Email taken'));
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValueOnce('Email already registered');

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'A');
    await userEvent.type(screen.getByLabelText(/last name/i), 'B');
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@b.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
