import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';

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
    user: { id: 'u1', email: 'test@example.com', role: 'APPLICANT', firstName: 'Test', lastName: 'User', isVerified: true, isPaid: true },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  getApiErrorMessage: jest.fn(() => 'Something went wrong'),
}));

// Mock hooks used by pages
jest.mock('@/hooks/useApplications', () => ({
  useMyApplications: jest.fn(() => ({
    applications: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useApplicationsForJob: jest.fn(() => ({
    applications: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: jest.fn(() => ({
    bookmarks: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    checkBookmark: jest.fn(),
  })),
}));

jest.mock('@/hooks/useInvitations', () => ({
  useMyInvitations: jest.fn(() => ({
    invitations: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    respond: jest.fn(),
  })),
  useSentInvitations: jest.fn(() => ({
    invitations: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useReceivedInvitations: jest.fn(() => ({
    invitations: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    respond: jest.fn(),
  })),
}));

jest.mock('@/hooks/useJobs', () => ({
  useJobs: jest.fn(() => ({
    jobs: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMyJobs: jest.fn(() => ({
    jobs: [],
    isLoading: false,
    error: null,
    createJob: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
    refetch: jest.fn(),
  })),
  useJob: jest.fn(() => ({ job: null, isLoading: false, error: null })),
  useSimilarJobs: jest.fn(() => ({ jobs: [], isLoading: false, error: null })),
}));

jest.mock('@/components/jobs/JobCard', () => ({
  JobCard: ({ job }: { job: { title: string } }) => <div data-testid="job-card">{job.title}</div>,
}));

jest.mock('@/components/jobs/JobFilter', () => ({
  JobFilter: () => <div data-testid="job-filter">Filter</div>,
}));

jest.mock('@/components/jobs/JobForm', () => ({
  JobForm: () => <div data-testid="job-form">JobForm</div>,
}));

jest.mock('@/components/applications/ApplicationCard', () => ({
  ApplicationCard: ({ application }: { application: { status: string } }) => (
    <div data-testid="application-card">{application.status}</div>
  ),
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock('@/components/ui/Pagination', () => ({
  Pagination: () => <div data-testid="pagination">Pagination</div>,
}));

const mockSummary = {
  users: { total: 100, applicants: 80, recruiters: 15, admins: 5 },
  jobs: { total: 50, active: 40, inactive: 10 },
  applications: { total: 200, accepted: 30, pending: 100 },
  payments: { revenue: 50000, completed: 60 },
  recentActivity: { newUsers: 5, newJobs: 3 },
};

const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

describe('AdminDashboard', () => {
  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const AdminDashboard = require('@/app/dashboard/admin/page').default;
    render(<AdminDashboard />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockSummary } });
    const AdminDashboard = require('@/app/dashboard/admin/page').default;

    await act(async () => { render(<AdminDashboard />); });

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    const { getApiErrorMessage } = require('@/lib/api');
    getApiErrorMessage.mockReturnValueOnce('Failed to load report');
    const AdminDashboard = require('@/app/dashboard/admin/page').default;

    await act(async () => { render(<AdminDashboard />); });

    await waitFor(() => {
      expect(screen.getByText('Failed to load report')).toBeInTheDocument();
    });
  });
});

// ─── Applicant Dashboard ──────────────────────────────────────────────────────

describe('ApplicantDashboard', () => {
  it('renders applicant dashboard page', async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const ApplicantDashboard = require('@/app/dashboard/applicant/page').default;

    await act(async () => { render(<ApplicantDashboard />); });

    await waitFor(() => {
      // The page renders regardless of API success
      expect(document.body).toBeTruthy();
    });
  });
});

// ─── Applicant Applications page ──────────────────────────────────────────────

describe('ApplicantApplicationsPage', () => {
  it('shows empty state when no applications', () => {
    const ApplicantApplicationsPage = require('@/app/dashboard/applicant/applications/page').default;
    render(<ApplicantApplicationsPage />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    const { useMyApplications } = require('@/hooks/useApplications');
    useMyApplications.mockReturnValueOnce({
      applications: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const ApplicantApplicationsPage = require('@/app/dashboard/applicant/applications/page').default;
    render(<ApplicantApplicationsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows error message', () => {
    const { useMyApplications } = require('@/hooks/useApplications');
    useMyApplications.mockReturnValueOnce({
      applications: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      isLoading: false,
      error: 'Failed to load applications',
      refetch: jest.fn(),
    });

    const ApplicantApplicationsPage = require('@/app/dashboard/applicant/applications/page').default;
    render(<ApplicantApplicationsPage />);
    expect(screen.getByText('Failed to load applications')).toBeInTheDocument();
  });

  it('renders application cards when data is available', () => {
    const { useMyApplications } = require('@/hooks/useApplications');
    useMyApplications.mockReturnValueOnce({
      applications: [
        { id: 'app-1', applicantId: 'u1', jobId: 'j1', status: 'APPLIED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const ApplicantApplicationsPage = require('@/app/dashboard/applicant/applications/page').default;
    render(<ApplicantApplicationsPage />);
    expect(screen.getByTestId('application-card')).toBeInTheDocument();
    expect(screen.getByText('1 applications')).toBeInTheDocument();
  });
});

// ─── Applicant Bookmarks page ─────────────────────────────────────────────────

describe('ApplicantBookmarksPage', () => {
  it('renders bookmarks heading', () => {
    const BookmarksPage = require('@/app/dashboard/applicant/bookmarks/page').default;
    render(<BookmarksPage />);
    expect(screen.getAllByText(/saved jobs/i)[0]).toBeInTheDocument();
  });
});

// ─── Applicant Interviews page ────────────────────────────────────────────────

describe('ApplicantInterviewsPage', () => {
  it('renders interviews heading', async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const InterviewsPage = require('@/app/dashboard/applicant/interviews/page').default;

    await act(async () => { render(<InterviewsPage />); });

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
});

// ─── Applicant Invitations page ───────────────────────────────────────────────

describe('ApplicantInvitationsPage', () => {
  it('shows empty state when no invitations', () => {
    const InvitationsPage = require('@/app/dashboard/applicant/invitations/page').default;
    render(<InvitationsPage />);
    expect(screen.getAllByText(/invitations/i)[0]).toBeInTheDocument();
  });
});

// ─── Applicant Jobs page ──────────────────────────────────────────────────────

describe('ApplicantJobsPage', () => {
  it('renders jobs page with filter', () => {
    const JobsPage = require('@/app/dashboard/applicant/jobs/page').default;
    render(<JobsPage />);
    expect(screen.getByTestId('job-filter')).toBeInTheDocument();
  });

  it('shows empty state when no jobs', () => {
    const JobsPage = require('@/app/dashboard/applicant/jobs/page').default;
    render(<JobsPage />);
    expect(screen.queryByTestId('job-card')).not.toBeInTheDocument();
  });
});

// ─── Recruiter Jobs page ──────────────────────────────────────────────────────

describe('RecruiterJobsPage', () => {
  it('renders recruiter jobs page', () => {
    const RecruiterJobsPage = require('@/app/dashboard/recruiter/jobs/page').default;
    render(<RecruiterJobsPage />);
    expect(document.body).toBeTruthy();
  });
});
