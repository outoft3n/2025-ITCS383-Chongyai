import React from 'react';
import { render, screen } from '@testing-library/react';
import { JobCard } from '@/components/jobs/JobCard';
import type { Job } from '@/types';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockJob: Job = {
  id: 'j1',
  recruiterId: 'r1',
  title: 'Software Engineer',
  description: 'A great job',
  requirements: 'TypeScript experience',
  location: 'Bangkok',
  jobType: 'FULL_TIME',
  salaryMin: 50000,
  salaryMax: 80000,
  skills: ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS'],
  viewCount: 42,
  isActive: true,
  expiresAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  recruiter: {
    id: 'r1',
    firstName: 'Company',
    lastName: 'Name',
    recruiterProfile: { companyName: 'Tech Corp' },
  },
};

describe('JobCard', () => {
  it('renders job title', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('renders company name', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('renders location', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Bangkok')).toBeInTheDocument();
  });

  it('renders job type badge', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Full Time')).toBeInTheDocument();
  });

  it('renders salary range', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
    expect(screen.getByText(/80,000/)).toBeInTheDocument();
  });

  it('renders skills (up to 4)', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('shows +N more for skills beyond 4', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('renders view count', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('uses default href when no href prop', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard/applicant/jobs/j1');
  });

  it('uses custom href when provided', () => {
    render(<JobCard job={mockJob} href="/custom/path" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/custom/path');
  });

  it('renders fallback company name when no recruiter profile', () => {
    const jobWithoutProfile = {
      ...mockJob,
      recruiter: { id: 'r1', firstName: 'A', lastName: 'B', recruiterProfile: null },
    };
    render(<JobCard job={jobWithoutProfile} />);
    expect(screen.getByText('Unknown Company')).toBeInTheDocument();
  });

  it('renders only salaryMin when salaryMax is null', () => {
    const job = { ...mockJob, salaryMax: null };
    render(<JobCard job={job} />);
    expect(screen.getByText(/From ฿50,000/)).toBeInTheDocument();
  });

  it('renders only salaryMax when salaryMin is null', () => {
    const job = { ...mockJob, salaryMin: null, salaryMax: 80000 };
    render(<JobCard job={job} />);
    expect(screen.getByText(/Up to ฿80,000/)).toBeInTheDocument();
  });

  it('does not render salary when both are null', () => {
    const job = { ...mockJob, salaryMin: null, salaryMax: null };
    render(<JobCard job={job} />);
    expect(screen.queryByText(/฿/)).not.toBeInTheDocument();
  });

  it('does not render skills section when empty', () => {
    const job = { ...mockJob, skills: [] };
    render(<JobCard job={job} />);
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
