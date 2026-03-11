import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Chongyai')).toBeInTheDocument();
  });

  it('renders For Job Seekers section', () => {
    render(<Footer />);
    expect(screen.getByText('For Job Seekers')).toBeInTheDocument();
    expect(screen.getByText('Browse Jobs')).toBeInTheDocument();
  });

  it('renders For Employers section', () => {
    render(<Footer />);
    expect(screen.getByText('For Employers')).toBeInTheDocument();
    expect(screen.getByText('Post a Job')).toBeInTheDocument();
    expect(screen.getByText('Recruiter Login')).toBeInTheDocument();
  });

  it('renders current year in copyright', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
