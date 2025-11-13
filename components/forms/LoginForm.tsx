'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/zod-schemas';
import { useToast, Toast } from '@/components/ui/Toast';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';
import { themeClasses } from '@/lib/theme-classes';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { showToast, toast, setToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        showToast('Invalid email or password', 'error');
        setIsLoading(false);
      } else {
        // Show loading animation after successful login
        setShowLoadingAnimation(true);
        // Wait for minimum display time (2000ms) before redirecting to ensure animation plays
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  if (showLoadingAnimation) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingAnimation message="Loading your football data..." delay={0} />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className={themeClasses.form.label}>
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
          />
          {errors.email && (
            <p className={themeClasses.form.error}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={themeClasses.form.label}>
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="current-password"
            className={`mt-1 block w-full px-3 py-2 rounded-lg shadow-sm outline-none ${themeClasses.input.DEFAULT}`}
          />
          {errors.password && (
            <p className={themeClasses.form.error}>{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-club-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${themeClasses.button.primary}`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast({ ...toast, open })}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
      />
    </>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}

