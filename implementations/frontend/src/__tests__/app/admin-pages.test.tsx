import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn(), push: jest.fn() }),
  useParams: () => ({}),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'admin-1', email: 'admin@x.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User', isVerified: true, isPaid: true },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  getApiErrorMessage: jest.fn(() => 'Something went wrong'),
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock('@/components/ui/Pagination', () => ({
  Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/Select', () => ({
  Select: ({ onChange, children }: { onChange: (v: string) => void; children: React.ReactNode }) => (
    <select data-testid="select" onChange={(e) => onChange(e.target.value)}>{children}</select>
  ),
}));

jest.mock('@/components/dashboard/ChartPlaceholder', () => ({
  ChartPlaceholder: ({ title }: { title: string }) => <div data-testid="chart">{title}</div>,
}));

jest.mock('@/components/dashboard/StatsCard', () => ({
  StatsCard: ({ title }: { title: string }) => <div data-testid="stats-card">{title}</div>,
}));

const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Admin Jobs page ──────────────────────────────────────────────────────────

describe('AdminJobsPage', () => {
  const mockJobs = [
    { id: 'j1', title: 'Engineer', jobType: 'FULL_TIME', viewCount: 10, isActive: true, createdAt: new Date().toISOString(), recruiter: { companyName: 'Acme' } },
  ];

  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const AdminJobsPage = require('@/app/dashboard/admin/jobs/page').default;
    render(<AdminJobsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders All Jobs heading after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockJobs, pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } } });
    const AdminJobsPage = require('@/app/dashboard/admin/jobs/page').default;
    await act(async () => { render(<AdminJobsPage />); });
    await waitFor(() => {
      expect(screen.getByText('All Jobs')).toBeInTheDocument();
    });
  });

  it('renders job rows after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockJobs, pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } } });
    const AdminJobsPage = require('@/app/dashboard/admin/jobs/page').default;
    await act(async () => { render(<AdminJobsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Engineer')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValueOnce('Failed to load jobs');
    const AdminJobsPage = require('@/app/dashboard/admin/jobs/page').default;
    await act(async () => { render(<AdminJobsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Failed to load jobs')).toBeInTheDocument();
    });
  });
});

// ─── Admin Payments page ──────────────────────────────────────────────────────

describe('AdminPaymentsPage', () => {
  const mockPayments = [
    { id: 'pay1', userId: 'u1', amount: 99, status: 'COMPLETED', referenceId: 'ref1', createdAt: new Date().toISOString(), user: { firstName: 'Alice', lastName: 'B', role: 'APPLICANT' } },
  ];

  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const AdminPaymentsPage = require('@/app/dashboard/admin/payments/page').default;
    render(<AdminPaymentsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Payments heading after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockPayments, pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } } });
    const AdminPaymentsPage = require('@/app/dashboard/admin/payments/page').default;
    await act(async () => { render(<AdminPaymentsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Payments')).toBeInTheDocument();
    });
  });

  it('renders payment rows after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockPayments, pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } } });
    const AdminPaymentsPage = require('@/app/dashboard/admin/payments/page').default;
    await act(async () => { render(<AdminPaymentsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Alice B')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValueOnce('Failed to load payments');
    const AdminPaymentsPage = require('@/app/dashboard/admin/payments/page').default;
    await act(async () => { render(<AdminPaymentsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Failed to load payments')).toBeInTheDocument();
    });
  });
});

// ─── Admin Reports page ───────────────────────────────────────────────────────

describe('AdminReportsPage', () => {
  const mockReportData = { data: [] };

  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const AdminReportsPage = require('@/app/dashboard/admin/reports/page').default;
    render(<AdminReportsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Reports heading after loading', async () => {
    api.get.mockResolvedValue({ data: mockReportData });
    const AdminReportsPage = require('@/app/dashboard/admin/reports/page').default;
    await act(async () => { render(<AdminReportsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
    });
  });

  it('renders chart placeholders after loading', async () => {
    api.get.mockResolvedValue({ data: mockReportData });
    const AdminReportsPage = require('@/app/dashboard/admin/reports/page').default;
    await act(async () => { render(<AdminReportsPage />); });
    await waitFor(() => {
      expect(screen.getAllByTestId('chart').length).toBeGreaterThan(0);
    });
  });

  it('shows error message on API failure', async () => {
    api.get.mockRejectedValue(new Error('fail'));
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValue('Failed to load reports');
    const AdminReportsPage = require('@/app/dashboard/admin/reports/page').default;
    await act(async () => { render(<AdminReportsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Failed to load reports')).toBeInTheDocument();
    });
  });
});

// ─── Admin Users page ─────────────────────────────────────────────────────────

describe('AdminUsersPage', () => {
  const mockUsers = [
    { id: 'u1', firstName: 'Alice', lastName: 'B', email: 'alice@x.com', role: 'APPLICANT', isVerified: true, isPaid: true, createdAt: new Date().toISOString() },
    { id: 'u2', firstName: 'Bob', lastName: 'C', email: 'bob@x.com', role: 'RECRUITER', isVerified: false, isPaid: false, createdAt: new Date().toISOString() },
  ];

  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const AdminUsersPage = require('@/app/dashboard/admin/users/page').default;
    render(<AdminUsersPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Users heading after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockUsers, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } } });
    const AdminUsersPage = require('@/app/dashboard/admin/users/page').default;
    await act(async () => { render(<AdminUsersPage />); });
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('renders user rows after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockUsers, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } } });
    const AdminUsersPage = require('@/app/dashboard/admin/users/page').default;
    await act(async () => { render(<AdminUsersPage />); });
    await waitFor(() => {
      expect(screen.getByText('alice@x.com')).toBeInTheDocument();
    });
  });

  it('shows empty state when no users', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
    const AdminUsersPage = require('@/app/dashboard/admin/users/page').default;
    await act(async () => { render(<AdminUsersPage />); });
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('calls delete API when delete button is clicked', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockUsers, pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } } });
    api.delete.mockResolvedValueOnce({});
    api.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
    const AdminUsersPage = require('@/app/dashboard/admin/users/page').default;
    await act(async () => { render(<AdminUsersPage />); });
    await waitFor(() => { screen.getByText('alice@x.com'); });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);
    expect(api.delete).toHaveBeenCalled();
  });
});
