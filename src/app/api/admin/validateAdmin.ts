import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { verifyJWT } from '@/lib/auth';
import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { AuthError } from '@/lib/types/AuthError';
import { logError } from '@/lib/logger';
import { JWTPayload } from '@/lib/types/user';

type ReadonlyRequestCookies = Omit<RequestCookies, 'set' | 'clear' | 'delete'> &
  Pick<ResponseCookies, 'set' | 'delete'>;

export async function validateAdmin(cookieStore: ReadonlyRequestCookies, routeName: string): Promise<JWTPayload> {
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!authToken) {
    logError(new Error('User trying to access admin route with no cookie'), routeName, { authToken });
    throw new AuthError('Unauthorized');
  }

  const payload = await verifyJWT(authToken);
  if (!payload) {
    logError(new Error('User trying to access admin route with bad cookie'), routeName, { authToken });
    throw new AuthError('Unauthorized');
  }
  if (!payload.isAdmin) {
    logError(new Error('Non admin user trying to access admin route'), routeName, { authToken });
    throw new AuthError('Unauthorized');
  }

  return payload;
}
