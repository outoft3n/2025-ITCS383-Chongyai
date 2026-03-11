import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="my-card">Content</Card>);
    expect(container.firstChild).toHaveClass('my-card');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders padding=%s without error', (padding) => {
    render(<Card padding={padding}>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies hover class when hover=true', () => {
    const { container } = render(<Card hover>Hoverable</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('does not apply hover class by default', () => {
    const { container } = render(<Card>Static</Card>);
    expect(container.firstChild).not.toHaveClass('cursor-pointer');
  });
});
