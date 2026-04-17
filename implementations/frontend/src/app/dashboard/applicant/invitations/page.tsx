'use client';

import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle2, XCircle, MapPin, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { JobTypeBadge } from '@/components/ui/Badge';
import { useReceivedInvitations } from '@/hooks/useInvitations';
import type { InvitationStatus } from '@/types';

const statusConfig: Record<InvitationStatus, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle2, variant: 'success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant: 'destructive' },
};

export default function ReceivedInvitationsPage() {
  const { invitations, pagination, isLoading, error, respond } = useReceivedInvitations();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const handleRespond = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await respond(id, status);
    } catch {
      // error handled by hook
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Invitations</h1>
        <p className="text-gray-500 text-sm">{pagination.total} invitation(s) received</p>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>No job invitations yet.</p>
          <p className="text-sm mt-1">When recruiters invite you to apply, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const cfg = statusConfig[inv.status];
            const StatusIcon = cfg.icon;
            const isPending = inv.status === 'PENDING';
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {inv.recruiter?.recruiterProfile?.companyName ?? `${inv.recruiter?.firstName} ${inv.recruiter?.lastName}`}
                      </p>
                      {inv.recruiter?.recruiterProfile?.industry && (
                        <p className="text-xs text-gray-400">{inv.recruiter.recruiterProfile.industry}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs flex-shrink-0">
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </Badge>
                </div>

                {/* Job info */}
                <div className="mt-4 bg-orange-50 rounded-xl px-4 py-3">
                  <p className="font-semibold text-gray-900">{inv.job?.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {inv.job?.jobType && <JobTypeBadge type={inv.job.jobType} />}
                    {inv.job?.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />{inv.job.location}
                      </span>
                    )}
                    {(inv.job?.salaryMin || inv.job?.salaryMax) && (
                      <span className="text-xs text-gray-500">
                        {inv.job.salaryMin && `฿${inv.job.salaryMin.toLocaleString()}`}
                        {inv.job.salaryMin && inv.job.salaryMax && ' – '}
                        {inv.job.salaryMax && `฿${inv.job.salaryMax.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                </div>

                {inv.message && (
                  <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs font-medium text-gray-600 mb-1">Message from recruiter</p>
                    <p className="text-sm text-gray-700 italic">&ldquo;{inv.message}&rdquo;</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                  </p>
                  {isPending && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(inv.id, 'REJECTED')}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRespond(inv.id, 'ACCEPTED')}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept
                      </Button>
                    </div>
                  )}
                  {inv.status === 'ACCEPTED' && (
                    <p className="text-xs text-green-600 font-medium">Application created — check My Applications</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
