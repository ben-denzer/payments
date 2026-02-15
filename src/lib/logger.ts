// Import the entire newrelic module type
import type * as NewRelicModule from 'newrelic';

// Conditionally import NewRelic
let newrelic: typeof NewRelicModule | null = null;
try {
  newrelic = require('newrelic');
} catch {
  // NewRelic not available, logging will be skipped
}

/**
 * Cached service identifier for logging (computed once at module load)
 */
const SERVICE_NAME = `rr-${process.env.NEXT_PUBLIC_APP_ENV || 'development'}`;

/**
 * Checks if an error is an authorization/authentication error that should not be logged
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = typeof error === 'string' ? error :
                      error instanceof Error ? error.message :
                      String(error);

  const authErrorPatterns = [
    /invalid.*password/i,
    /invalid.*token/i,
    /invalid.*email/i,
    /no.*authentication.*token/i,
    /expired.*token/i,
    /unauthorized/i,
    /authentication.*failed/i,
    /invalid.*credentials/i
  ];

  return authErrorPatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Logs an error to NewRelic, but skips authorization errors
 */
export function logError(error: unknown, context?: string): void {
  // Skip logging authorization errors
  if (isAuthError(error)) {
    return;
  }

  // Skip if NewRelic is not available
  if (!newrelic) {
    console.error(`[${context || 'Unknown'}]`, error);
    return;
  }

  // Log to NewRelic
  const metadata: { [key: string]: string | number | boolean } = {
    context: context || 'Unknown',
    service: SERVICE_NAME
  };

  if (typeof error === 'string') {
    newrelic.noticeError(new Error(error), metadata);
  } else if (error instanceof Error) {
    newrelic.noticeError(error, metadata);
  } else {
    newrelic.noticeError(new Error(String(error)), metadata);
  }
}

/**
 * Logs an error with additional metadata
 */
export function logErrorWithMetadata(
  error: unknown,
  context: string,
  metadata?: Record<string, unknown>
): void {
  // Skip logging authorization errors
  if (isAuthError(error)) {
    return;
  }

  // Skip if NewRelic is not available
  if (!newrelic) {
    console.error(`[${context}]`, error, metadata);
    return;
  }

  // Log to NewRelic with metadata
  const fullMetadata: { [key: string]: string | number | boolean } = {
    context: context || 'Unknown',
    service: SERVICE_NAME,
    ...metadata
  };

  if (typeof error === 'string') {
    newrelic.noticeError(new Error(error), fullMetadata);
  } else if (error instanceof Error) {
    newrelic.noticeError(error, fullMetadata);
  } else {
    newrelic.noticeError(new Error(String(error)), fullMetadata);
  }
}

/**
 * Logs an info message to NewRelic
 */
export function logInfo(message: string, context?: string): void {
  // Skip if NewRelic is not available
  if (!newrelic) {
    console.info(`[${context || 'Unknown'}]`, message);
    return;
  }

  // Log to NewRelic as a log event
  const logEvent = {
    message,
    level: 'INFO' as const,
    timestamp: Date.now(),
    context: context || 'Unknown',
    service: SERVICE_NAME,
  };

  newrelic.recordLogEvent(logEvent);
}

/**
 * Logs an info message with additional metadata
 */
export function logInfoWithMetadata(
  message: string,
  context: string,
  metadata?: Record<string, unknown>
): void {
  // Skip if NewRelic is not available
  if (!newrelic) {
    console.info(`[${context}]`, message, metadata);
    return;
  }

  // Log to NewRelic as a log event with metadata
  const logEvent = {
    message,
    level: 'INFO' as const,
    timestamp: Date.now(),
    context,
    service: SERVICE_NAME,
    ...metadata
  };

  newrelic.recordLogEvent(logEvent);
}
