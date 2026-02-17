import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createJWT } from '@/lib/auth';
import { executeQuery, executeInsert } from '@/lib/db';
import { logError } from '@/lib/logger';
import { AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME, MIN_PASSWORD_LENGTH } from '@/lib/constants';

const INITIAL_ACCOUNT_SIGNUP_SECRET = process.env.INITIAL_ACCOUNT_SIGNUP_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { email, password, signupKey } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!signupKey || !INITIAL_ACCOUNT_SIGNUP_SECRET || signupKey !== INITIAL_ACCOUNT_SIGNUP_SECRET) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUsers = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await executeInsert(
      'INSERT INTO users (email, password_hash, is_admin, is_owner) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, true, true],
    );

    // Create JWT token
    const token = await createJWT({
      id: userId,
      email,
      isAdmin: true,
      isOwner: true,
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({ message: 'User created successfully', userId }, { status: 201 });

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG('login'));

    return response;
  } catch (error) {
    logError(error, 'Signup API');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
