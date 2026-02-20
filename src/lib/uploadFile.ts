import { executeInsert } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { UploadFileRequest } from '@/lib/types/file';
import { Requirements } from '@/lib/formRequirements';
import { s3Client } from '@/lib/s3client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { JWTPayload } from '@/lib/types/user';

export interface UploadFileResult {
  message: string;
  fileId: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

export const uploadErrorMessages = {
  INVALID_REQUIREMENT_TYPE: 'Invalid requirement type',
  NO_FILE_PROVIDED: 'No file provided',
  FILE_TOO_LARGE: 'File too large',
  FILE_SIZE_EXCEEDS_LIMIT: 'File size exceeds 50MB limit',
  FAILED_TO_UPLOAD_FILE: 'Failed to upload file',
  FAILED_TO_SAVE_FILE_METADATA: 'Failed to save file metadata',
};

export async function uploadFile(
  validationData: UploadFileRequest,
  file: File,
  userPayload: JWTPayload,
  routeName: string,
): Promise<UploadFileResult> {
  // Validate requirement type
  if (!Object.values(Requirements).includes(validationData.requirement as Requirements)) {
    logError(new Error('Invalid requirement type'), routeName, { requirement: validationData.requirement });
    throw new Error(uploadErrorMessages.INVALID_REQUIREMENT_TYPE);
  }

  // Validate file
  if (!file) {
    logError(new Error('No file provided'), routeName);
    throw new Error(uploadErrorMessages.NO_FILE_PROVIDED);
  }

  // Check file size (limit to 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    logError(new Error('File too large'), routeName, { fileSize: file.size, maxSize });
    throw new Error(uploadErrorMessages.FILE_SIZE_EXCEEDS_LIMIT);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `${validationData.requirement}_${validationData.clientID}_${timestamp}_${file.name}`;
  const s3Key = `${isProduction ? '' : 'test/'}${validationData.clientID}/${fileName}`;

  // Convert file to buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Upload to S3
  try {
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.DIGITAL_OCEAN_STORAGE_BUCKET!,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: 'private',
    });

    await s3Client.send(uploadCommand);
    logInfo('File uploaded to S3 successfully', routeName, { s3Key });
  } catch (s3Error) {
    logError(s3Error instanceof Error ? s3Error : new Error(String(s3Error)), routeName, { s3Key });
    throw new Error(uploadErrorMessages.FAILED_TO_UPLOAD_FILE);
  }

  // Generate file URL
  const fileUrl = `${process.env.DIGITAL_OCEAN_STORAGE_URL}/${s3Key}`;

  // Save file metadata to database
  let insertId: number;
  try {
    insertId = await executeInsert(
      'INSERT INTO files (url, applicant_org_id, file_category, note, uploaded_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [
        fileUrl,
        parseInt(validationData.clientID),
        validationData.requirement,
        validationData.note || null,
        userPayload.id,
      ],
    );

    logInfo('File metadata saved to database', routeName, {
      fileId: insertId,
      clientID: validationData.clientID,
      requirement: validationData.requirement,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (dbError) {
    logError(dbError instanceof Error ? dbError : new Error(String(dbError)), routeName, {
      clientID: validationData.clientID,
      requirement: validationData.requirement,
    });
    throw new Error(uploadErrorMessages.FAILED_TO_SAVE_FILE_METADATA);
  }

  return {
    message: 'File uploaded successfully',
    fileId: insertId,
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}
