import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';
import { getFileUrl } from '@/lib/getFileUrl';
import z from 'zod';

const ROUTE_NAME = 'Get File URL API (Admin)';

const GetFileUrlRequestSchema = z.object({
  fileId: z.string().min(1),
});

type GetFileUrlRequest = z.infer<typeof GetFileUrlRequestSchema>;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ signedUrl: string; expiresAt: string } | { error: string }>> {
  try {
    logInfo('Getting file signed URL', ROUTE_NAME);
    await validateAdmin(await cookies(), ROUTE_NAME);

    const data: GetFileUrlRequest = await request.json();

    const result = GetFileUrlRequestSchema.safeParse(data);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }

    const fileId = parseInt(result.data.fileId);

    try {
      const result = await getFileUrl(fileId, ROUTE_NAME);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get file URL';
      if (message === 'File not found') {
        return NextResponse.json({ error: message }, { status: 404 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
