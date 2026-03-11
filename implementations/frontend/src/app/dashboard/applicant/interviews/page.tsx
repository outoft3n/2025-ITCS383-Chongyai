'use client';

import { InterviewStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, Interview } from '@/types';
import { format } from 'date-fns';
import { CalendarDays, Clock, MapPin, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ApplicantInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ApiResponse<Interview[]>>('/interviews/mine')
      .then((res) => setInterviews(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="text-gray-500 text-sm">Your scheduled and past interviews</p>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No interviews scheduled yet.</div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{interview.application?.job?.title ?? 'Interview'}</h3>
                  <p className="text-sm text-gray-500">{interview.application?.job?.recruiter?.recruiterProfile?.companyName}</p>
                </div>
                <InterviewStatusBadge status={interview.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {format(new Date(interview.scheduledAt), 'PPP')}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {format(new Date(interview.scheduledAt), 'p')} ({interview.duration} min)
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {interview.type.replaceAll('_', ' ')}
                </div>
              </div>
              {interview.notes && <p className="text-sm text-gray-400 italic mt-2">{interview.notes}</p>}
              {interview.type === 'VIDEO' && interview.conferenceId && interview.status === 'SCHEDULED' && (
                <div className="mt-3">
                  <Link href={`/dashboard/conference/${interview.conferenceId}`}>
                    <Button size="sm" variant="secondary">
                      <Video className="w-3.5 h-3.5" />
                      Join Video Interview
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
