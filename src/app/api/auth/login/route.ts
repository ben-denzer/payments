import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createJWT } from '@/lib/auth';
import { executeQuerySingle } from '@/lib/db';
import { logError } from '@/lib/logger';
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME } from '@/lib/constants';
import { DBUser, User, UserSchema } from '@/lib/types/user';

export async function POST(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user: Omit<DBUser, 'created_at' | 'updated_at'> | null = await executeQuerySingle(
      'SELECT id, email, password_hash, is_admin, is_owner, applicant_org_id FROM users WHERE email = ?',
      [email],
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash as string);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userData: User = {
      id: user.id,
      email: user.email,
      isAdmin: !!user.is_admin,
      isOwner: !!user.is_owner,
      applicantOrgId: user.applicant_org_id || null,
    };
    UserSchema.parse(userData);

    // Create JWT token
    const token = await createJWT(userData);

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG('login'));

    return response;
  } catch (error) {
    logError(error, 'Login API');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
