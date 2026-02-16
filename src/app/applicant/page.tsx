import { Routes } from "@/lib/routes";
import { redirect } from "next/navigation";

// people should not end up on this url, but if they type it in send them to dashboard
export default function ApplicantSlashPage() {
  return redirect(Routes.APPLICANT);
}
