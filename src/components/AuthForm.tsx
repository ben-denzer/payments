'use client';

import { ReactNode, FormEvent } from 'react';
import Link from 'next/link';
import BaseButton from './BaseButton';

interface AuthFormProps {
  title: string;
  subtitle?: string | ReactNode;
  error?: string;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  submitButtonText: string;
  submitButtonLoadingText?: string;
  isLoading?: boolean;
  footerLinks?: Array<{
    text: string;
    href: string;
  }>;
}

export default function AuthForm({
  title,
  subtitle,
  error,
  onSubmit,
  children,
  submitButtonText,
  submitButtonLoadingText,
  isLoading = false,
  footerLinks = [],
}: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {children}

          <div>
            <BaseButton
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              {isLoading ? (submitButtonLoadingText || 'Loading...') : submitButtonText}
            </BaseButton>
          </div>

          {footerLinks.length > 0 && (
            <div className="text-center space-y-2">
              {footerLinks.map((link, index) => (
                <div key={index}>
                  <Link
                    href={link.href}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {link.text}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
