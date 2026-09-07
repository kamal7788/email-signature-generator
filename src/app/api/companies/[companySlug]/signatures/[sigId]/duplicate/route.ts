import { NextResponse } from 'next/server';
import { duplicateSignature } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companySlug: string; sigId: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug, sigId } = await params;
  const dup = duplicateSignature(companySlug, sigId);
  if (!dup) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(dup, { status: 201 });
}
