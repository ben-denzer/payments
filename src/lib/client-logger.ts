// Client-side logger utility that sends logs to the server
// This avoids exposing New Relic API keys to the client

interface LogData {
  message?: string;
  error?: string | Error;
  level?: 'INFO' | 'ERROR' | 'WARN';
  context?: string;
  metadata?: Record<string, any>;
}

class ClientLogger {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async sendLog(data: LogData): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key if provided (for mobile apps)
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const payload: any = {
        level: data.level || 'ERROR',
        context: data.context,
        metadata: {
          ...data.metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      };

      // Handle different log types
      if (data.level === 'ERROR' || !data.level) {
        payload.error = data.error instanceof Error ? data.error.message : data.error;
      } else {
        payload.message = data.message;
      }

      const response = await fetch('/api/logger', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        // Don't send credentials for security - let origin validation handle auth
        credentials: 'omit',
      });

      if (!response.ok) {
        console.warn('Failed to send log to server:', response.status);
      }
    } catch (error) {
      // Silently fail - we don't want client logging to break the app
      console.warn('Client logging failed:', error);
    }
  }

  /**
   * Log an error from the client side
   */
  error(error: string | Error, context?: string, metadata?: Record<string, any>): void {
    this.sendLog({ error, level: 'ERROR', context, metadata });
  }

  /**
   * Log a warning from the client side
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.sendLog({
      message,
      level: 'WARN',
      context: context || 'Client Warning',
      metadata
    });
  }

  /**
   * Log info from the client side
   */
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.sendLog({
      message,
      level: 'INFO',
      context: context || 'Client Info',
      metadata
    });
  }
}

// Export a default instance for web clients (uses origin validation)
export const clientLogger = new ClientLogger();

// Export the class for mobile apps that need API keys
export { ClientLogger };

// Convenience functions for common use cases
export const logClientError = (error: string | Error, context?: string) => {
  clientLogger.error(error, context);
};

export const logClientWarning = (message: string, context?: string) => {
  clientLogger.warn(message, context);
};

export const logClientInfo = (message: string, context?: string) => {
  clientLogger.info(message, context);
};;
