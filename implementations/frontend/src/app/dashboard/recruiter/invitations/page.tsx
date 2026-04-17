'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { JobTypeBadge } from '@/components/ui/Badge';
import { useSentInvitations } from '@/hooks/useInvitations';
import type { InvitationStatus } from '@/types';

const statusConfig: Record<InvitationStatus, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  PENDING: { label: 'Pending', icon: Clock, variant: 'warning' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle2, variant: 'success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant: 'destructive' },
};

export default function SentInvitationsPage() {
  const { invitations, pagination, isLoading, error, refetch } = useSentInvitations();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sent Invitations</h1>
          <p className="text-gray-500 text-sm">{pagination.total} invitation(s) sent</p>
        </div>
        <Link href="/dashboard/recruiter/search">
          <Button size="sm"><Send className="w-4 h-4" />Search Applicants</Button>
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p>No invitations sent yet.</p>
          <Link href="/dashboard/recruiter/search">
            <Button className="mt-3" size="sm"><Send className="w-4 h-4" />Find Applicants</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const cfg = statusConfig[inv.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {inv.applicant?.firstName?.[0]}{inv.applicant?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {inv.applicant?.firstName} {inv.applicant?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{inv.applicant?.email}</p>
                      {inv.applicant?.applicantProfile?.skills && inv.applicant.applicantProfile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inv.applicant.applicantProfile.skills.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {inv.applicant.applicantProfile.skills.length > 3 && (
                            <span className="text-xs text-gray-400">+{inv.applicant.applicantProfile.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs">
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                    <Link href={`/dashboard/recruiter/applicants/${inv.applicantId}`}>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {inv.job?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {inv.job?.jobType && <JobTypeBadge type={inv.job.jobType} />}
                      <span className="text-xs text-gray-400">{inv.job?.location}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {inv.message && (
                  <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-600 italic">&ldquo;{inv.message}&rdquo;</p>
                  </div>
                )}

                {inv.status === 'ACCEPTED' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link href={`/dashboard/recruiter/jobs/${inv.jobId}/applications`}>
                      <Button size="sm" variant="outline" className="w-full">View Application</Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
