import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

jest.mock('@/components/layout/Sidebar', () => ({
  Sidebar: ({ role }: { role: string }) => (
    <div data-testid="sidebar" data-role={role} />
  ),
}));

describe('DashboardLayout', () => {
  it('renders children inside main', () => {
    render(
      <DashboardLayout role="APPLICANT">
        <p>Hello World</p>
      </DashboardLayout>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders Sidebar with APPLICANT role', () => {
    render(
      <DashboardLayout role="APPLICANT">
        <span />
      </DashboardLayout>,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-role', 'APPLICANT');
  });

  it('renders Sidebar with RECRUITER role', () => {
    render(
      <DashboardLayout role="RECRUITER">
        <span />
      </DashboardLayout>,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-role', 'RECRUITER');
  });

  it('renders Sidebar with ADMIN role', () => {
    render(
      <DashboardLayout role="ADMIN">
        <span />
      </DashboardLayout>,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-role', 'ADMIN');
  });

  it('renders multiple children', () => {
    render(
      <DashboardLayout role="APPLICANT">
        <p>First</p>
        <p>Second</p>
      </DashboardLayout>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
