import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/types';

const mockUser: AuthUser = {
  id: '1',
  email: 'test@example.com',
  role: 'APPLICANT',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: null,
  isVerified: true,
  isPaid: false,
  profileImageUrl: null,
};

// Test consumer component
function TestConsumer() {
  const { user, token, isLoading, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login('tok123', mockUser)}>Login</button>
      <button onClick={() => updateUser({ ...mockUser, firstName: 'Updated' })}>Update</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'auth-token=; path=/; max-age=0';
    // Mock window.location.href setter
    delete (window as unknown as { location: unknown }).location;
    (window as unknown as { location: { href: string } }).location = { href: '' };
  });

  it('throws error when useAuth used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  it('starts with no user and finishes loading', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    // After useEffect runs, isLoading becomes false
    expect(await screen.findByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('restores user and token from localStorage on mount', async () => {
    localStorage.setItem('chongyai_token', 'stored-tok');
    localStorage.setItem('chongyai_user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByTestId('user')).toHaveTextContent(mockUser.email);
    expect(screen.getByTestId('token')).toHaveTextContent('stored-tok');
  });

  it('login sets user and token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await screen.findByTestId('loading'); // wait for mount

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email);
    expect(screen.getByTestId('token')).toHaveTextContent('tok123');
  });

  it('updateUser changes the stored user', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    await userEvent.click(screen.getByRole('button', { name: /update/i }));

    expect(screen.getByTestId('user')).toHaveTextContent(mockUser.email);
  });

  it('logout clears user and token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
  });
});
