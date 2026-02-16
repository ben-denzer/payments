import { executeQuery } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';
import {
  ApplicantOrgListSchema,
  DBApplicantOrg,
  mapDBApplicantOrgToApplicantOrg,
} from '@/lib/types/applicantOrg';

const ROUTE_NAME = 'Get Client List API';

export async function POST(): Promise<
  NextResponse<{ message: string } | { error: string }>
> {
  try {
    logInfo('Getting client list', ROUTE_NAME);
    await validateAdmin(await cookies(), ROUTE_NAME);

    const applicantOrgList = await executeQuery<DBApplicantOrg>(
      'SELECT id, company_name, primary_contact_name, primary_contact_email, storage_bucket_base, created_at, updated_at FROM applicant_org',
      [],
    );

    const frontendApplicantOrgList = applicantOrgList.map(
      mapDBApplicantOrgToApplicantOrg,
    );
    ApplicantOrgListSchema.parse(frontendApplicantOrgList);

    return NextResponse.json(
      { message: 'success', clientList: frontendApplicantOrgList },
      { status: 200 },
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
