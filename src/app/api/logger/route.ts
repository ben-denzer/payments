import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/logger';

// Rate limiting store (in production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return true;
  }

  userLimit.count++;
  return false;
}

function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests from our domain
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  // Check origin header
  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  // Check referer header (fallback for some browsers)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedOrigins.some(allowed => refererUrl.origin === allowed)) {
        return true;
      }
    } catch {
      // Invalid referer URL, continue checking
    }
  }

  // For mobile apps or API clients, check for valid API key
  const apiKey = request.headers.get('x-api-key');
  const validApiKeys = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);

  if (apiKey && validApiKeys.includes(apiKey)) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Rate limiting
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate origin/domain/API key
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { error, message, level = 'ERROR', context, metadata } = body;

    // Validate required fields based on log level
    if (level === 'ERROR' && !error) {
      return NextResponse.json(
        { error: 'Error message is required for ERROR level logs' },
        { status: 400 }
      );
    }

    if ((level === 'INFO' || level === 'WARN') && !message) {
      return NextResponse.json(
        { error: 'Message is required for INFO/WARN level logs' },
        { status: 400 }
      );
    }

    // Validate log level
    if (!['ERROR', 'WARN', 'INFO'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid log level. Must be ERROR, WARN, or INFO' },
        { status: 400 }
      );
    }

    // Log based on level
    const logContext = context || `Client ${level}`;
    const logMetadata = (metadata && typeof metadata === 'object') ? metadata : {};

    if (level === 'ERROR') {
      logError(error, logContext, logMetadata);
    } else {
      // For INFO and WARN, use the message
      const fullMessage = level === 'WARN' ? `Warning: ${message}` : message;
      logInfo(fullMessage, logContext, logMetadata);
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    // Log server-side errors
    logError(error, 'Logger API Error', {});

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
