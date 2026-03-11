'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { Spinner } from '@/components/ui/Spinner';
import { useJobApplications } from '@/hooks/useApplications';
import type { Application, ApplicationStatus } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function JobApplicationsPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { applications, isLoading, error, updateStatus } = useJobApplications(id);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await updateStatus(appId, status);
  };

  const handleScheduleInterview = (application: Application) => {
    router.push(`/dashboard/recruiter/applicants/${application.applicantId}?scheduleInterview=true&applicationId=${application.id}`);
  };

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else if (applications.length === 0) {
    content = (
      <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
        No applications received yet.
      </div>
    );
  } else {
    content = (
      <div className="grid gap-3">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            showApplicant
            showViewProfile
            showScheduleInterview
            onStatusChange={handleStatusChange}
            onScheduleInterview={handleScheduleInterview}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 text-sm">{applications.length} application(s) for this position</p>
      </div>
      {content}
    </div>
  );
}
