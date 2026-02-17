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
import {
  DashboardContainer,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
} from '@/components/DashboardContainer';
const logger = new ClientLogger();

export default function ClientsPage() {
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

  if (isLoading) {
    return (
      <DashboardContainer>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </DashboardContainer>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Clients</DashboardTitle>
        <BaseButton variant="success" href={Routes.CREATE_CLIENT}>
          New Client
        </BaseButton>
      </DashboardHeader>

      <DashboardContent>
        {clientList && <ClientList clients={clientList} />}
      </DashboardContent>
    </DashboardContainer>
  );
}
