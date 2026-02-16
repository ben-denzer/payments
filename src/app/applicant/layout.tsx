'use server';
import { verifyJWT } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { Routes } from '@/lib/routes';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect(Routes.LOGIN);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    redirect(Routes.LOGIN);
  }

  if (payload.isAdmin) {
    redirect(Routes.ADMIN);
  }

  return (
    <>{children}</>
  )
}
