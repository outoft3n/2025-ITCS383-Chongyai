'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useSentInvitations } from '@/hooks/useInvitations';
import { useMyJobs } from '@/hooks/useJobs';
import api, { getApiErrorMessage } from '@/lib/api';
import type { PaginatedResponse, User, Job } from '@/types';

interface ApplicantResult extends Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'profileImageUrl' | 'createdAt'> {
  applicantProfile: {
    skills: string[];
    experience: string | null;
    education: string | null;
    preferredLocation: string | null;
    preferredSalaryMin: number | null;
    preferredSalaryMax: number | null;
    resumeUrl: string | null;
  } | null;
}

interface InviteModalState {
  applicant: ApplicantResult;
  jobId: string;
  message: string;
  isSubmitting: boolean;
  error: string | null;
}

export default function ApplicantSearchPage() {
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [results, setResults] = useState<ApplicantResult[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<InviteModalState | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { jobs } = useMyJobs();
  const activeJobs = jobs.filter((j: Job) => j.isActive);
  const { sendInvitation } = useSentInvitations();

  const doSearch = useCallback(async (page = 1) => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set('q', query.trim());
      if (skills.trim()) params.set('skills', skills.trim());
      if (location.trim()) params.set('location', location.trim());
      if (education.trim()) params.set('education', education.trim());
      if (experience.trim()) params.set('experience', experience.trim());
      const res = await api.get<PaginatedResponse<ApplicantResult>>(`/search/applicants?${params}`);
      setResults(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setSearchError(getApiErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  }, [query, skills, location, education, experience]);

  const openInviteModal = (applicant: ApplicantResult) => {
    setModal({ applicant, jobId: activeJobs[0]?.id ?? '', message: '', isSubmitting: false, error: null });
  };

  const submitInvitation = async () => {
    if (!modal || !modal.jobId) return;
    setModal((m) => m && { ...m, isSubmitting: true, error: null });
    try {
      await sendInvitation(modal.applicant.id, modal.jobId, modal.message || undefined);
      setModal(null);
      setSuccessMsg(`Invitation sent to ${modal.applicant.firstName} ${modal.applicant.lastName}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setModal((m) => m && { ...m, isSubmitting: false, error: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Applicants</h1>
        <p className="text-gray-500 text-sm">Find candidates by skills, education, experience, and location.</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Name or Email</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Python, SQL"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Preferred Location</label>
            <input
              type="text"
              placeholder="e.g. Bangkok, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Education keyword</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Experience keyword</label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => doSearch()} disabled={isSearching}>
            {isSearching ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      {searchError && <div className="text-center py-4 text-red-500 text-sm">{searchError}</div>}

      {hasSearched && !isSearching && (
        <p className="text-sm text-gray-500">{pagination.total} applicant(s) found</p>
      )}

      {isSearching && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-3">
          {results.map((applicant) => {
            const isExpanded = expandedId === applicant.id;
            const profile = applicant.applicantProfile;
            return (
              <div key={applicant.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {applicant.firstName[0]}{applicant.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{applicant.email}</p>
                      {profile?.preferredLocation && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{profile.preferredLocation}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/dashboard/recruiter/applicants/${applicant.id}`}>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => openInviteModal(applicant)}
                      disabled={activeJobs.length === 0}
                      title={activeJobs.length === 0 ? 'You have no active jobs to invite for' : undefined}
                    >
                      <Send className="w-4 h-4" />
                      Invite
                    </Button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                      className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && profile && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {profile.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.experience && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Experience</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{profile.experience}</p>
                      </div>
                    )}
                    {profile.education && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Education</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{profile.education}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && !searchError && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No applicants found matching your filters.
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => doSearch(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === pagination.page
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Send Invitation Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Send Job Invitation</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Inviting <span className="font-medium text-gray-900">{modal.applicant.firstName} {modal.applicant.lastName}</span>
            </p>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Select Job *</label>
              <select
                value={modal.jobId}
                onChange={(e) => setModal((m) => m && { ...m, jobId: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {activeJobs.map((job: Job) => (
                  <option key={job.id} value={job.id}>{job.title} — {job.location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Personal Message (optional)</label>
              <textarea
                value={modal.message}
                onChange={(e) => setModal((m) => m && { ...m, message: e.target.value })}
                rows={4}
                placeholder="Hi, we think you'd be a great fit for this role..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            {modal.error && <p className="text-sm text-red-500">{modal.error}</p>}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)} disabled={modal.isSubmitting}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={submitInvitation} disabled={!modal.jobId || modal.isSubmitting}>
                {modal.isSubmitting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
