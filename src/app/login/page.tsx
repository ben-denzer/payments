'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import BaseInput from '@/components/BaseInput';
import { checkAuth } from '@/lib/checkAuth';
import { ApiRoutes, Routes } from '@/lib/routes';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthEffect = async () => {
      const user = await checkAuth('generic');
      if (user) {
        router.push(Routes.DASHBOARD_ROUTER);
      }
      setIsCheckingAuth(false);
    };

    checkAuthEffect().catch(() => {
      setIsCheckingAuth(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(ApiRoutes.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        router.push(Routes.DASHBOARD_ROUTER); // Redirect to dashboard after successful login
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title="Sign in to your account"
      error={error}
      onSubmit={handleSubmit}
      submitButtonText="Sign in"
      submitButtonLoadingText="Signing in..."
      isLoading={isLoading}
      footerLinks={[
        { text: 'Forgot your password?', href: Routes.FORGOT_PASSWORD }
      ]}
    >
      <div className="rounded-md shadow-sm -space-y-px">
        <BaseInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email address"
          groupPosition="first"
          autoFocus={true}
        />
        <BaseInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          groupPosition="last"
        />
      </div>
    </AuthForm>
  );
}
