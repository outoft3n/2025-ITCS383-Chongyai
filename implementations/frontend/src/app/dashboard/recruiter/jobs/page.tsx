'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { JobTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useMyJobs } from '@/hooks/useJobs';

export default function RecruiterJobsPage() {
  const { jobs, isLoading, error, updateJob } = useMyJobs();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 text-sm">{jobs.length} job posting(s)</p>
        </div>
        <Link href="/dashboard/recruiter/jobs/new">
          <Button size="sm"><Plus className="w-4 h-4" />Post Job</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>No jobs posted yet.</p>
          <Link href="/dashboard/recruiter/jobs/new">
            <Button className="mt-3" size="sm"><Plus className="w-4 h-4" />Post First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <JobTypeBadge type={job.jobType} />
                    {!job.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{job.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {job._count?.applications ?? 0} applications •{' '}
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateJob(job.id, { isActive: !job.isActive })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-orange-50 transition-colors"
                    title={job.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {job.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`}>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href={`/dashboard/recruiter/jobs/${job.id}/applications`}>
                    <Button size="sm" variant="outline">View Applicants</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
