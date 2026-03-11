'use client';

import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse } from '@/types';
import { useEffect, useState } from 'react';

interface JobReport {
  topViewed: { id: string; title: string; viewCount: number; isActive: boolean }[];
  byType: { jobType: string; _count: { id: number } }[];
}

interface AppReport {
  byStatus: { status: string; _count: { id: number } }[];
}

interface PaymentReport {
  byStatus: { status: string; _count: { id: number }; _sum: { amount: number | null } }[];
  totalRevenue: number;
}

export default function AdminReportsPage() {
  const [jobReport, setJobReport] = useState<JobReport | null>(null);
  const [appReport, setAppReport] = useState<AppReport | null>(null);
  const [payReport, setPayReport] = useState<PaymentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    if (status === 'ACCEPTED') return 'bg-green-500';
    if (status === 'REJECTED') return 'bg-red-400';
    return 'bg-primary';
  };

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<JobReport>>('/reports/jobs'),
      api.get<ApiResponse<AppReport>>('/reports/applications'),
      api.get<ApiResponse<PaymentReport>>('/reports/payments'),
    ])
      .then(([jobRes, appRes, payRes]) => {
        setJobReport(jobRes.data.data);
        setAppReport(appRes.data.data);
        setPayReport(payRes.data.data);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const appStatusData = appReport?.byStatus.map((s) => ({
    label: s.status,
    value: s._count.id,
    color: getStatusColor(s.status),
  })) ?? [];

  const jobTypeData = jobReport?.byType.map((t) => ({
    label: t.jobType.replaceAll('_', ' '),
    value: t._count.id,
  })) ?? [];

  const topViewedData = jobReport?.topViewed.slice(0, 8).map((j) => ({
    label: j.title,
    value: j.viewCount,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm">System-wide statistics and trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPlaceholder title="Applications by Status" data={appStatusData} />
        <ChartPlaceholder title="Jobs by Type" data={jobTypeData} />
      </div>

      <ChartPlaceholder title="Top Viewed Jobs" data={topViewedData} />

      {payReport && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Payment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {payReport.byStatus.map((s) => (
              <div key={s.status} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">{s.status}</p>
                <p className="text-lg font-bold text-gray-900">{s._count.id}</p>
                <p className="text-xs text-gray-400">฿{(s._sum.amount ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total Revenue: <span className="font-bold text-green-600 text-lg">฿{payReport.totalRevenue.toLocaleString()}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
