import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload, JWTPayloadSchema, User } from './types/user';

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
export async function createJWT(payload: User): Promise<string> {
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

    if (!JWTPayloadSchema.safeParse(payload).success) {
      throw new Error('Invalid token');
    }

    return payload as JWTPayload;
  } catch {
    // JWT verification errors are authorization errors and should not be logged
    // They return null which is handled appropriately by callers
    return null;
  }
}
