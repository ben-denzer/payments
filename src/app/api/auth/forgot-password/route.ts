import { NextRequest, NextResponse } from 'next/server';
import { executeQuerySingle, executeInsert } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { logError } from '@/lib/logger';

async function sendResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  // Mailgun API configuration
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${mailgunDomain}`;

  if (!mailgunApiKey || !mailgunDomain) {
    console.error('Mailgun configuration missing');
    throw new Error('Email service not configured');
  }

  const emailData = {
    from: fromEmail,
    to: email,
    subject: 'Reset your Round Robin password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset your password</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Round Robin account. Click the link below to reset your password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Round Robin Team</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <a href="${resetUrl}" style="color: #666;">${resetUrl}</a>
        </p>
      </div>
    `,
  };

  const auth = Buffer.from(`api:${mailgunApiKey}`).toString('base64');

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mailgun error:', errorData);
      throw new Error('Failed to send email');
    }

    return response;
  } catch (error) {
    logError(error, 'Email sending');
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user exists (but don't reveal if they don't for security)
    const user = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = await hashPassword(resetToken);

    // Calculate expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Clean up expired tokens for this user
    await executeQuerySingle(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND expires_at < NOW()',
      [user.id as number]
    );

    // Insert new reset token
    const tokenId = randomBytes(16).toString('hex');
    await executeInsert(
      'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [tokenId, user.id as number, tokenHash, expiresAt]
    );

    // Send reset email
    try {
      await sendResetEmail(email, resetToken);
    } catch (emailError) {
      logError(emailError, 'Reset email sending');
      // Don't return error to user for security - they might think email doesn't exist
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'Forgot password API');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
