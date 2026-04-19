'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import api, { getApiErrorMessage } from '@/lib/api';
import { getDashboardPath } from '@/lib/auth';
import type { ApiResponse, LoginResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email: data.email.trim(),
        password: data.password,
      });
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-primary">Chongyai</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="h-1 bg-gradient-to-r from-primary to-accent rounded-full -mx-8 -mt-8 mb-8" />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs font-semibold text-orange-700 mb-1">Demo Accounts</p>
            <div className="space-y-0.5 text-xs text-gray-600">
              <p>Applicant: applicant1@email.com / Applicant@123</p>
              <p>Recruiter: recruiter1@techcorp.com / Recruiter@123</p>
              <p>Admin: admin@chongyai.com / Admin@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
