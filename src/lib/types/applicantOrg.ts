import z from 'zod';

export const ApplicantOrgStatusSchema = z.union([
  z.literal('invited'),
  z.literal('in_progress'),
  z.literal('applied'),
  z.literal('approved'),
  z.literal('rejected'),
  z.literal('archived'),
]);

export type ApplicantOrgStatus = z.infer<typeof ApplicantOrgStatusSchema>;

export const DBApplicantOrgInputSchema = z.object({
  company_name: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(255, { message: 'Company name is too long' }),
  primary_contact_name: z
    .string()
    .min(2, { message: 'Contact name must be at least 2 characters' })
    .max(255, { message: 'Contact name is too long' }),
  primary_contact_email: z.email({
    message: 'Please enter a valid email address',
  }),
  storage_bucket_base: z
    .string()
    .min(2, { message: 'Storage bucket base must be at least 2 characters' })
    .max(25, { message: 'Storage bucket base is too long' }),
});

export type DBApplicantOrgInput = z.infer<typeof DBApplicantOrgInputSchema>;

export const DBApplicantOrgSchema = DBApplicantOrgInputSchema.extend({
  id: z.number(),
  status: ApplicantOrgStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type DBApplicantOrg = z.infer<typeof DBApplicantOrgSchema>;

export const ApplicantOrgSchema = z.object({
  id: z.number(),
  companyName: z.string().min(1).max(255),
  primaryContactName: z.string().min(1).max(255),
  primaryContactEmail: z.email(),
  storageBucketBase: z.string().min(2).max(255),
  status: ApplicantOrgStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApplicantOrg = z.infer<typeof ApplicantOrgSchema>;

export const ApplicantOrgListSchema = z.array(ApplicantOrgSchema);
export type ApplicantOrgList = z.infer<typeof ApplicantOrgListSchema>;

export const mapDBApplicantOrgToApplicantOrg = (
  dbApplicantOrg: DBApplicantOrg,
): ApplicantOrg => {
  return {
    id: dbApplicantOrg.id,
    companyName: dbApplicantOrg.company_name,
    primaryContactName: dbApplicantOrg.primary_contact_name,
    primaryContactEmail: dbApplicantOrg.primary_contact_email,
    storageBucketBase: dbApplicantOrg.storage_bucket_base,
    status: dbApplicantOrg.status,
    createdAt: new Date(dbApplicantOrg.created_at).toISOString(),
    updatedAt: new Date(dbApplicantOrg.updated_at).toISOString(),
  };
};

export const GetClientRequestSchema = z.object({
  clientID: z.number(),
});
export type GetClientRequest = z.infer<typeof GetClientRequestSchema>;
