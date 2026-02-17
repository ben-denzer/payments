'use client';

import { useState } from 'react';
import BaseInput from '@/components/BaseInput';
import BaseButton from '@/components/BaseButton';
import { ApiRoutes, Routes } from '@/lib/routes';
import { DBApplicantOrgInput, DBApplicantOrgInputSchema } from '@/lib/types/applicantOrg';
import { parseZodError } from '@/lib/parseZodError';
import { ClientLogger } from '@/lib/client-logger';
import { useRouter } from 'next/navigation';
import { DashboardContainer, DashboardHeader, DashboardTitle } from '@/components/DashboardContainer';
const logger = new ClientLogger();

const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

export default function CreateClient() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storageBucketBase = `${isProd ? '' : 'test'}-${companyName
      .toLowerCase()
      .replace(/[^A-Za-z0-9]/g, '-')
      .slice(0, 15)}`;

    const apiData: DBApplicantOrgInput = {
      company_name: companyName,
      primary_contact_name: contactName,
      primary_contact_email: contactEmail,
      storage_bucket_base: storageBucketBase,
    };

    const result = DBApplicantOrgInputSchema.safeParse(apiData);
    if (!result.success) {
      setError(parseZodError(result.error));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(ApiRoutes.CREATE_CLIENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create client. Please try again.');
        return;
      }

      const data = await response.json();
      console.log(data);
      if (data.orgId) {
        router.push(`${Routes.CLIENTS}/${data.orgId}`);
      }

      // Reset form
      setCompanyName('');
      setContactName('');
      setContactEmail('');
    } catch (e) {
      logger.error(e, 'Failed to create client', { apiData });
      setError('Failed to create client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContainer maxWidth="max-w-xl">
      <DashboardHeader>
        <div className="flex items-center space-x-4">
          <div className="flex-col">
            <DashboardTitle>Create New Client</DashboardTitle>
            <BaseButton size="xs" className="mt-2" variant="secondary" onClick={() => router.back()}>
              ← Back
            </BaseButton>
          </div>
        </div>
      </DashboardHeader>
      {/* Form container */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-6 rounded-lg">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

        <div className="space-y-4">
          <BaseInput
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            label="Company Name"
            maxLength={255}
          />

          <BaseInput
            id="contactName"
            name="contactName"
            type="text"
            placeholder="Contact Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            label="Contact Name"
            maxLength={255}
          />

          <BaseInput
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            label="Contact Email"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row space-x-4 pt-4">
          <BaseButton type="submit" variant="primary" loading={isLoading} className="flex-1 mb-6 sm:mb-0">
            {isLoading ? 'Creating...' : 'Create Client'}
          </BaseButton>
        </div>
      </form>
    </DashboardContainer>
  );
}
