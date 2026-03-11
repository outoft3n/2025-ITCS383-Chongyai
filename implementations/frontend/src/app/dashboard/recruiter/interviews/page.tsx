'use client';

import { InterviewStatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, Interview } from '@/types';
import { format } from 'date-fns';
import { CalendarDays, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RecruiterInterviewsPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-gray-500 text-sm">Manage all scheduled interviews</p>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No interviews scheduled yet. Go to an applicant&apos;s profile to schedule one.
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{interview.application?.job?.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                    {interview.application?.applicant?.firstName} {interview.application?.applicant?.lastName}
                  </div>
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
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {interview.type.replaceAll('_', ' ')}
                </span>
              </div>
              {interview.notes && <p className="text-sm text-gray-400 italic mt-2">{interview.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
