import { executeQuery, executeQuerySingle } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { s3Client } from '@/lib/s3client';

// Maximum expiration time for signed URLs (7 days in seconds)
const MAX_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;

export interface GetFileUrlResult {
  signedUrl: string;
  expiresAt: string;
}

export async function getFileUrl(fileId: number, routeName: string): Promise<GetFileUrlResult> {
  // Get file from database
  const file = await executeQuerySingle('SELECT id, url, signed_url, signed_url_expires_at FROM files WHERE id = ?', [
    fileId,
  ]);

  if (!file) {
    logError(new Error('File not found'), routeName, { fileId });
    throw new Error('File not found');
  }

  // Check if we have a cached signed URL that's still valid
  const now = new Date();
  let cachedExpiresAt: Date | null = null;

  if (file.signed_url_expires_at) {
    try {
      cachedExpiresAt = new Date(file.signed_url_expires_at as string | Date);
    } catch {
      logError(new Error('Invalid cached expiration date format'), routeName, {
        fileId,
        expiresAt: file.signed_url_expires_at,
      });
      cachedExpiresAt = null;
    }
  }

  if (file.signed_url && cachedExpiresAt && cachedExpiresAt > new Date(now.getTime() + 60 * 1000)) {
    // Cached URL is still valid, return it
    logInfo('Returning cached signed URL', routeName, { fileId });
    return {
      signedUrl: file.signed_url as string,
      expiresAt: cachedExpiresAt.toISOString(),
    };
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

    logInfo('Generated and cached new signed URL', routeName, {
      fileId,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      signedUrl,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (s3Error) {
    logError(s3Error instanceof Error ? s3Error : new Error(String(s3Error)), routeName, { fileId, s3Key });
    throw new Error('Failed to generate signed URL');
  }
}
