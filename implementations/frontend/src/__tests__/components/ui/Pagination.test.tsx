import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders page buttons for small totalPages', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onPageChange with next page on next button click', async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page on prev button click', async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={jest.fn()} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('calls onPageChange when a page button is clicked', async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('shows ellipsis for large page counts', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={jest.fn()} />);
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });
});
