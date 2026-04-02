import { NextResponse } from 'next/server';
import { getCompany, deleteCompany } from '@/lib/storage';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const { companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(company);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const { companySlug } = await params;
  const ok = deleteCompany(companySlug);
  if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
