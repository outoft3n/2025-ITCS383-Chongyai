import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={onClose}><p>Content</p></Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when isOpen is true', () => {
    render(<Modal isOpen onClose={onClose}><p>Content</p></Modal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal isOpen onClose={onClose} title="My Modal"><p>Body</p></Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    render(<Modal isOpen onClose={onClose} title="Modal"><p>Body</p></Modal>);
    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    render(<Modal isOpen onClose={onClose}><p>Body</p></Modal>);
    // Click the backdrop (aria-hidden overlay)
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal isOpen onClose={onClose}><p>Body</p></Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when closed', () => {
    render(<Modal isOpen={false} onClose={onClose}><p>Body</p></Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s without error', (size) => {
    render(<Modal isOpen onClose={onClose} size={size}><p>Content</p></Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
