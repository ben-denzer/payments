'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import BaseButton from './BaseButton';
import { checkAuth } from '@/lib/checkAuth';
import { ApiRoutes, Routes } from '@/lib/routes';
import { User } from '@/lib/types/user';

export default function Navbar() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthEffect = async () => {
      const user = await checkAuth('generic');
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuthEffect().catch(() => {
      setIsLoading(false);
    });
  }, [pathname]); // Re-check auth status when route changes

  const handleLogout = async () => {
    try {
      await fetch(ApiRoutes.LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      window.location.href = Routes.HOME;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const homeLink = !user ? Routes.HOME : user.isAdmin ? Routes.ADMIN : Routes.APPLICANT;

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={homeLink} className="text-xl font-bold text-gray-900">
                Payments 180
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={homeLink} className="text-xl font-bold text-gray-900 hover:text-gray-700">
              Payments 180
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <BaseButton variant="danger" onClick={handleLogout}>
                Log Out
              </BaseButton>
            ) : (
              <>
                <BaseButton variant="secondary" href={Routes.LOGIN}>
                  Log In
                </BaseButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
