import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find all valid reset tokens in database
    const validTokens = await executeQuery(
      'SELECT id, user_id, token_hash, expires_at, used FROM password_reset_tokens WHERE expires_at > NOW() AND used = FALSE',
      []
    );

    if (!validTokens || validTokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Find the token that matches the provided token
    let matchingTokenRecord = null;
    for (const tokenRecord of validTokens) {
      const isValidToken = await verifyPassword(token, tokenRecord.token_hash as string);
      if (isValidToken) {
        matchingTokenRecord = tokenRecord;
        break;
      }
    }

    if (!matchingTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'Token validation API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find all valid reset tokens in database
    const validTokens = await executeQuery(
      `SELECT id, user_id, token_hash, expires_at, used
       FROM password_reset_tokens
       WHERE expires_at > NOW() AND used = FALSE`,
      []
    );

    if (!validTokens || validTokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Find the token that matches the provided token
    let matchingTokenRecord = null;
    for (const tokenRecord of validTokens) {
      const isValidToken = await verifyPassword(token, tokenRecord.token_hash as string);
      if (isValidToken) {
        matchingTokenRecord = tokenRecord;
        break;
      }
    }

    if (!matchingTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, matchingTokenRecord.user_id as number]
    );

    // Mark token as used
    await executeQuery(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [matchingTokenRecord.id as string]
    );

    // Clean up expired tokens for this user
    await executeQuery(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND (expires_at < NOW() OR used = TRUE)',
      [matchingTokenRecord.user_id as number]
    );

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'Password reset API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
