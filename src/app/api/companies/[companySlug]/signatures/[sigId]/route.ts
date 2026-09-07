import { NextResponse } from 'next/server';
import { getSignature, updateSignature, deleteSignature } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companySlug: string; sigId: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug, sigId } = await params;
  const sig = getSignature(companySlug, sigId);
  if (!sig) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(sig);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ companySlug: string; sigId: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug, sigId } = await params;
  const body = await req.json();
  const updated = updateSignature(companySlug, sigId, body);
  if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ companySlug: string; sigId: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug, sigId } = await params;
  const ok = deleteSignature(companySlug, sigId);
  if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
