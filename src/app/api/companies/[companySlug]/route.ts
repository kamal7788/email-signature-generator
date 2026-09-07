import { NextResponse } from 'next/server';
import { getCompany, deleteCompany } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(company);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  const ok = deleteCompany(companySlug);
  if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
