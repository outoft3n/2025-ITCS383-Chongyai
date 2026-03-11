'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText,
  CalendarPlus,
  Download
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api, { getApiErrorMessage } from '@/lib/api';
import type { User, Application, ApiResponse } from '@/types';

function ApplicantProfileContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const shouldSchedule = searchParams.get('scheduleInterview') === 'true';
  const applicationId = searchParams.get('applicationId');
  
  const [applicant, setApplicant] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const getApplicationBadgeVariant = (status: string) => {
    if (status === 'ACCEPTED') return 'success';
    if (status === 'REJECTED') return 'destructive';
    if (status === 'INTERVIEWING') return 'warning';
    return 'default';
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const applicantRes = await api.get<ApiResponse<User>>(`/users/${id}`);
        setApplicant(applicantRes.data.data);
        
        const appsRes = await api.get<ApiResponse<Application[]>>(`/applications/applicant/${id}`);
        setApplications(appsRes.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="space-y-4">
        <Link 
          href="/dashboard/recruiter/jobs" 
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <div className="text-center py-8 text-red-500">
          {error || 'Applicant not found'}
        </div>
      </div>
    );
  }

  const profile = applicant.applicantProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <Link 
          href="/dashboard/recruiter/jobs" 
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        {shouldSchedule && applicationId && (
          <Link href={`/dashboard/recruiter/interviews/schedule?applicantId=${id}&applicationId=${applicationId}`}>
            <Button size="sm">
              <CalendarPlus className="w-4 h-4 mr-1" />
              Schedule Interview
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {applicant.firstName?.[0]}{applicant.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {applicant.firstName} {applicant.lastName}
            </h1>
            <p className="text-gray-500">Applicant</p>
            
            <div className="flex flex-wrap gap-3 mt-3">
              {applicant.email && (
                <a 
                  href={`mailto:${applicant.email}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary"
                >
                  <Mail className="w-4 h-4" />
                  {applicant.email}
                </a>
              )}
              {applicant.phone && (
                <a 
                  href={`tel:${applicant.phone}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary"
                >
                  <Phone className="w-4 h-4" />
                  {applicant.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Professional Information
          </h2>
          
          {profile?.experience ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Experience</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.experience}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No experience information provided</p>
          )}

          {profile?.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(profile?.preferredSalaryMin || profile?.preferredSalaryMax) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Salary</h3>
              <p className="text-sm text-gray-600">
                {profile.preferredSalaryMin && `$${profile.preferredSalaryMin.toLocaleString()}`}
                {profile.preferredSalaryMin && profile.preferredSalaryMax && ' - '}
                {profile.preferredSalaryMax && `$${profile.preferredSalaryMax.toLocaleString()}`}
              </p>
            </div>
          )}

          {profile?.preferredLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              Preferred Location: {profile.preferredLocation}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Education & Resume
          </h2>
          
          {profile?.education ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Education</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.education}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No education information provided</p>
          )}

          {profile?.resumeUrl && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resume</h3>
              <a 
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          Applications to Your Jobs
        </h2>
        
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No applications found</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">{app.job?.title}</p>
                  <p className="text-xs text-gray-500">
                    Applied {format(new Date(app.createdAt), 'PPP')}
                  </p>
                </div>
                <Badge 
                  variant={getApplicationBadgeVariant(app.status)}
                  className="text-xs"
                >
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantProfilePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    }>
      <ApplicantProfileContent id={params.id} />
    </Suspense>
  );
}
