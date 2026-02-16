'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import BaseInput from '@/components/BaseInput';
import { User } from '@/lib/types/user';
import { checkAuth } from '@/lib/checkAuth';
import { ApiRoutes, Routes } from '@/lib/routes';
import { ClientLogger } from '@/lib/client-logger';
import {
  ApplicantOrg,
  ApplicantOrgList,
  ApplicantOrgListSchema,
  ApplicantOrgStatus,
} from '@/lib/types/applicantOrg';

const logger = new ClientLogger();

const statusColors: Record<ApplicantOrgStatus, string> = {
  invited: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  applied: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ApplicantOrgStatus, string> = {
  invited: 'Invited',
  in_progress: 'In Progress',
  applied: 'Applied',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

const statusOptions: ApplicantOrgStatus[] = [
  'invited',
  'in_progress',
  'applied',
  'approved',
  'rejected',
  'archived',
];

export default function ClientDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<ApplicantOrg | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<ApplicantOrg>>({});
  const router = useRouter();
  const params = useParams();
  const clientID = params.clientID as string;

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

  const getClientList = useCallback(async () => {
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

      // Find the specific client by ID
      const foundClient = data.clientList.find(
        (c) => c.id === parseInt(clientID),
      );
      if (foundClient) {
        setClient(foundClient);
        setEditedClient({
          companyName: foundClient.companyName,
          primaryContactName: foundClient.primaryContactName,
          primaryContactEmail: foundClient.primaryContactEmail,
          status: foundClient.status,
        });
      }
    } catch (e) {
      logger.error(e, 'Failed to get client details');
    }
  }, [clientID]);

  useEffect(() => {
    if (user && clientID) {
      getClientList();
    }
  }, [user, clientID, getClientList]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    if (client) {
      setEditedClient({
        companyName: client.companyName,
        primaryContactName: client.primaryContactName,
        primaryContactEmail: client.primaryContactEmail,
        status: client.status,
      });
    }
  };

  const handleSaveClick = () => {
    console.log('Saving client changes:', editedClient);
    setIsEditMode(false);
    // TODO: Implement actual save functionality
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Client Not Found
              </h1>
              <p className="text-gray-600 mt-2">
                The requested client could not be found.
              </p>
              <BaseButton
                variant="primary"
                href={Routes.CLIENTS}
                className="mt-4"
              >
                Clients
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <BaseButton variant="secondary" href={Routes.CLIENTS}>
                ← Clients
              </BaseButton>
              <h1 className="text-3xl font-bold text-gray-900">
                {client.companyName}
              </h1>
            </div>
            <div className="flex space-x-3">
              {!isEditMode ? (
                <BaseButton variant="primary" onClick={handleEditClick}>
                  Edit Company Info
                </BaseButton>
              ) : (
                <>
                  <BaseButton variant="secondary" onClick={handleCancelClick}>
                    Cancel
                  </BaseButton>
                  <BaseButton variant="success" onClick={handleSaveClick}>
                    Save Changes
                  </BaseButton>
                </>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              {isEditMode ? (
                <BaseInput
                  type="text"
                  value={editedClient.companyName || ''}
                  onChange={(e) =>
                    setEditedClient((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  label="Company Name"
                  maxLength={255}
                />
              ) : (
                <p className="text-lg text-gray-900">{client.companyName}</p>
              )}
            </div>

            {/* Primary Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact Name
              </label>
              {isEditMode ? (
                <BaseInput
                  type="text"
                  value={editedClient.primaryContactName || ''}
                  onChange={(e) =>
                    setEditedClient((prev) => ({
                      ...prev,
                      primaryContactName: e.target.value,
                    }))
                  }
                  label="Primary Contact Name"
                  maxLength={255}
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {client.primaryContactName}
                </p>
              )}
            </div>

            {/* Primary Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact Email
              </label>
              {isEditMode ? (
                <BaseInput
                  type="email"
                  value={editedClient.primaryContactEmail || ''}
                  onChange={(e) =>
                    setEditedClient((prev) => ({
                      ...prev,
                      primaryContactEmail: e.target.value,
                    }))
                  }
                  label="Primary Contact Email"
                />
              ) : (
                <p className="text-lg text-gray-900">
                  {client.primaryContactEmail}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditMode ? (
                <select
                  value={editedClient.status || client.status}
                  onChange={(e) =>
                    setEditedClient((prev) => ({
                      ...prev,
                      status: e.target.value as ApplicantOrgStatus,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[client.status]}`}
                >
                  {statusLabels[client.status]}
                </span>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created
              </label>
              <p className="text-gray-600">{formatDate(client.createdAt)}</p>
            </div>

            {/* Updated At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-gray-600">{formatDate(client.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
