export interface File {
  id: number;
  url: string; // 500
  applicant_org_id: number;
  file_category: string; // 255
  note?: string; // 500
  created_at: string;
  updated_at?: string;
}
