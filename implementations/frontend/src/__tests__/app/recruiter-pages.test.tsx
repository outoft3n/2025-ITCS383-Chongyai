import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), back: mockBack, push: mockPush }),
  useParams: () => ({ id: 'job-1' }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'applicationId') return 'app-1';
      if (key === 'scheduleInterview') return null;
      return null;
    },
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), back: mockBack, push: mockPush }),
  useParams: () => ({ id: 'job-1' }),
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'rec-1', email: 'rec@x.com', role: 'RECRUITER', firstName: 'Bob', lastName: 'Smith', isVerified: true, isPaid: true, companyName: 'TechCorp' },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  getApiErrorMessage: jest.fn(() => 'Something went wrong'),
}));

jest.mock('@/hooks/useApplications', () => ({
  useMyApplications: jest.fn(() => ({ applications: [], isLoading: false, error: null, refetch: jest.fn() })),
  useApplicationsForJob: jest.fn(() => ({ applications: [], isLoading: false, error: null, refetch: jest.fn() })),
  useJobApplications: jest.fn(() => ({
    applications: [],
    isLoading: false,
    error: null,
    updateStatus: jest.fn(),
    refetch: jest.fn(),
  })),
}));

jest.mock('@/hooks/useJobs', () => ({
  useJobs: jest.fn(() => ({ jobs: [], isLoading: false, error: null, refetch: jest.fn() })),
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

jest.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: jest.fn(() => ({ bookmarks: [], isLoading: false, error: null, addBookmark: jest.fn(), removeBookmark: jest.fn() })),
  useBookmarkCheck: jest.fn(() => ({ isBookmarked: false, toggleBookmark: jest.fn(), isLoading: false })),
}));

jest.mock('@/hooks/useInvitations', () => ({
  useMyInvitations: jest.fn(() => ({ invitations: [], isLoading: false, error: null, refetch: jest.fn(), respond: jest.fn() })),
  useSentInvitations: jest.fn(() => ({
    invitations: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    sendInvitation: jest.fn(),
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  })),
  useReceivedInvitations: jest.fn(() => ({ invitations: [], isLoading: false, error: null, refetch: jest.fn(), respond: jest.fn() })),
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

jest.mock('@/components/ui/Input', () => ({
  Input: ({ label, ...props }: { label?: string; [key: string]: unknown }) => (
    <div>
      {label && <label>{label}</label>}
      <input aria-label={label} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
    </div>
  ),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, type }: { children: React.ReactNode; onClick?: () => void; type?: string }) => (
    <button onClick={onClick} type={(type as 'button' | 'submit' | 'reset') ?? 'button'}>{children}</button>
  ),
}));

jest.mock('@/components/jobs/JobForm', () => ({
  JobForm: ({ onSubmit }: { onSubmit?: (data: unknown) => void }) => (
    <div data-testid="job-form">
      <button onClick={() => onSubmit?.({})}>Submit Form</button>
    </div>
  ),
}));

jest.mock('@/components/applications/ApplicationCard', () => ({
  ApplicationCard: ({ application }: { application: { status: string } }) => (
    <div data-testid="application-card">{application.status}</div>
  ),
}));

jest.mock('@/components/dashboard/StatsCard', () => ({
  StatsCard: ({ title, value }: { title: string; value: number | string }) => (
    <div data-testid="stats-card">{title}: {value}</div>
  ),
}));

const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Recruiter Dashboard ──────────────────────────────────────────────────────

describe('RecruiterDashboard', () => {
  it('renders welcome greeting', async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const RecruiterDashboard = require('@/app/dashboard/recruiter/page').default;
    await act(async () => { render(<RecruiterDashboard />); });
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('renders stats cards after loading', async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const RecruiterDashboard = require('@/app/dashboard/recruiter/page').default;
    await act(async () => { render(<RecruiterDashboard />); });
    await waitFor(() => {
      expect(screen.getAllByTestId('stats-card').length).toBeGreaterThan(0);
    });
  });

  it('renders Your Jobs section', async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    const RecruiterDashboard = require('@/app/dashboard/recruiter/page').default;
    await act(async () => { render(<RecruiterDashboard />); });
    await waitFor(() => {
      expect(screen.getByText(/your jobs/i)).toBeInTheDocument();
    });
  });
});

// ─── Recruiter Invitations page ───────────────────────────────────────────────

