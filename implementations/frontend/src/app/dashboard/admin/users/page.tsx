'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import api, { getApiErrorMessage } from '@/lib/api';
import type { User, PaginatedResponse, Role } from '@/types';

const ROLE_OPTIONS = [
  { value: 'APPLICANT', label: 'Applicants' },
  { value: 'RECRUITER', label: 'Recruiters' },
  { value: 'ADMIN', label: 'Admins' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [role, setRole] = useState<Role | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'ADMIN') return 'error';
    if (role === 'RECRUITER') return 'yellow';
    return 'orange';
  };

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (role) params.set('role', role);
      const res = await api.get<PaginatedResponse<User>>(`/users?${params}`);
      const nonAdminUsers = res.data.data.filter(user => user.role !== 'ADMIN');
      setUsers(nonAdminUsers);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Paid</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.isVerified
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-gray-300" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    {user.isPaid
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-gray-300" />
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchUsers} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total users</p>
        </div>
        <div className="w-40">
          <Select
            options={ROLE_OPTIONS}
            placeholder="All roles"
            value={role}
            onChange={(e) => setRole(e.target.value as Role | '')}
          />
        </div>
      </div>
      {content}
    </div>
  );
}
