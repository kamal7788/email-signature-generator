import { NextResponse } from 'next/server';
import { createCompany, listCompanies } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const companies = listCompanies();
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await req.json();
  const name = (body.name ?? '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
  }
  try {
    const company = createCompany(name);
    return NextResponse.json(company, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create company.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
