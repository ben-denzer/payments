'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BaseButton from '@/components/BaseButton';
import BaseInput from '@/components/BaseInput';
import { User } from '@/lib/types/user';
import { checkAuth } from '@/lib/checkAuth';
import { ApiRoutes, Routes } from '@/lib/routes';
import { ClientLogger } from '@/lib/client-logger';
import { parseZodError } from '@/lib/parseZodError';
import {
  ApplicantOrg,
  ApplicantOrgSchema,
  ApplicantOrgStatus,
  GetClientRequest,
  GetClientRequestSchema,
  UpdateClientRequest,
  UpdateClientRequestSchema,
} from '@/lib/types/applicantOrg';
import { DashboardContainer, DashboardContent, DashboardHeader, DashboardTitle } from '@/components/DashboardContainer';

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

const statusOptions: ApplicantOrgStatus[] = ['invited', 'in_progress', 'applied', 'approved', 'rejected', 'archived'];

export default function ClientDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientLoading, setIsClientLoading] = useState(false);
  const [client, setClient] = useState<ApplicantOrg | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState<Partial<ApplicantOrg>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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

  const getClient = useCallback(async () => {
    try {
      setIsClientLoading(true);
      const apiData: GetClientRequest = {
        clientID: parseInt(clientID),
      };

      const result = GetClientRequestSchema.safeParse(apiData);
      if (!result.success) {
        logger.error(new Error('Invalid request data'), 'Get Client', {
          apiData,
        });
        return;
      }

      const response = await fetch(ApiRoutes.GET_CLIENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ clientID: parseInt(clientID) }),
      });
      if (!response.ok) {
        throw new Error('Failed to get client');
      }
      const data: { message: string; client: ApplicantOrg } = await response.json();
      ApplicantOrgSchema.parse(data.client);

      setClient(data.client);
      setEditedClient({
        companyName: data.client.companyName,
        primaryContactName: data.client.primaryContactName,
        primaryContactEmail: data.client.primaryContactEmail,
        status: data.client.status,
      });
    } catch (e) {
      logger.error(e, 'Failed to get client details');
    } finally {
      setIsClientLoading(false);
    }
  }, [clientID]);

  useEffect(() => {
    if (user && clientID) {
      getClient();
    }
  }, [user, clientID, getClient]);

  const handleEditClick = () => {
    setIsEditMode(true);
    setError('');
    setSuccess('');
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setError('');
    setSuccess('');
    setEditedClient({
      companyName: client!.companyName,
      primaryContactName: client!.primaryContactName,
      primaryContactEmail: client!.primaryContactEmail,
      status: client!.status,
    });
  };

  const handleSaveClick = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const apiData: UpdateClientRequest = {
        clientID: parseInt(clientID),
        companyName: editedClient.companyName || '',
        primaryContactName: editedClient.primaryContactName || '',
        primaryContactEmail: editedClient.primaryContactEmail || '',
        status: editedClient.status || client!.status,
      };

      const result = UpdateClientRequestSchema.safeParse(apiData);
      if (!result.success) {
        setError(parseZodError(result.error));
        return;
      }

      const response = await fetch(ApiRoutes.UPDATE_CLIENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update client. Please try again.');
        return;
      }

      await response.json();
      logger.info('Client updated successfully', 'Update Client', { clientID });

      // Refresh client data
      await getClient();

      setSuccess('Client updated successfully!');
      setIsEditMode(false);
    } catch (e) {
      logger.error(e, 'Failed to update client');
      setError('Failed to update client. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  if (isClientLoading) {
    return (
      <DashboardContainer>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Client...</h1>
        </div>
      </DashboardContainer>
    );
  }

  if (!isClientLoading && !client) {
    return (
      <DashboardContainer>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
          <p className="text-gray-600 mt-2">The requested client could not be found.</p>
          <BaseButton variant="primary" href={Routes.CLIENTS} className="mt-4">
            Clients
          </BaseButton>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <>
      <DashboardContainer>
        <DashboardHeader>
          <div className="flex items-end space-x-4">
            <div className="flex-col">
              <DashboardTitle>{client!.companyName}</DashboardTitle>
              <BaseButton size="xs" className="mt-2" variant="secondary" href={Routes.CLIENTS}>
                ← Clients
              </BaseButton>
            </div>
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
                <BaseButton variant="success" onClick={handleSaveClick} loading={isSaving} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </BaseButton>
              </>
            )}
          </div>
        </DashboardHeader>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">{success}</div>
        )}

        {/* Client Information */}
        <DashboardContent>
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
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
                <p className="text-lg text-gray-900">{client!.companyName}</p>
              )}
            </div>

            {/* Primary Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Name</label>
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
                <p className="text-lg text-gray-900">{client!.primaryContactName}</p>
              )}
            </div>

            {/* Primary Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Email</label>
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
                <p className="text-lg text-gray-900">{client!.primaryContactEmail}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              {isEditMode ? (
                <select
                  value={editedClient.status || client!.status}
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
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[client!.status]}`}
                >
                  {statusLabels[client!.status]}
                </span>
              )}
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <p className="text-gray-600">{formatDate(client!.createdAt)}</p>
            </div>

            {/* Updated At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-600">{formatDate(client!.updatedAt)}</p>
            </div>
          </div>
        </DashboardContent>
      </DashboardContainer>
    </>
  );
}
