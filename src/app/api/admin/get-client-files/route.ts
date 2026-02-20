import { executeQuery } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { ClientFile } from '@/lib/types/file';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';
import z from 'zod';

const ROUTE_NAME = 'Get Client Files API (Admin)';

const GetClientFilesRequestSchema = z.object({
  clientID: z.string().min(1),
});

type GetClientFilesRequest = z.infer<typeof GetClientFilesRequestSchema>;

export async function POST(request: NextRequest): Promise<NextResponse<{ files: ClientFile[] } | { error: string }>> {
  try {
    logInfo('Getting client files', ROUTE_NAME);
    const adminPayload = await validateAdmin(await cookies(), ROUTE_NAME);

    if (adminPayload instanceof NextResponse) {
      return adminPayload;
    }

    const data: GetClientFilesRequest = await request.json();

    const result = GetClientFilesRequestSchema.safeParse(data);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }

    const clientID = parseInt(result.data.clientID);

    // Get files for this client
    const files = await executeQuery<ClientFile>(
      `SELECT
        id,
        url,
        file_category,
        note,
        created_at,
        updated_at
      FROM files
      WHERE applicant_org_id = ?
      ORDER BY created_at DESC`,
      [clientID],
    );

    logInfo('Retrieved client files', ROUTE_NAME, {
      clientID,
      fileCount: files.length,
    });

    return NextResponse.json({ files }, { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
