import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { executeQuerySingle } from '@/lib/db';
import { logError } from '@/lib/logger';
import { User } from '@/lib/types';
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME } from '@/lib/constants';

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = await verifyJWT(token);
    if (!payload) {
      throw new AuthError('Invalid or expired token');
    }

    // Get user data from database
    const user = await executeQuerySingle(
      'SELECT id, email, is_admin, is_owner, created_at FROM users WHERE id = ? AND is_owner = ? AND is_admin = ?',
      [payload.userId, !!payload.isOwner, !!payload.isAdmin]
    );

    if (!user) {
      throw new AuthError('User not found');
    }

    const userData: User = {
      id: user.id as number,
      email: user.email as string,
      isAdmin: payload.isAdmin,
      isOwner: payload.isOwner,
      created_at: user.created_at as string,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    logError(error, 'Auth check API');
    if (error instanceof AuthError) {
      const response = NextResponse.json(
        { error: error.message },
        { status: 401 }
      );

      response.cookies.set(AUTH_COOKIE_NAME, '', AUTH_COOKIE_CONFIG('logout'));

      return response;
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
