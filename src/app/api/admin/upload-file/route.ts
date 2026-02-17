import { executeInsert } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { UploadFileRequest, UploadFileRequestSchema } from '@/lib/types/file';
import { Requirements } from '@/lib/formRequirements';
import { s3Client } from '@/lib/s3client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';

const ROUTE_NAME = 'AdminUpload File API';

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

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

    // Validate requirement type
    if (!Object.values(Requirements).includes(requirement as Requirements)) {
      logError(new Error('Invalid requirement type'), ROUTE_NAME, { requirement });
      return NextResponse.json({ error: 'Invalid requirement type' }, { status: 400 });
    }

    // Validate file
    if (!file) {
      logError(new Error('No file provided'), ROUTE_NAME);
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      logError(new Error('File too large'), ROUTE_NAME, { fileSize: file.size, maxSize });
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${requirement}_${clientID}_${timestamp}_${file.name}`;
    const s3Key = `${isProduction ? '' : 'test/'}${clientID}/${fileName}`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: '',
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type,
        ACL: 'private',
      });

      await s3Client.send(uploadCommand);
      logInfo('File uploaded to S3 successfully', ROUTE_NAME, { s3Key });
    } catch (s3Error) {
      logError(s3Error instanceof Error ? s3Error : new Error(String(s3Error)), ROUTE_NAME, { s3Key });
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
    }

    // Generate file URL
    const fileUrl = `${process.env.DIGITAL_OCEAN_STORAGE_URL}/${s3Key}`;

    // Save file metadata to database
    let insertId: number;
    try {
      insertId = await executeInsert(
        'INSERT INTO files (url, applicant_org_id, file_category, note, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [fileUrl, parseInt(clientID), requirement, result.data.note || null, adminPayload.id],
      );

      logInfo('File metadata saved to database', ROUTE_NAME, {
        fileId: insertId,
        clientID,
        requirement,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (dbError) {
      logError(dbError instanceof Error ? dbError : new Error(String(dbError)), ROUTE_NAME, {
        clientID,
        requirement,
      });
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        fileId: insertId,
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size,
      },
      { status: 200 },
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
