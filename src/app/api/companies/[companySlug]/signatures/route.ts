import { NextResponse } from 'next/server';
import { createSignature, listSignatures } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  const sigs = listSignatures(companySlug);
  return NextResponse.json(sigs);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  const body = await req.json();
  try {
    const sig = createSignature(companySlug, body);
    return NextResponse.json(sig, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create signature.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
