import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard/applicant'),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
    return <a href={href} className={className}>{children}</a>;
  };
});

import { usePathname } from 'next/navigation';

describe('Sidebar', () => {
  it('renders applicant nav items', () => {
    render(<Sidebar role="APPLICANT" />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Find Jobs')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Saved Jobs')).toBeInTheDocument();
  });

  it('renders recruiter nav items', () => {
    render(<Sidebar role="RECRUITER" />);
    expect(screen.getByText('My Jobs')).toBeInTheDocument();
    expect(screen.getByText('Post a Job')).toBeInTheDocument();
  });

  it('renders admin nav items', () => {
    render(<Sidebar role="ADMIN" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('marks active item based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/applicant/jobs');
    render(<Sidebar role="APPLICANT" />);
    const findJobsLink = screen.getByText('Find Jobs').closest('a');
    expect(findJobsLink).toHaveClass('bg-primary');
  });

  it('does not mark non-active items', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard/applicant/jobs');
    render(<Sidebar role="APPLICANT" />);
    const applicationsLink = screen.getByText('My Applications').closest('a');
    expect(applicationsLink).not.toHaveClass('bg-primary');
  });
});
