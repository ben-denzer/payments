'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import BaseInput from '@/components/BaseInput';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { checkAuth } from '@/lib/checkAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthEffect = async () => {
      const user = await checkAuth('generic');
      if (user) {
        router.push('/dashboard');
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
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }

    setIsLoading(true);

    const key = window.location.search.split('?key=')[1];
    if (!key) {
      setError('Invalid key');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, signupKey: key }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard'); // Redirect to dashboard after successful signup
      } else {
        setError(data.error || 'Sign up failed');
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
      title="Create your account"
      error={error}
      onSubmit={handleSubmit}
      submitButtonText="Sign up"
      submitButtonLoadingText="Creating account..."
      isLoading={isLoading}
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
        />
        <BaseInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          groupPosition="middle"
        />
        <BaseInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          label="Confirm Password"
          groupPosition="last"
        />
      </div>
    </AuthForm>
  );
}
