export interface ApplicantOrg {
  id: number;
  company_name: string; // 255
  primary_contact_name: string; // 255
  primary_contact_email: string; // 255
  created_at: string;
  updated_at?: string;
}

export interface File {
  id: number;
  url: string; // 500
  applicant_org_id: number;
  file_category: string; // 255
  note?: string; // 500
  created_at: string;
  updated_at?: string;
}
