import { NextResponse } from 'next/server';
import { duplicateSignature } from '@/lib/storage';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companySlug: string; sigId: string }> }
) {
  const { companySlug, sigId } = await params;
  const dup = duplicateSignature(companySlug, sigId);
  if (!dup) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(dup, { status: 201 });
}
