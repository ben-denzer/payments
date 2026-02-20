import z from 'zod';

export const DBUserSchema = z.object({
  id: z.number(),
  email: z.email(),
  password_hash: z.string().min(1).max(255),
  created_at: z.string(),
  updated_at: z.string(),
  is_admin: z.boolean(),
  is_owner: z.boolean(),
  applicant_org_id: z.number().nullable(),
});

export type DBUser = z.infer<typeof DBUserSchema>;

export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  isAdmin: z.boolean(),
  isOwner: z.boolean(),
  applicantOrgId: z.number().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const JWTPayloadSchema = UserSchema.extend({
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
