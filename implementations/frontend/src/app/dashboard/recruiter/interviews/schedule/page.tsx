'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Video, MapPin, Phone, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api, { getApiErrorMessage } from '@/lib/api';
import type { InterviewType } from '@/types';

const INTERVIEW_TYPES: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
  { value: 'VIDEO', label: 'Video Call', icon: <Video className="w-4 h-4" /> },
  { value: 'IN_PERSON', label: 'In Person', icon: <MapPin className="w-4 h-4" /> },
  { value: 'PHONE', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
];

function ScheduleInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicantId');
  const applicationId = searchParams.get('applicationId');

  const [formData, setFormData] = useState({
    scheduledAt: '',
    duration: 30,
    type: 'VIDEO' as InterviewType,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) {
      setError('Application ID is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/interviews', {
        applicationId,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        type: formData.type,
        notes: formData.notes || null,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/recruiter/interviews');
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Interview Scheduled!</h2>
          <p className="text-green-600">The interview has been scheduled successfully.</p>
          <p className="text-sm text-green-500 mt-2">Redirecting to interviews page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link 
        href={applicantId ? `/dashboard/recruiter/applicants/${applicantId}` : '/dashboard/recruiter/interviews'}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Interview</h1>
        <p className="text-gray-500 text-sm mt-1">Set up an interview with the applicant</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <label htmlFor="scheduled-at" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Date & Time
          </label>
          <Input
            id="scheduled-at"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Duration (minutes)
          </label>
          <Select
            id="duration"
            options={[
              { value: '15', label: '15 minutes' },
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '1 hour' },
              { value: '90', label: '1.5 hours' },
              { value: '120', label: '2 hours' },
            ]}
            value={String(formData.duration)}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">Interview Type</legend>
          <div className="grid grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  formData.type === type.value
                    ? 'border-primary bg-orange-50 text-primary'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
                aria-pressed={formData.type === type.value}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes or instructions for the interview..."
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || !formData.scheduledAt}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Scheduling...
              </>
            ) : (
              'Schedule Interview'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ScheduleInterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    }>
      <ScheduleInterviewForm />
    </Suspense>
  );
}
