import { executeInsert } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { DBApplicantOrgInput, DBApplicantOrgInputSchema } from '@/lib/types/applicantOrg';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';

const ROUTE_NAME = 'Create Client API';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ message: string; orgId: string } | { error: string }>> {
  try {
    logInfo('Creating client', ROUTE_NAME);
    await validateAdmin(await cookies(), ROUTE_NAME);

    const data: DBApplicantOrgInput = await request.json();

    const result = DBApplicantOrgInputSchema.safeParse(data);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }
    const applicantOrg = await executeInsert(
      'INSERT INTO applicant_org(company_name, primary_contact_name, primary_contact_email, storage_bucket_base) VALUES (?, ?, ?, ?)',
      [
        result.data.company_name,
        result.data.primary_contact_name,
        result.data.primary_contact_email,
        result.data.storage_bucket_base,
      ],
    );

    logInfo('Success. Client created', ROUTE_NAME);

    return NextResponse.json({ message: 'success', orgId: applicantOrg.toString() }, { status: 200 });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (
      error.message.toLowerCase().includes('duplicate entry') &&
      error.message.toLowerCase().includes('primary_contact_email')
    ) {
      return NextResponse.json({ error: 'Email already associated with another client.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
