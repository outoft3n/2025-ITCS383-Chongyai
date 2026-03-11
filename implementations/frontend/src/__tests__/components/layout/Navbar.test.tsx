import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '@/components/layout/Navbar';
import type { AuthUser } from '@/types';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/context/AuthContext';

const mockUser: AuthUser = {
  id: '1',
  email: 'user@test.com',
  role: 'APPLICANT',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: null,
  isVerified: true,
  isPaid: false,
  profileImageUrl: null,
};

const mockLogout = jest.fn();

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, logout: mockLogout });
    });

    it('renders Sign In and Get Started links', () => {
      render(<Navbar />);
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('renders the logo', () => {
      render(<Navbar />);
      expect(screen.getByText('Chongyai')).toBeInTheDocument();
    });

    it('renders Find Jobs link', () => {
      render(<Navbar />);
      expect(screen.getAllByText('Find Jobs')[0]).toBeInTheDocument();
    });
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: mockUser, logout: mockLogout });
    });

    it('renders user first name', () => {
      render(<Navbar />);
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    it('renders Dashboard link', () => {
      render(<Navbar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('does not render Sign In when logged in', () => {
      render(<Navbar />);
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('shows dropdown on user button click', async () => {
      render(<Navbar />);
      await userEvent.click(screen.getByText('Jane'));
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('calls logout when Sign Out clicked', async () => {
      render(<Navbar />);
      await userEvent.click(screen.getByText('Jane'));
      await userEvent.click(screen.getByText('Sign Out'));
      expect(mockLogout).toHaveBeenCalled();
    });

    it('navigates to profile on Profile click', async () => {
      render(<Navbar />);
      await userEvent.click(screen.getByText('Jane'));
      await userEvent.click(screen.getByText('Profile'));
      expect(mockPush).toHaveBeenCalledWith('/dashboard/applicant/profile');
    });
  });

  describe('mobile menu', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, logout: mockLogout });
    });

    it('toggles mobile menu on button click', async () => {
      render(<Navbar />);
      const toggleBtn = screen.getByLabelText('Toggle menu');
      await userEvent.click(toggleBtn);
      // Mobile menu links appear
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    });
  });
});
