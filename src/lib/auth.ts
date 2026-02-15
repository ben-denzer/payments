import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { logError } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);


export interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean | undefined | null;
  isOwner: boolean | undefined | null;
  iat?: number;
  exp?: number;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export async function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(secret);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    function isJWTPayload(payload: unknown): payload is JWTPayload {
      return typeof payload === 'object' && payload !== null && 'userId' in payload && typeof payload.userId === 'number' && 'email' in payload && typeof payload.email === 'string';
    }

    if (!isJWTPayload(payload)) {
      throw new Error('Invalid token');
    }

    return payload as JWTPayload;
  } catch (error) {
    // JWT verification errors are authorization errors and should not be logged
    // They return null which is handled appropriately by callers
    return null;
  }
}

// Cookie utilities for client-side auth
export function createAuthCookie(token: string): string {
  return `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`; // 7 days
}

export function clearAuthCookie(): string {
  return 'auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
