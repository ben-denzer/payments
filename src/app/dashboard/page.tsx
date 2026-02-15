import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import AdminDashboard from './Admin/AdminDashboard';
import ApplicantDashboard from './Applicant/ApplicantDashboard';

export default async function DashboardPage() {
  // Check for auth cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  // Verify JWT token
  const payload = await verifyJWT(token);
  if (!payload) {
    redirect('/login');
  }

  // Check if user is admin
  const isAdmin = payload.isAdmin;

  return isAdmin ? <AdminDashboard /> : <ApplicantDashboard />;
}
