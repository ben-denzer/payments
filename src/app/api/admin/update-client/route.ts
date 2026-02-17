import { executeQuery } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';
import { parseZodError } from '@/lib/parseZodError';
import { UpdateClientRequest, UpdateClientRequestSchema } from '@/lib/types/applicantOrg';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateAdmin } from '../validateAdmin';
import { AuthError } from '@/lib/types/AuthError';

const ROUTE_NAME = 'Update Client API';

export async function POST(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    logInfo('Updating client', ROUTE_NAME);
    await validateAdmin(await cookies(), ROUTE_NAME);

    const data: UpdateClientRequest = await request.json();

    const result = UpdateClientRequestSchema.safeParse(data);
    if (!result.success) {
      logError(new Error(parseZodError(result.error)), ROUTE_NAME, { data });
      return NextResponse.json({ error: parseZodError(result.error) }, { status: 400 });
    }

    await executeQuery(
      'UPDATE applicant_org SET company_name = ?, primary_contact_name = ?, primary_contact_email = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        result.data.companyName,
        result.data.primaryContactName,
        result.data.primaryContactEmail,
        result.data.status,
        result.data.clientID,
      ],
    );

    logInfo('Success. Client updated', ROUTE_NAME, {
      clientID: result.data.clientID,
    });

    return NextResponse.json({ message: 'Client updated successfully' }, { status: 200 });
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
