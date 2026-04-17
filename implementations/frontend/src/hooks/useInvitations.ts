'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Invitation, PaginatedResponse, ApiResponse, InvitationStatus } from '@/types';

export function useSentInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (page = 1, status?: InvitationStatus) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      const res = await api.get<PaginatedResponse<Invitation>>(`/invitations/sent?${params}`);
      setInvitations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const sendInvitation = async (applicantId: string, jobId: string, message?: string): Promise<Invitation> => {
    const res = await api.post<ApiResponse<Invitation>>('/invitations', { applicantId, jobId, message });
    await fetch();
    return res.data.data;
  };

  return { invitations, pagination, isLoading, error, sendInvitation, refetch: fetch };
}

export function useReceivedInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (page = 1, status?: InvitationStatus) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      const res = await api.get<PaginatedResponse<Invitation>>(`/invitations/received?${params}`);
      setInvitations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const respond = async (id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<void> => {
    await api.put(`/invitations/${id}/respond`, { status });
    await fetch();
  };

  return { invitations, pagination, isLoading, error, respond, refetch: fetch };
}
