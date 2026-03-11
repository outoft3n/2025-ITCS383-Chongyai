import { renderHook } from '@testing-library/react';
import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/context/AuthContext';
import type { AuthUser } from '@/types';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: jest.fn(),
}));

import { useAuth } from '@/context/AuthContext';

const mockUser: AuthUser = {
  id: '1',
  email: 'user@test.com',
  role: 'APPLICANT',
  firstName: 'Test',
  lastName: 'User',
  phone: null,
  isVerified: true,
  isPaid: false,
  profileImageUrl: null,
};

describe('useRequireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when no user and not loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false });
    renderHook(() => useRequireAuth());
    expect(mockReplace).toHaveBeenCalledWith('/auth/login');
  });

  it('does not redirect when loading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: true });
    renderHook(() => useRequireAuth());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when user is present without role requirement', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
    renderHook(() => useRequireAuth());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects when user role does not match required role', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
    renderHook(() => useRequireAuth('RECRUITER'));
    expect(mockReplace).toHaveBeenCalledWith('/dashboard/applicant');
  });

  it('does not redirect when user role matches required role', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
    renderHook(() => useRequireAuth('APPLICANT'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('returns user and isLoading from context', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isLoading: false });
    const { result } = renderHook(() => useRequireAuth());
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });
});
