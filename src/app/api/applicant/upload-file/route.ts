import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { UploadFileRequest, UploadFileRequestSchema } from '@/lib/types/file';
import { uploadErrorMessages, uploadFile } from '@/lib/uploadFile';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateApplicant } from '../validateApplicant';
import { AuthError } from '@/lib/types/AuthError';

const ROUTE_NAME = 'Upload File API (Applicant)';

export async function POST(
  request: NextRequest,
): Promise<
  NextResponse<
    | { message: string; fileId: number; fileUrl: string; fileName: string; fileSize: number }
    | { error: string }
    | unknown
  >
> {
  try {
    logInfo('Uploading file', ROUTE_NAME);
    const applicantPayload = await validateApplicant(await cookies(), ROUTE_NAME);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requirement = formData.get('requirement') as string;
    const note = formData.get('note') as string;

    // Validate the request data
    const validationData: UploadFileRequest = {
      clientID: applicantPayload.applicantOrgId.toString(),
      requirement,
      note: note || undefined,
    };

    const result = UploadFileRequestSchema.safeParse(validationData);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data: validationData });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }

    try {
      const uploadResult = await uploadFile(result.data, file, applicantPayload, ROUTE_NAME);
      return NextResponse.json(uploadResult, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : uploadErrorMessages.FAILED_TO_UPLOAD_FILE;
      if (
        message === uploadErrorMessages.INVALID_REQUIREMENT_TYPE ||
        message === uploadErrorMessages.NO_FILE_PROVIDED ||
        message === uploadErrorMessages.FILE_SIZE_EXCEEDS_LIMIT
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
