'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Job, PaginatedResponse, ApiResponse, CreateJobForm, SearchFilters } from '@/types';

export function useJobs(filters?: SearchFilters) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.jobType) params.set('jobType', filters.jobType);
      if (filters?.location) params.set('location', filters.location);
      if (filters?.salaryMin) params.set('salaryMin', String(filters.salaryMin));
      if (filters?.salaryMax) params.set('salaryMax', String(filters.salaryMax));
      if (filters?.skills?.length) params.set('skills', filters.skills.join(','));
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));

      const endpoint = filters && Object.keys(filters).some((k) => k !== 'page' && k !== 'limit' && filters[k as keyof SearchFilters])
        ? `/search/jobs?${params}`
        : `/jobs?${params}`;

      const res = await api.get<PaginatedResponse<Job>>(endpoint);
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, pagination, isLoading, error, refetch: fetchJobs };
}

export function useJob(id: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get<ApiResponse<Job>>(`/jobs/${id}`)
      .then((res) => setJob(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { job, isLoading, error };
}

export function useMyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Job>>('/jobs/recruiter/mine');
      setJobs(res.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createJob = async (data: CreateJobForm): Promise<Job> => {
    const res = await api.post<ApiResponse<Job>>('/jobs', data);
    await fetch();
    return res.data.data;
  };

  const updateJob = async (id: string, data: Partial<CreateJobForm>): Promise<Job> => {
    const res = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    await fetch();
    return res.data.data;
  };

  const deleteJob = async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
    await fetch();
  };

  return { jobs, isLoading, error, createJob, updateJob, deleteJob, refetch: fetch };
}

export function useSimilarJobs(jobId: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setIsLoading(true);
    api.get<ApiResponse<Job[]>>(`/recommendations/similar/${jobId}`)
      .then((res) => setJobs(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [jobId]);

  return { jobs, isLoading, error };
}
