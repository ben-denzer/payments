import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { UploadFileRequest, UploadFileRequestSchema } from '@/lib/types/file';
import { uploadFile } from '@/lib/uploadFile';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';

const ROUTE_NAME = 'Upload File API (Admin)';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ message: string; fileId: number } | { error: string } | unknown>> {
  try {
    logInfo('Uploading file', ROUTE_NAME);
    const adminPayload = await validateAdmin(await cookies(), ROUTE_NAME);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientID = formData.get('clientID') as string;
    const requirement = formData.get('requirement') as string;
    const note = formData.get('note') as string;

    // Validate the request data
    const validationData: UploadFileRequest = {
      clientID,
      requirement,
      note: note || undefined,
    };

    const result = UploadFileRequestSchema.safeParse(validationData);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data: validationData });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }

    try {
      const uploadResult = await uploadFile(result.data, file, adminPayload, ROUTE_NAME);
      return NextResponse.json(uploadResult, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      if (
        message === 'Invalid requirement type' ||
        message === 'No file provided' ||
        message === 'File size exceeds 50MB limit'
      ) {
        return NextResponse.json({ error: message }, { status: 400 });
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
