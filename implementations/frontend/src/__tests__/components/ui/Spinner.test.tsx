import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with default role and aria-label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without error', (size) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Spinner className="extra-class" />);
    expect(screen.getByRole('status')).toHaveClass('extra-class');
  });
});
