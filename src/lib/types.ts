export interface DBUser {
  id: number;
  email: string; // 255
  password_hash: string; // 255
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  is_owner: boolean;
}

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export interface JWTPayload extends User {
  iat?: number;
  exp?: number;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ApplicantOrg {
  id: number;
  company_name: string;
  primary_contact_name: string;
  primary_contact_email: string;
  created_at: string;
  updated_at?: string;
}

export interface File {
  id: number;
  url: string;
  applicant_org_id: number;
  file_category: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}
