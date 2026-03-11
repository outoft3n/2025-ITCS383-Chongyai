'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Payment, PaginatedResponse } from '@/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBadgeVariant = (status: string) => {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED') return 'error';
    if (status === 'REFUNDED') return 'info';
    return 'warning';
  };

  const fetchPayments = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Payment>>(`/payments/all?page=${page}`);
      setPayments(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  let content: React.ReactNode;
  if (isLoading) {
    content = <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  } else if (error) {
    content = <div className="text-center py-8 text-red-500">{error}</div>;
  } else {
    content = (
      <>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ref</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{payment.user?.firstName} {payment.user?.lastName}</p>
                    <p className="text-gray-400 text-xs">{payment.user?.role}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">฿{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{payment.transactionRef ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {payment.paidAt ? format(new Date(payment.paidAt), 'PP') : format(new Date(payment.createdAt), 'PP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchPayments} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm">{pagination.total} payment records</p>
      </div>
      {content}
    </div>
  );
}
