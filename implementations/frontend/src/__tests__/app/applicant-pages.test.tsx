import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn(), push: jest.fn() }),
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
    user: { id: 'u1', email: 'test@x.com', role: 'APPLICANT', firstName: 'Test', lastName: 'User', isVerified: true, isPaid: true },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  getApiErrorMessage: jest.fn(() => 'Something went wrong'),
}));

jest.mock('@/hooks/useJobs', () => ({
  useJob: jest.fn(() => ({ job: null, isLoading: false, error: null })),
  useSimilarJobs: jest.fn(() => ({ jobs: [], isLoading: false, error: null })),
  useJobs: jest.fn(() => ({ jobs: [], isLoading: false, error: null })),
  useMyJobs: jest.fn(() => ({ jobs: [], isLoading: false, error: null, createJob: jest.fn(), updateJob: jest.fn(), deleteJob: jest.fn() })),
}));

jest.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: jest.fn(() => ({ bookmarks: [], isLoading: false, error: null })),
  useBookmarkCheck: jest.fn(() => ({ isBookmarked: false, toggleBookmark: jest.fn(), isLoading: false })),
}));

jest.mock('@/hooks/useApplications', () => ({
  useMyApplications: jest.fn(() => ({
    applications: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/components/ui/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
}));

jest.mock('@/components/jobs/JobCard', () => ({
  JobCard: ({ job }: { job: { title: string } }) => <div data-testid="job-card">{job.title}</div>,
}));


const api = require('@/lib/api').default;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Job Detail page ──────────────────────────────────────────────────────────

describe('JobDetailPage', () => {
  const mockJob = {
    id: 'job-1',
    title: 'Software Engineer',
    description: 'Build amazing things',
    requirements: 'React, TypeScript',
    location: 'Bangkok',
    jobType: 'FULL_TIME',
    salaryMin: 50000,
    salaryMax: 80000,
    skills: ['React', 'TypeScript'],
    viewCount: 42,
    isActive: true,
    createdAt: new Date().toISOString(),
    recruiter: { companyName: 'TechCorp', id: 'r1' },
    _count: { applications: 5 },
  };

  it('shows spinner while loading', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: null, isLoading: true, error: null });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'job-1' }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders job title after loading', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: mockJob, isLoading: false, error: null });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'job-1' }} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('renders job description and requirements', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: mockJob, isLoading: false, error: null });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'job-1' }} />);
    expect(screen.getByText('Build amazing things')).toBeInTheDocument();
    expect(screen.getByText('React, TypeScript')).toBeInTheDocument();
  });

  it('renders Apply button when job is loaded', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: mockJob, isLoading: false, error: null });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'job-1' }} />);
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('renders error when job not found', () => {
    const { useJob } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: null, isLoading: false, error: 'Job not found' });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'bad-id' }} />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders similar jobs section', () => {
    const { useJob, useSimilarJobs } = require('@/hooks/useJobs');
    useJob.mockReturnValueOnce({ job: mockJob, isLoading: false, error: null });
    useSimilarJobs.mockReturnValueOnce({
      jobs: [{ id: 'j2', title: 'Frontend Dev', location: 'BKK', jobType: 'FULL_TIME', createdAt: new Date().toISOString() }],
      isLoading: false,
      error: null,
    });
    const JobDetailPage = require('@/app/dashboard/applicant/jobs/[id]/page').default;
    render(<JobDetailPage params={{ id: 'job-1' }} />);
    expect(screen.getByText(/similar jobs/i)).toBeInTheDocument();
  });
});

// ─── Applicant Profile page ───────────────────────────────────────────────────

describe('ApplicantProfilePage', () => {
  it('renders My Profile heading', () => {
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByText(/my profile/i)).toBeInTheDocument();
  });

  it('renders payment status section', () => {
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByText(/payment/i)).toBeInTheDocument();
  });

  it('renders personal information form', () => {
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
  });

  it('renders save profile button', () => {
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('calls PUT when profile form is submitted', async () => {
    api.put.mockResolvedValueOnce({});
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    const saveButton = screen.getByRole('button', { name: /save profile/i });
    saveButton.click();
    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
    });
  });

  it('shows verification status for verified user', () => {
    const { useAuth } = require('@/context/AuthContext');
    useAuth.mockReturnValueOnce({
      user: { id: 'u1', email: 'test@x.com', role: 'APPLICANT', firstName: 'Test', lastName: 'User', isVerified: true, isPaid: true },
      login: jest.fn(),
      logout: jest.fn(),
    });
    const ProfilePage = require('@/app/dashboard/applicant/profile/page').default;
    render(<ProfilePage />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });
});
