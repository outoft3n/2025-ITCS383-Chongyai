import {
  getToken,
  setToken,
  removeToken,
  setUser,
  getStoredUser,
  getDashboardPath,
} from '@/lib/auth';
import type { AuthUser } from '@/types';

const mockUser: AuthUser = {
  id: '1',
  email: 'test@example.com',
  role: 'APPLICANT',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
  isVerified: true,
  isPaid: false,
  profileImageUrl: null,
};

describe('auth lib', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset cookies
    document.cookie = 'auth-token=; path=/; max-age=0';
  });

  describe('getToken', () => {
    it('returns null when no token in localStorage', () => {
      expect(getToken()).toBeNull();
    });

    it('returns token when stored in localStorage', () => {
      localStorage.setItem('chongyai_token', 'abc123');
      expect(getToken()).toBe('abc123');
    });
  });

  describe('setToken', () => {
    it('stores token in localStorage', () => {
      setToken('mytoken');
      expect(localStorage.getItem('chongyai_token')).toBe('mytoken');
    });

    it('sets auth-token cookie', () => {
      setToken('mytoken');
      expect(document.cookie).toContain('auth-token=mytoken');
    });
  });

  describe('removeToken', () => {
    it('removes token and user from localStorage', () => {
      localStorage.setItem('chongyai_token', 'abc');
      localStorage.setItem('chongyai_user', JSON.stringify(mockUser));
      removeToken();
      expect(localStorage.getItem('chongyai_token')).toBeNull();
      expect(localStorage.getItem('chongyai_user')).toBeNull();
    });

    it('clears auth-token cookie', () => {
      setToken('mytoken');
      removeToken();
      expect(document.cookie).not.toContain('auth-token=mytoken');
    });
  });

  describe('setUser', () => {
    it('stores user as JSON in localStorage', () => {
      setUser(mockUser);
      const stored = localStorage.getItem('chongyai_user');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });
  });

  describe('getStoredUser', () => {
    it('returns null when no user stored', () => {
      expect(getStoredUser()).toBeNull();
    });

    it('returns parsed user when stored', () => {
      localStorage.setItem('chongyai_user', JSON.stringify(mockUser));
      expect(getStoredUser()).toEqual(mockUser);
    });

    it('returns null when stored value is invalid JSON', () => {
      localStorage.setItem('chongyai_user', 'not-json');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('getDashboardPath', () => {
    it('returns applicant dashboard for APPLICANT role', () => {
      expect(getDashboardPath('APPLICANT')).toBe('/dashboard/applicant');
    });

    it('returns recruiter dashboard for RECRUITER role', () => {
      expect(getDashboardPath('RECRUITER')).toBe('/dashboard/recruiter');
    });

    it('returns admin dashboard for ADMIN role', () => {
      expect(getDashboardPath('ADMIN')).toBe('/dashboard/admin');
    });
  });
});
