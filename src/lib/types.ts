export interface User {
  id: number;
  email: string;
  isAdmin: boolean | undefined | null;
  isOwner: boolean | undefined | null;
  created_at: string;
}
