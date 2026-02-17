import { executeQuery, executeQuerySingle } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';
import { s3Client } from '@/lib/s3client';
import z from 'zod';

const ROUTE_NAME = 'Get File URL API';

const GetFileUrlRequestSchema = z.object({
  fileId: z.string().min(1),
});

type GetFileUrlRequest = z.infer<typeof GetFileUrlRequestSchema>;

// Maximum expiration time for signed URLs (7 days in seconds)
const MAX_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

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

    // Get file from database
    const file = await executeQuerySingle('SELECT id, url, signed_url, signed_url_expires_at FROM files WHERE id = ?', [
      fileId,
    ]);

    if (!file) {
      logError(new Error('File not found'), ROUTE_NAME, { fileId });
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if we have a cached signed URL that's still valid
    const now = new Date();
    let cachedExpiresAt: Date | null = null;

    if (file.signed_url_expires_at) {
      try {
        cachedExpiresAt = new Date(file.signed_url_expires_at as string | Date);
      } catch {
        logError(new Error('Invalid cached expiration date format'), ROUTE_NAME, {
          fileId,
          expiresAt: file.signed_url_expires_at,
        });
        cachedExpiresAt = null;
      }
    }

    if (file.signed_url && cachedExpiresAt && cachedExpiresAt > now) {
      // Cached URL is still valid, return it
      logInfo('Returning cached signed URL', ROUTE_NAME, { fileId });
      return NextResponse.json(
        {
          signedUrl: file.signed_url as string,
          expiresAt: cachedExpiresAt.toISOString(),
        },
        { status: 200 },
      );
    }

    // Need to generate a new signed URL
    // Extract the S3 key from the URL
    const fileUrl = file.url as string;
    const url = new URL(fileUrl);
    const s3Key = url.pathname.substring(1); // Remove leading slash

    try {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');

      const command = new GetObjectCommand({
        Bucket: process.env.DIGITAL_OCEAN_STORAGE_BUCKET!,
        Key: s3Key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: MAX_EXPIRATION_SECONDS,
      });

      // Calculate expiration time
      const expiresAt = new Date(now.getTime() + MAX_EXPIRATION_SECONDS * 1000);

      // Cache the signed URL in database
      await executeQuery('UPDATE files SET signed_url = ?, signed_url_expires_at = ? WHERE id = ?', [
        signedUrl,
        expiresAt,
        fileId,
      ]);

      logInfo('Generated and cached new signed URL', ROUTE_NAME, {
        fileId,
        expiresAt: expiresAt.toISOString(),
      });

      return NextResponse.json(
        {
          signedUrl,
          expiresAt: expiresAt.toISOString(),
        },
        { status: 200 },
      );
    } catch (s3Error) {
      logError(s3Error instanceof Error ? s3Error : new Error(String(s3Error)), ROUTE_NAME, { fileId, s3Key });
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
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
