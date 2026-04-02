import { NextResponse } from 'next/server';
import { createSignature, listSignatures } from '@/lib/storage';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const { companySlug } = await params;
  const sigs = listSignatures(companySlug);
  return NextResponse.json(sigs);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
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
