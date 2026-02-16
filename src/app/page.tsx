'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import BaseButton from '@/components/BaseButton';
import { User } from '@/lib/types/user';
import { checkAuth } from "@/lib/checkAuth";
import { Routes } from "@/lib/routes";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthEffect = async () => {
      setIsLoading(true);
      const user = await checkAuth('generic');
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    };

    checkAuthEffect().catch(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to Round Robin
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user ? (
              <>Welcome back! You are logged in as <strong>{user.email}</strong>.</>
            ) : (
              <>A modern web application with custom authentication. Get started by signing up or logging in.</>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {user ? (
            <BaseButton
              variant="primary"
              shape="pill"
              size="lg"
              href={Routes.DASHBOARD_ROUTER}
              className="md:w-[158px]"
            >
              Go to Dashboard
            </BaseButton>
          ) : (
            <>
              <BaseButton
                variant="secondary"
                shape="pill"
                size="lg"
                href={Routes.LOGIN}
                className="md:w-[158px]"
              >
                Log In
              </BaseButton>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
