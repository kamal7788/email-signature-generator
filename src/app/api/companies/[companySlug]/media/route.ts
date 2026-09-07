import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  isR2Enabled,
  listR2Media,
  deleteR2Media,
  listLocalMedia,
  deleteLocalMedia,
} from '@/lib/r2';

function validSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(slug);
}

/** Key must be exactly <slug>/<safe-filename> — no traversal. */
function validKey(slug: string, key: string): string | null {
  const prefix = `${slug}/`;
  if (!key.startsWith(prefix)) return null;
  const filename = key.slice(prefix.length);
  if (!/^[A-Za-z0-9._-]+\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) return null;
  if (filename.includes('/') || filename.includes('\\')) return null;
  return filename;
}

function requestBase(req: Request): string {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const finalHost = forwardedHost || host || 'localhost:3000';
  const protocol =
    req.headers.get('x-forwarded-proto') ||
    (finalHost.includes('localhost') ? 'http' : 'https');
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${protocol}://${finalHost}`
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  if (!validSlug(companySlug)) {
    return NextResponse.json({ error: 'Invalid company slug.' }, { status: 400 });
  }
  try {
    const items = isR2Enabled()
      ? await listR2Media(companySlug)
      : listLocalMedia(companySlug, requestBase(req));
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list media.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ companySlug: string }> }
) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { companySlug } = await params;
  if (!validSlug(companySlug)) {
    return NextResponse.json({ error: 'Invalid company slug.' }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const key = (body?.key ?? '').trim();
  const filename = validKey(companySlug, key);
  if (!filename) {
    return NextResponse.json({ error: 'Invalid media key.' }, { status: 400 });
  }
  try {
    if (isR2Enabled()) {
      await deleteR2Media(key);
    } else if (!deleteLocalMedia(companySlug, filename)) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete media.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
