import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('renders with label and associates it to select', () => {
    render(<Select label="Role" options={options} />);
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders placeholder as first option', () => {
    render(<Select options={options} placeholder="Choose..." />);
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Select options={options} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('uses provided id over auto-generated one', () => {
    render(<Select id="my-select" label="Role" options={options} />);
    expect(screen.getByLabelText('Role')).toHaveAttribute('id', 'my-select');
  });

  it('auto-generates id from label', () => {
    render(<Select label="Job Type" options={options} />);
    expect(screen.getByLabelText('Job Type')).toHaveAttribute('id', 'job-type');
  });

  it('calls onChange when selection changes', async () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(handleChange).toHaveBeenCalled();
  });
});
