'use client';

import { useState } from 'react';
import Link from 'next/link';
import BaseInput from '@/components/BaseInput';
import BaseButton from '@/components/BaseButton';
import { Routes } from '@/lib/routes';

export default function CreateClient() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!companyName || !contactName || !contactEmail) {
      setError('All fields are required');
      return;
    }

    if (companyName.length > 255) {
      setError('Company name must be 255 characters or less');
      return;
    }

    if (contactName.length > 255) {
      setError('Contact name must be 255 characters or less');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // For now, just log to console as requested
      console.log('Creating client:', {
        companyName,
        contactName,
        contactEmail,
      });

      // TODO: Implement actual API call here
      // const response = await fetch(ApiRoutes.CREATE_CLIENT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ companyName, contactName, contactEmail }),
      // });

      alert('Client created successfully! (Check console for details)');

      // Reset form
      setCompanyName('');
      setContactName('');
      setContactEmail('');

    } catch {
      setError('Failed to create client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Back button in top left */}
        <div className="mb-8">
          <Link
            href={Routes.ADMIN}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Form container */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Create New Client
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <BaseInput
                id="companyName"
                name="companyName"
                type="text"
                required
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
                required
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
                required
                placeholder="Contact Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                label="Contact Email"
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 pt-4">
            <BaseButton
                type="button"
                variant="secondary"
                href={Routes.ADMIN}
                className="flex-1"
              >
                Cancel
              </BaseButton>

              <BaseButton
                type="submit"
                variant="primary"
                loading={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Client'}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
