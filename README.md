This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Authentication Setup

This app includes a complete custom authentication system with MySQL database integration.

### Database Setup

1. Create a MySQL database named `round_robin`
2. Run the SQL commands in `sql/auth.sql` to create the users table:

```bash
mysql -u your_username -p round_robin < sql/auth.sql
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=round_robin

MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM_EMAIL=your-mailgun-from-email

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production

# Application Environment (for logging service identification)
NEXT_PUBLIC_APP_ENV=development

# API Keys for client logging (comma-separated list)
VALID_API_KEYS=your-api-key-1,your-api-key-2

# New Relic Configuration (optional - for error logging)
NEW_RELIC_LICENSE_KEY=your-newrelic-license-key
```

### Features Included

- User registration and login
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Responsive navbar with conditional auth buttons
- Sign up and login forms with validation
- API routes for authentication operations

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Logging

This application supports comprehensive logging for both client-side and server-side code without exposing New Relic API keys. All logs are sent through secure server endpoints.

### Server-Side Logging

```typescript
import { logError, logInfo } from '@/lib/logger';

// Log with metadata
logError('Payment processing failed', 'Payment Gateway', {
  userId: 12345,
  amount: 99.99,
  currency: 'USD'
});

logInfo('Cache cleared successfully', 'Cache Manager', {
  cacheSize: 1024,
  duration: 150
});
```

### Web Clients (Browser)
Web clients automatically validate against allowed origins. No additional setup required:

```typescript
import { logClientError, logClientWarning, logClientInfo } from '@/lib/client-logger';

// Log an error
logClientError('Something went wrong in the UI', 'User Interface');

// Log a warning
logClientWarning('Deprecated API usage detected', 'API Client');

// Log info
logClientInfo('User completed onboarding', 'User Journey');

// Log with additional context
logClientError(new Error('Network request failed'), 'API Call', {
  endpoint: '/api/users',
  method: 'GET'
});
```

### Mobile Apps & API Clients
Mobile apps and other API clients must provide an API key:

```typescript
import { ClientLogger } from '@/lib/client-logger';

const logger = new ClientLogger('your-api-key-here');
logger.error('Mobile app error', 'Mobile Context');
```

### Security Features
- **Rate Limiting**: 10 requests per minute per IP
- **Origin Validation**: Web clients must come from allowed domains
- **API Key Authentication**: Mobile apps use API keys
- **Input Validation**: Prevents malicious payloads
- **No Credentials**: Client requests don't send cookies/auth headers

### Environment Variables for Mobile/API Access
```env
# Comma-separated list of valid API keys
VALID_API_KEYS=mobile-app-key-1,web-api-key-2,ios-app-key-3
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
