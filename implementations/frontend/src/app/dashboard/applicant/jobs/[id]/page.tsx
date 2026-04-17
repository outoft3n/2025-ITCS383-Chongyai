'use client';

import { useState } from 'react';
import { MapPin, Briefcase, Banknote, Eye, Calendar, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { JobTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useJob, useSimilarJobs } from '@/hooks/useJobs';
import { useBookmarkCheck } from '@/hooks/useBookmarks';
import { JobCard } from '@/components/jobs/JobCard';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, Application } from '@/types';

interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = params;
  const { job, isLoading, error } = useJob(id);
  const { bookmarked, toggle: toggleBookmark } = useBookmarkCheck(id);
  const { jobs: similarJobs, isLoading: similarLoading } = useSimilarJobs(id);
  const [applyModal, setApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApply = async () => {
    setApplying(true);
    setApplyError(null);
    try {
      await api.post<ApiResponse<Application>>('/applications', { jobId: id, coverLetter });
      setApplied(true);
      setApplyModal(false);
    } catch (err) {
      setApplyError(getApiErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error || !job) return <div className="text-center py-8 text-red-500">{error ?? 'Job not found'}</div>;

  const companyName = job.recruiter?.recruiterProfile?.companyName ?? 'Unknown Company';

  return (
    <div className="space-y-5 max-w-3xl">
      <Link href="/dashboard/applicant/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-primary font-semibold mt-1">{companyName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleBookmark}
              className="p-2 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-colors"
              title={bookmarked ? 'Remove bookmark' : 'Save job'}
            >
              {bookmarked ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <JobTypeBadge type={job.jobType} />
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3.5 h-3.5" /> {job.location}
          </div>
          {(job.salaryMin ?? job.salaryMax) && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Banknote className="w-3.5 h-3.5" />
              {job.salaryMin && job.salaryMax ? `฿${job.salaryMin.toLocaleString()}–฿${job.salaryMax.toLocaleString()}` : ''}
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Eye className="w-3.5 h-3.5" /> {job.viewCount} views
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </div>
        </div>

        <Button
          onClick={() => setApplyModal(true)}
          disabled={applied}
          className="w-full sm:w-auto"
        >
          <Briefcase className="w-4 h-4" />
          {applied ? 'Application Submitted' : 'Apply Now'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <h2 className="font-bold text-gray-900 mb-2">Job Description</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 mb-2">Requirements</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
        </div>
        {job.skills.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={applyModal} onClose={() => setApplyModal(false)} title="Apply for this job">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Applying for: <span className="font-semibold">{job.title}</span> at {companyName}</p>
          <div>
            <label htmlFor="cover-letter" className="text-sm font-medium text-gray-700 block mb-1">Cover Letter (optional)</label>
            <textarea
              id="cover-letter"
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly describe why you're a great fit..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          {applyError && <p className="text-sm text-red-600">{applyError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleApply} isLoading={applying} className="flex-1">Submit Application</Button>
            <Button variant="ghost" onClick={() => setApplyModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Similar Jobs */}
      {(similarLoading || similarJobs.length > 0) && (
        <div className="pt-2">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Similar Jobs</h2>
          {similarLoading ? (
            <div className="flex justify-center py-6"><Spinner size="md" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {similarJobs.map((similar) => (
                <JobCard key={similar.id} job={similar} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
