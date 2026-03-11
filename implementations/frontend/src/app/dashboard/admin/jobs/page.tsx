'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Eye, EyeOff } from 'lucide-react';
import { JobTypeBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Job, PaginatedResponse, ApiResponse } from '@/types';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Job>>(`/jobs?page=${page}&limit=20`);
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const toggleActive = async (job: Job) => {
    try {
      await api.put(`/jobs/${job.id}`, { isActive: !job.isActive });
      fetchJobs(pagination.page);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else {
    content = (
      <>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Job</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Views</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Posted</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-gray-400 text-xs">{job.location}</p>
                  </td>
                  <td className="px-4 py-3"><JobTypeBadge type={job.jobType} /></td>
                  <td className="px-4 py-3 text-gray-600">{job.viewCount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(job)}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {job.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchJobs} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        <p className="text-gray-500 text-sm">{pagination.total} job postings</p>
      </div>
      {content}
    </div>
  );
}
