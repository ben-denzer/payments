import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createJWT } from '@/lib/auth';
import { executeQuerySingle } from '@/lib/db';
import { logError } from '@/lib/logger';
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await executeQuerySingle(
      'SELECT id, email, password_hash, is_admin, is_owner FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash as string);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createJWT({ userId: user.id as number, email: user.email as string, isAdmin: (user.is_admin || false) as boolean, isOwner: (user.is_owner || false) as boolean });

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG('login'));

    return response;
  } catch (error) {
    logError(error, 'Login API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
