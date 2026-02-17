import z from 'zod';

export const DBFileSchema = z.object({
  id: z.number(),
  url: z.url(),
  applicant_org_id: z.number(),
  file_category: z.string().min(2).max(255),
  note: z.string().max(500).optional(),
  uploaded_by: z.number(),
  signed_url: z.string().optional(),
  signed_url_expires_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DBFile = z.infer<typeof DBFileSchema>;

export const UploadFileRequestSchema = z.object({
  clientID: z.string().min(1),
  requirement: z.string().min(1),
  note: z.string().max(500).optional(),
});

export type UploadFileRequest = z.infer<typeof UploadFileRequestSchema>;

export const ClientFileSchema = z.object({
  id: z.number(),
  url: z.string(),
  file_category: z.string(),
  note: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ClientFile = z.infer<typeof ClientFileSchema>;
