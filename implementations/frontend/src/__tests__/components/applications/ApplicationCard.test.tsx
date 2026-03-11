import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import type { Application } from '@/types';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockApplication: Application = {
  id: 'app1',
  applicantId: 'u1',
  jobId: 'j1',
  status: 'APPLIED',
  coverLetter: 'I am very interested in this position.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  job: {
    id: 'j1',
    recruiterId: 'r1',
    title: 'Frontend Developer',
    description: '',
    requirements: '',
    location: 'Bangkok',
    jobType: 'FULL_TIME',
    salaryMin: null,
    salaryMax: null,
    skills: [],
    viewCount: 0,
    isActive: true,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recruiter: {
      id: 'r1',
      firstName: 'Acme',
      lastName: 'Corp',
      recruiterProfile: { companyName: 'Acme Corp' },
    },
  },
  applicant: {
    id: 'u1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
    role: 'APPLICANT',
    phone: null,
    isVerified: true,
    isPaid: false,
    profileImageUrl: null,
  },
};

describe('ApplicationCard', () => {
  it('renders job title', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders company name', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders cover letter', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.getByText(/very interested/i)).toBeInTheDocument();
  });

  it('shows applicant name when showApplicant=true', () => {
    render(<ApplicationCard application={mockApplication} showApplicant />);
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  it('does not show applicant name by default', () => {
    render(<ApplicationCard application={mockApplication} />);
    expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
  });

  it('renders View Profile link when showViewProfile=true', () => {
    render(<ApplicationCard application={mockApplication} showApplicant showViewProfile />);
    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });

  it('renders status select when onStatusChange provided', () => {
    render(<ApplicationCard application={mockApplication} onStatusChange={jest.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onStatusChange when select changes', async () => {
    const onStatusChange = jest.fn().mockResolvedValue(undefined);
    render(<ApplicationCard application={mockApplication} onStatusChange={onStatusChange} />);

    await userEvent.selectOptions(screen.getByRole('combobox'), 'REVIEWING');
    expect(onStatusChange).toHaveBeenCalledWith('app1', 'REVIEWING');
  });

  it('renders Schedule Interview button when showScheduleInterview=true', () => {
    const onSchedule = jest.fn();
    render(
      <ApplicationCard
        application={mockApplication}
        showScheduleInterview
        onScheduleInterview={onSchedule}
      />,
    );
    expect(screen.getByRole('button', { name: /schedule interview/i })).toBeInTheDocument();
  });

  it('calls onScheduleInterview when button clicked', async () => {
    const onSchedule = jest.fn();
    render(
      <ApplicationCard
        application={mockApplication}
        showScheduleInterview
        onScheduleInterview={onSchedule}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /schedule interview/i }));
    expect(onSchedule).toHaveBeenCalledWith(mockApplication);
  });

  it('renders with no job title fallback', () => {
    const appWithoutJob = { ...mockApplication, job: undefined };
    render(<ApplicationCard application={appWithoutJob} />);
    expect(screen.getByText('Job')).toBeInTheDocument();
  });
});
