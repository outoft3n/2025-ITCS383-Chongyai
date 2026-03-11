import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { JobForm } from '@/components/jobs/JobForm';

describe('JobForm', () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.useRealTimers();
  });

  it('submits valid job data and resets skill input', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<JobForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/Job Title/i), 'Test Job');
    await userEvent.type(screen.getByLabelText(/Description/i), 'This is a description');
    await userEvent.type(screen.getByLabelText(/Requirements/i), 'These are requirements');
    await userEvent.type(screen.getByLabelText(/Location/i), 'Bangkok');

    // Fill salary fields to satisfy positive number validation
    await userEvent.type(screen.getByLabelText(/Min Salary/i), '1000');
    await userEvent.type(screen.getByLabelText(/Max Salary/i), '2000');

    // Add a skill
    const skillInput = screen.getByPlaceholderText(/Add skill/i);
    await userEvent.type(skillInput, 'React');
    fireEvent.keyDown(skillInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('React')).toBeInTheDocument();

    // Remove the skill (button has no accessible label, so locate via the tag container)
    const tag = screen.getByText('React').closest('span');
    expect(tag).toBeInTheDocument();
    const removeButton = tag ? tag.querySelector('button') : null;
    expect(removeButton).toBeInTheDocument();
    if (removeButton) {
      await userEvent.click(removeButton);
    }
    expect(screen.queryByText('React')).not.toBeInTheDocument();

    // Submit form
    const submitButton = screen.getByRole('button', { name: /post job/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Job',
      location: 'Bangkok',
    }));
  });
});
