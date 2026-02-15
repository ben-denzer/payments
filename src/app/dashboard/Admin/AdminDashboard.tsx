'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BaseButton from '../../../components/BaseButton';
import { User } from '@/lib/types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome to your personal dashboard!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Account Information</h2>
              <div className="space-y-2">
                <p className="text-blue-800">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">User ID:</span> {user.id}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-2">Quick Actions</h2>
              <div className="space-y-3">
                <BaseButton
                  variant="success"
                  fullWidth
                  href="/"
                >
                  Go to Home
                </BaseButton>
                <p className="text-sm text-green-700">
                  You are successfully logged in! This page is only accessible to authenticated users.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">Development Notes</h2>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• This is a protected page that requires authentication</li>
              <li>• Unauthenticated users are automatically redirected to login</li>
              <li>• Authentication is handled via HTTP-only cookies and JWT tokens</li>
              <li>• You can extend this dashboard with more features as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
