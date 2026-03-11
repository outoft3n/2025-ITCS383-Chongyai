import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder';

describe('ChartPlaceholder', () => {
  const data = [
    { label: 'Jan', value: 10 },
    { label: 'Feb', value: 20, color: 'bg-blue-500' },
    { label: 'Mar', value: 0 },
  ];

  it('renders title', () => {
    render(<ChartPlaceholder title="Monthly Stats" data={data} />);
    expect(screen.getByText('Monthly Stats')).toBeInTheDocument();
  });

  it('renders all bar labels', () => {
    render(<ChartPlaceholder title="Stats" data={data} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('renders all bar values', () => {
    render(<ChartPlaceholder title="Stats" data={data} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles empty data without crash', () => {
    render(<ChartPlaceholder title="Empty" data={[]} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
