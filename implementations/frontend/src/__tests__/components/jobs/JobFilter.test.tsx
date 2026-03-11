import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobFilter } from '@/components/jobs/JobFilter';

describe('JobFilter', () => {
  it('renders search input and filter controls', () => {
    render(<JobFilter onFilterChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onFilterChange with entered values when Search is clicked', async () => {
    const onFilterChange = jest.fn();
    render(<JobFilter onFilterChange={onFilterChange} />);

    await userEvent.type(screen.getByPlaceholderText('Search jobs...'), 'engineer');
    await userEvent.type(screen.getByPlaceholderText('Location'), 'Bangkok');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'engineer', location: 'Bangkok' }),
    );
  });

  it('calls onFilterChange on Enter key in search input', async () => {
    const onFilterChange = jest.fn();
    render(<JobFilter onFilterChange={onFilterChange} />);

    await userEvent.type(screen.getByPlaceholderText('Search jobs...'), 'dev{Enter}');
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('resets all fields and calls onFilterChange with empty object', async () => {
    const onFilterChange = jest.fn();
    render(<JobFilter onFilterChange={onFilterChange} />);

    await userEvent.type(screen.getByPlaceholderText('Search jobs...'), 'test');
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByPlaceholderText('Search jobs...')).toHaveValue('');
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  it('passes undefined for empty optional fields', async () => {
    const onFilterChange = jest.fn();
    render(<JobFilter onFilterChange={onFilterChange} />);

    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onFilterChange).toHaveBeenCalledWith({
      q: undefined,
      jobType: undefined,
      location: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
    });
  });

  it('parses salary values as numbers', async () => {
    const onFilterChange = jest.fn();
    render(<JobFilter onFilterChange={onFilterChange} />);

    await userEvent.type(screen.getByPlaceholderText('Min ฿'), '30000');
    await userEvent.type(screen.getByPlaceholderText('Max ฿'), '80000');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ salaryMin: 30000, salaryMax: 80000 }),
    );
  });
});
