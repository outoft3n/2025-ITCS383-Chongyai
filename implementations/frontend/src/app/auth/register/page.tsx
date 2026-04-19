'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';
import { getDashboardPath } from '@/lib/auth';
import type { ApiResponse, LoginResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['APPLICANT', 'RECRUITER']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: 'APPLICANT' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    // Same shape as mobile + backend `RegisterSchema` (no `confirmPassword` in the request body)
    const company = data.companyName?.trim();
    const payload = {
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      ...(company ? { companyName: company } : {}),
    };
    try {
      const res = await api.post<ApiResponse<LoginResponse>>('/auth/register', payload);
      const { token, user } = res.data.data;
      login(token, user);
      router.replace(getDashboardPath(user.role));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-primary">Chongyai</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="h-1 bg-gradient-to-r from-primary to-accent rounded-full -mx-8 -mt-8 mb-8" />

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'APPLICANT', label: 'Job Seeker', icon: User, desc: '500 THB fee' },
              { value: 'RECRUITER', label: 'Employer', icon: Building2, desc: '5,000 THB fee' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} className="sr-only" {...register('role')} />
                <div className={`border-2 rounded-xl p-3 text-center transition-colors ${selectedRole === value
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
                  }`}>
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${selectedRole === value ? 'text-primary' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-sm ${selectedRole === value ? 'text-primary' : 'text-gray-700'}`}>{label}</p>
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            {selectedRole === 'RECRUITER' && (
              <Input label="Company Name" error={errors.companyName?.message} {...register('companyName')} />
            )}
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3">
            You can browse jobs for free. A payment is required when you submit your first application.
          </p>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
