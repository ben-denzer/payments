import { executeQuery } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';
import {
  ApplicantOrg,
  ApplicantOrgSchema,
  DBApplicantOrg,
  GetClientRequestSchema,
  mapDBApplicantOrgToApplicantOrg,
} from '@/lib/types/applicantOrg';
import z from 'zod';

const ROUTE_NAME = 'Get Single Client API';

export async function POST(
  request: Request,
): Promise<
  NextResponse<{ message: string; client: ApplicantOrg } | { error: string }>
> {
  try {
    logInfo('Getting client', ROUTE_NAME);
    await validateAdmin(await cookies(), ROUTE_NAME);

    const body = await request.json();
    const { clientID } = GetClientRequestSchema.parse(body);

    const applicantOrgResult = await executeQuery<DBApplicantOrg>(
      'SELECT id, company_name, primary_contact_name, primary_contact_email, storage_bucket_base, status, created_at, updated_at FROM applicant_org WHERE id = ?',
      [clientID],
    );

    if (applicantOrgResult.length === 0) {
      logError(new Error('Client not found'), ROUTE_NAME, { clientID });
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const frontendApplicantOrg = mapDBApplicantOrgToApplicantOrg(
      applicantOrgResult[0],
    );
    ApplicantOrgSchema.parse(frontendApplicantOrg);

    return NextResponse.json(
      { message: 'success', client: frontendApplicantOrg },
      { status: 200 },
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logError(error, ROUTE_NAME);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
