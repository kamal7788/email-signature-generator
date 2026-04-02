import { NextResponse } from 'next/server';
import { createCompany, listCompanies } from '@/lib/storage';

export async function GET() {
  const companies = listCompanies();
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
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
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
