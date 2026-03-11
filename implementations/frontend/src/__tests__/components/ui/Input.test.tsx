import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('renders with label and associates it to input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders error message and applies error styling', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('renders helper text when no error', () => {
    render(<Input helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('does not render helper text when error is present', () => {
    render(<Input helperText="Helper" error="Error" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'John');
    expect(input).toHaveValue('John');
  });

  it('uses provided id over auto-generated one', () => {
    render(<Input id="custom-id" label="Name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id');
  });

  it('auto-generates id from label', () => {
    render(<Input label="First Name" />);
    expect(screen.getByLabelText('First Name')).toHaveAttribute('id', 'first-name');
  });
});
