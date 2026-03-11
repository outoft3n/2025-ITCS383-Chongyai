'use client';

import { useAuth as useAuthContext } from '@/context/AuthContext';
import type { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export { useAuth } from '@/context/AuthContext';

export function useRequireAuth(requiredRole?: Role) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replaceAll('/auth/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replaceAll('/dashboard/applicant');
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}
