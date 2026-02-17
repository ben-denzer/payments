import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME } from '@/lib/constants';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Clear the auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, '', AUTH_COOKIE_CONFIG('logout'));

    return response;
  } catch (error) {
    logError(error, 'Logout API');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
