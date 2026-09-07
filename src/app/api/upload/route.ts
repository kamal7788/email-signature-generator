import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/storage';
import { isR2Enabled, uploadToR2 } from '@/lib/r2';

// SVG uploads disabled: SVG can carry <script> and breaks many webmail clients.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

function maxBytes(): number {
  const mb = parseFloat(process.env.MAX_UPLOAD_MB ?? '2');
  const safe = Number.isFinite(mb) ? Math.min(Math.max(mb, 0.5), 25) : 2;
  return Math.round(safe * 1024 * 1024);
}

/** Verify magic bytes match the claimed MIME (cheap spoof guard). */
function magicOk(bytes: Buffer, mime: string): boolean {
  if (bytes.length < 12) return false;
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/png')
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === 'image/gif')
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
  if (mime === 'image/webp')
    return (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    );
  return false;
}

export async function POST(req: Request) {
  const denied = requireAuth(req);
  if (denied) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const rawSlug = ((formData.get('companySlug') as string) ?? 'general').trim();

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.' },
      { status: 400 }
    );
  }

  const limit = maxBytes();
  if (file.size > limit || file.size === 0) {
    return NextResponse.json(
      { error: `File must be 1 byte–${(limit / 1024 / 1024).toFixed(1)} MB.` },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!magicOk(bytes, file.type)) {
    return NextResponse.json({ error: 'File content does not match its type.' }, { status: 400 });
  }

  const companySlug = slugify(rawSlug) || 'general';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Cloudflare R2 when configured — public https URL for email clients.
  if (isR2Enabled()) {
    try {
      const url = await uploadToR2(bytes, companySlug, ext, file.type);
      return NextResponse.json({ url, storage: 'r2' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'R2 upload failed.';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Local fallback: public/uploads/<slug>/<file>
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', companySlug);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, safeName), bytes);

  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const finalHost = forwardedHost || host || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (finalHost.includes('localhost') ? 'http' : 'https');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${finalHost}`;

  return NextResponse.json({ url: `${baseUrl}/uploads/${companySlug}/${safeName}`, storage: 'local' });
}
