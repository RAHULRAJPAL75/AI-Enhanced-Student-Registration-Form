import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import App from '../App';

describe('student portal app', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/login')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Login successful!',
              student: { name: 'Test Student', email: 'student@example.com' },
            }),
        });
      }
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              students: [{ _id: '1', name: 'Test Student', email: 'student@example.com' }],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  it('shows the student dashboard for students and hides admin controls', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: 'Login' }));

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open dashboard' }));

    await waitFor(() => {
      expect(screen.getByText('My Student Workspace')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Add Student/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
  });
});
