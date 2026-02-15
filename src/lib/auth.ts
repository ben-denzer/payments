import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(JWT_SECRET);


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
      return typeof payload === 'object' && payload !== null && 'id' in payload && typeof payload.id === 'number' && 'email' in payload && typeof payload.email === 'string';
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
