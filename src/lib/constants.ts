export const MIN_PASSWORD_LENGTH = 8;
export const AUTH_COOKIE_NAME = 'auth-token';
export const AUTH_COOKIE_CONFIG = (option: 'login' | 'logout') =>
  ({
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_ENV === 'production',
    sameSite: 'lax',
    maxAge: option === 'login' ? 7 * 24 * 60 * 60 : 0,
    path: '/',
  }) as const;
