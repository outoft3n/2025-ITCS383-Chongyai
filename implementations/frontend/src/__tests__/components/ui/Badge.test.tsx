import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Badge,
  ApplicationStatusBadge,
  JobTypeBadge,
  InterviewStatusBadge,
} from '@/components/ui/Badge';
import type { ApplicationStatus, JobType, InterviewStatus } from '@/types';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="my-class">Text</Badge>);
    expect(screen.getByText('Text')).toHaveClass('my-class');
  });

  it.each(['default', 'success', 'error', 'warning', 'info', 'orange', 'yellow', 'secondary', 'destructive'] as const)(
    'renders variant=%s without error',
    (variant) => {
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
    },
  );
});

describe('ApplicationStatusBadge', () => {
  const cases: [ApplicationStatus, string][] = [
    ['APPLIED', 'Applied'],
    ['REVIEWING', 'Under Review'],
    ['INTERVIEWING', 'Interviewing'],
    ['ACCEPTED', 'Accepted'],
    ['REJECTED', 'Rejected'],
  ];

  it.each(cases)('renders label for status=%s', (status, label) => {
    render(<ApplicationStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('JobTypeBadge', () => {
  const cases: [JobType, string][] = [
    ['FULL_TIME', 'Full Time'],
    ['PART_TIME', 'Part Time'],
    ['CONTRACT', 'Contract'],
    ['INTERNSHIP', 'Internship'],
    ['REMOTE', 'Remote'],
  ];

  it.each(cases)('renders label for type=%s', (type, label) => {
    render(<JobTypeBadge type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('InterviewStatusBadge', () => {
  const statuses: InterviewStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED'];

  it.each(statuses)('renders status=%s', (status) => {
    render(<InterviewStatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });
});
