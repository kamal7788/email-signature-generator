import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Reject traversal + junk: only slug-safe segments, known image ext.
  if (!segments || segments.length === 0 || segments.length > 4) {
    return new NextResponse('Not found', { status: 404 });
  }
  for (const seg of segments) {
    if (!seg || seg === '.' || seg === '..' || seg.includes('/') || seg.includes('\\')) {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  const resolved = path.resolve(path.join(UPLOAD_BASE, ...segments));
  if (!resolved.startsWith(path.resolve(UPLOAD_BASE) + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  const body = fs.readFileSync(resolved);

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
