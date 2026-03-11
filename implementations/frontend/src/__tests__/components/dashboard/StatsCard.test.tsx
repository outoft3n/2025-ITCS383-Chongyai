import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Briefcase } from 'lucide-react';

describe('StatsCard', () => {
  it('renders title and numeric value', () => {
    render(<StatsCard title="Total Jobs" value={42} icon={Briefcase} />);
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatsCard title="Status" value="Active" icon={Briefcase} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatsCard title="Jobs" value={10} icon={Briefcase} description="Last 30 days" />);
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<StatsCard title="Jobs" value={10} icon={Briefcase} />);
    expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument();
  });

  it.each(['orange', 'yellow', 'green', 'blue'] as const)(
    'renders color=%s without error',
    (color) => {
      render(<StatsCard title="Title" value={1} icon={Briefcase} color={color} />);
      expect(screen.getByText('Title')).toBeInTheDocument();
    },
  );

  it('formats large numbers with locale string', () => {
    render(<StatsCard title="Revenue" value={1000000} icon={Briefcase} />);
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });
});
