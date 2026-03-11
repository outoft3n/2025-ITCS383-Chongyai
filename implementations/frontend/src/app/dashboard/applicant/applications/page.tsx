'use client';

import React from 'react';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useMyApplications } from '@/hooks/useApplications';

export default function ApplicantApplicationsPage() {
  const { applications, pagination, isLoading, error, refetch } = useMyApplications();

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (applications.length === 0) {
    content = (
      <div className="text-center py-16 text-gray-400">
        <p>No applications yet. Start applying for jobs!</p>
      </div>
    );
  } else {
    content = (
      <>
        <p className="text-sm text-gray-500">{pagination.total} applications</p>
        <div className="grid gap-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => refetch(p)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 text-sm">Track the status of all your job applications</p>
      </div>
      {content}
    </div>
  );
}
