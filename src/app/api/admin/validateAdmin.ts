import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { verifyJWT } from "@/lib/auth";
import {  NextResponse } from "next/server";
import { RequestCookies, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

type ReadonlyRequestCookies = Omit<RequestCookies, 'set' | 'clear' | 'delete'> & Pick<ResponseCookies, 'set' | 'delete'>;

export async function validateAdmin(cookieStore: ReadonlyRequestCookies): Promise<null | NextResponse> {
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJWT(authToken);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!payload.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
