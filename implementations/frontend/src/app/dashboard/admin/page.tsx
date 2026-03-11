'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChartPlaceholder } from '@/components/dashboard/ChartPlaceholder';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, ReportSummary } from '@/types';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ApiResponse<ReportSummary>>('/reports/summary')
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!summary) return null;

  const userChartData = [
    { label: 'Applicants', value: summary.users.applicants, color: 'bg-primary' },
    { label: 'Recruiters', value: summary.users.recruiters, color: 'bg-accent' },
  ];

  const jobChartData = [
    { label: 'Active', value: summary.jobs.active, color: 'bg-green-500' },
    { label: 'Inactive', value: summary.jobs.inactive, color: 'bg-gray-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={summary.users.total-summary.users.admins} icon={Users} color="orange" />
        <StatsCard title="Active Jobs" value={summary.jobs.active} icon={Briefcase} color="yellow" />
        <StatsCard title="Applications" value={summary.applications.total} icon={FileText} color="blue" />
        <StatsCard
          title="Revenue (THB)"
          value={`฿${summary.payments.revenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPlaceholder title="Users by Role" data={userChartData} />
        <ChartPlaceholder title="Jobs Status" data={jobChartData} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">New Users (7d)</p>
          <p className="text-2xl font-bold text-gray-900">{summary.recentActivity.newUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">New Jobs (7d)</p>
          <p className="text-2xl font-bold text-gray-900">{summary.recentActivity.newJobs}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-gray-900">{summary.applications.accepted}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Paid Users</p>
          <p className="text-2xl font-bold text-gray-900">{summary.payments.completed}</p>
        </div>
      </div>
    </div>
  );
}