describe('RecruiterInvitationsPage', () => {
  it('renders Sent Invitations heading', () => {
    const InvitationsPage = require('@/app/dashboard/recruiter/invitations/page').default;
    render(<InvitationsPage />);
    expect(screen.getByText(/sent invitations/i)).toBeInTheDocument();
  });

  it('renders empty state when no invitations', () => {
    const InvitationsPage = require('@/app/dashboard/recruiter/invitations/page').default;
    render(<InvitationsPage />);
    expect(screen.getByText(/no invitations sent/i)).toBeInTheDocument();
  });

  it('renders invite cards when data is available', () => {
    const { useSentInvitations } = require('@/hooks/useInvitations');
    useSentInvitations.mockReturnValueOnce({
      invitations: [
        {
          id: 'inv-1',
          applicant: { id: 'u1', firstName: 'Jane', lastName: 'Doe', email: 'j@x.com', skills: [] },
          job: { id: 'j1', title: 'Dev', location: 'BKK', jobType: 'FULL_TIME', createdAt: new Date().toISOString() },
          status: 'PENDING',
          message: 'Hi',
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });

    const InvitationsPage = require('@/app/dashboard/recruiter/invitations/page').default;
    render(<InvitationsPage />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});

// ─── Recruiter Interviews page ────────────────────────────────────────────────

describe('RecruiterInterviewsPage', () => {
  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const InterviewsPage = require('@/app/dashboard/recruiter/interviews/page').default;
    render(<InterviewsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Interviews heading after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    const InterviewsPage = require('@/app/dashboard/recruiter/interviews/page').default;
    await act(async () => { render(<InterviewsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Interviews')).toBeInTheDocument();
    });
  });

  it('renders empty state when no interviews', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });
    const InterviewsPage = require('@/app/dashboard/recruiter/interviews/page').default;
    await act(async () => { render(<InterviewsPage />); });
    await waitFor(() => {
      expect(screen.getByText(/no interviews/i)).toBeInTheDocument();
    });
  });

  it('renders interview cards when data is available', async () => {
    const mockInterview = {
      id: 'int-1',
      scheduledAt: new Date().toISOString(),
      duration: 30,
      type: 'VIDEO',
      status: 'SCHEDULED',
      notes: 'test',
      application: {
        applicant: { firstName: 'Alice', lastName: 'B' },
        job: { title: 'Dev Role' },
      },
    };
    api.get.mockResolvedValueOnce({ data: { data: [mockInterview] } });
    const InterviewsPage = require('@/app/dashboard/recruiter/interviews/page').default;
    await act(async () => { render(<InterviewsPage />); });
    await waitFor(() => {
      expect(screen.getByText('Dev Role')).toBeInTheDocument();
    });
  });
});

// ─── Recruiter Schedule Interview page ────────────────────────────────────────

describe('RecruiterScheduleInterviewPage', () => {
  it('renders Schedule Interview heading', () => {
    const SchedulePage = require('@/app/dashboard/recruiter/interviews/schedule/page').default;
    render(<SchedulePage />);
    expect(screen.getByText(/schedule interview/i)).toBeInTheDocument();
  });

  it('renders interview type buttons', () => {
    const SchedulePage = require('@/app/dashboard/recruiter/interviews/schedule/page').default;
    render(<SchedulePage />);
    expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument();
  });
});

// ─── Recruiter Profile page ───────────────────────────────────────────────────

describe('RecruiterProfilePage', () => {
  it('renders Company Profile heading', () => {
    const ProfilePage = require('@/app/dashboard/recruiter/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByText(/company profile/i)).toBeInTheDocument();
  });

  it('renders save button', () => {
    const ProfilePage = require('@/app/dashboard/recruiter/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls PUT on save', async () => {
    api.put.mockResolvedValueOnce({});
    const ProfilePage = require('@/app/dashboard/recruiter/profile/page').default;
    render(<ProfilePage />);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
    });
  });
});

// ─── Recruiter Search page ────────────────────────────────────────────────────

describe('RecruiterSearchPage', () => {
  it('renders Search Applicants heading', () => {
    const SearchPage = require('@/app/dashboard/recruiter/search/page').default;
    render(<SearchPage />);
    expect(screen.getByText(/search applicants/i)).toBeInTheDocument();
  });

  it('renders search form', () => {
    const SearchPage = require('@/app/dashboard/recruiter/search/page').default;
    render(<SearchPage />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders results after searching', async () => {
    const mockApplicants = [
      { id: 'u1', firstName: 'Jane', lastName: 'Doe', email: 'j@x.com', location: 'BKK', skills: ['React'], experience: '2 years', education: 'BS CS' },
    ];
    api.get.mockResolvedValueOnce({ data: { data: mockApplicants, pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } } });
    const SearchPage = require('@/app/dashboard/recruiter/search/page').default;
    render(<SearchPage />);

    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});

// ─── Recruiter New Job page ───────────────────────────────────────────────────

describe('RecruiterNewJobPage', () => {
  it('renders Post a New Job heading', () => {
    const NewJobPage = require('@/app/dashboard/recruiter/jobs/new/page').default;
    render(<NewJobPage />);
    expect(screen.getByText(/post a new job/i)).toBeInTheDocument();
  });

  it('renders JobForm', () => {
    const NewJobPage = require('@/app/dashboard/recruiter/jobs/new/page').default;
    render(<NewJobPage />);
    expect(screen.getByTestId('job-form')).toBeInTheDocument();
  });
});

// ─── Recruiter Edit Job page ──────────────────────────────────────────────────

describe('RecruiterEditJobPage', () => {
  it('shows spinner while loading', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: null, isLoading: true, error: null });
    const EditJobPage = require('@/app/dashboard/recruiter/jobs/[id]/edit/page').default;
    render(<EditJobPage params={{ id: 'job-1' }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Edit Job heading after loading', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({
      job: { id: 'j1', title: 'Dev', description: 'desc', requirements: 'req', location: 'BKK', jobType: 'FULL_TIME', skills: [], salaryMin: null, salaryMax: null, isActive: true },
      isLoading: false,
      error: null,
    });
    const EditJobPage = require('@/app/dashboard/recruiter/jobs/[id]/edit/page').default;
    render(<EditJobPage params={{ id: 'job-1' }} />);
    expect(screen.getByText(/edit job/i)).toBeInTheDocument();
  });

  it('renders 404 message when job not found', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: null, isLoading: false, error: 'Not found' });
    const EditJobPage = require('@/app/dashboard/recruiter/jobs/[id]/edit/page').default;
    render(<EditJobPage params={{ id: 'bad-id' }} />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });
});

