'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import ClientList from '@/components/ClientList';
import { User } from '@/lib/types/user';
import { checkAuth } from '@/lib/checkAuth';
import { ApiRoutes, Routes } from '@/lib/routes';
import { ClientLogger } from '@/lib/client-logger';
import {
  ApplicantOrgList,
  ApplicantOrgListSchema,
} from '@/lib/types/applicantOrg';
const logger = new ClientLogger();

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientList, setClientList] = useState<ApplicantOrgList | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthEffect = async () => {
      setIsLoading(true);
      const user = await checkAuth('admin');
      if (user) {
        setUser(user);
      } else {
        router.push(Routes.LOGIN);
      }
      setIsLoading(false);
    };

    checkAuthEffect().catch(() => {
      setIsLoading(false);
    });
  }, [router]);

  const getClientList = async () => {
    try {
      const response = await fetch(ApiRoutes.GET_CLIENT_LIST, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get client list');
      }
      const data: { message: string; clientList: ApplicantOrgList } =
        await response.json();
      ApplicantOrgListSchema.parse(data.clientList);
      setClientList(data.clientList);
    } catch (e) {
      logger.error(e, 'Failed to get client list');
      return [];
    }
  };

  useEffect(() => {
    getClientList();
  }, []);

  console.log(clientList);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Loading...
              </h1>
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
      <div className="max-w-screen mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Welcome to your personal dashboard!</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Clients
              </h2>
              <div className="flex space-x-3">
                <BaseButton variant="success" href={Routes.CREATE_CLIENT}>
                  New Client
                </BaseButton>
                <BaseButton variant="secondary" href={Routes.CLIENTS}>
                  View All
                </BaseButton>
              </div>
            </div>
            {clientList && <ClientList clients={clientList} />}
          </div>
        </div>
      </div>
    </div>
  );
}
