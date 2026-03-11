'use client';

import React, { useState, useCallback } from 'react';
import { JobFilter } from '@/components/jobs/JobFilter';
import { JobCard } from '@/components/jobs/JobCard';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useJobs } from '@/hooks/useJobs';
import type { SearchFilters } from '@/types';

export default function ApplicantJobsPage() {
  const [filters, setFilters] = useState<SearchFilters>({ page: 1 });

  const { jobs, pagination, isLoading, error } = useJobs(filters);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters({ ...newFilters, page: 1 });
  }, []);

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (jobs.length === 0) {
    content = <div className="text-center py-16 text-gray-400">No jobs found matching your criteria.</div>;
  } else {
    content = (
      <>
        <p className="text-sm text-gray-500">{pagination.total} jobs found</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-500 text-sm">Discover opportunities that match your skills</p>
      </div>
      <JobFilter onFilterChange={handleFilterChange} />
      {content}
    </div>
  );
}