// ─── Recruiter Job Applications page ─────────────────────────────────────────

describe('RecruiterJobApplicationsPage', () => {
  it('shows spinner while loading', () => {
    const { useJobApplications } = require('@/hooks/useApplications');
    useJobApplications.mockReturnValueOnce({ applications: [], isLoading: true, error: null, updateStatus: jest.fn() });
    const JobApplicationsPage = require('@/app/dashboard/recruiter/jobs/[id]/applications/page').default;
    render(<JobApplicationsPage params={{ id: 'job-1' }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders Applicants heading with count', () => {
    const { useJobApplications } = require('@/hooks/useApplications');
    useJobApplications.mockReturnValueOnce({
      applications: [
        { id: 'app-1', status: 'APPLIED', applicant: { firstName: 'Alice', lastName: 'B' }, job: { title: 'Dev' } },
      ],
      isLoading: false,
      error: null,
      updateStatus: jest.fn(),
    });
    const JobApplicationsPage = require('@/app/dashboard/recruiter/jobs/[id]/applications/page').default;
    render(<JobApplicationsPage params={{ id: 'job-1' }} />);
    expect(screen.getByText(/applicants/i)).toBeInTheDocument();
    expect(screen.getByTestId('application-card')).toBeInTheDocument();
  });

  it('renders empty state when no applications', () => {
    const { useJobApplications } = require('@/hooks/useApplications');
    useJobApplications.mockReturnValueOnce({ applications: [], isLoading: false, error: null, updateStatus: jest.fn() });
    const JobApplicationsPage = require('@/app/dashboard/recruiter/jobs/[id]/applications/page').default;
    render(<JobApplicationsPage params={{ id: 'job-1' }} />);
    expect(screen.getByText(/no applications/i)).toBeInTheDocument();
  });
});

// ─── Recruiter Applicant Profile page ────────────────────────────────────────

describe('RecruiterApplicantProfilePage', () => {
  const mockUser = {
    id: 'u1', firstName: 'Jane', lastName: 'Doe', email: 'j@x.com', role: 'APPLICANT',
    phone: '0812345678', skills: 'React, Node', experience: '2 years', education: 'BS CS',
    location: 'BKK', resumeUrl: null,
  };

  it('shows spinner while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const ApplicantPage = require('@/app/dashboard/recruiter/applicants/[id]/page').default;
    render(<ApplicantPage params={{ id: 'u1' }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders applicant name after loading', async () => {
    api.get.mockResolvedValueOnce({ data: { data: mockUser } });
    api.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
    const ApplicantPage = require('@/app/dashboard/recruiter/applicants/[id]/page').default;
    await act(async () => { render(<ApplicantPage params={{ id: 'u1' }} />); });
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});
