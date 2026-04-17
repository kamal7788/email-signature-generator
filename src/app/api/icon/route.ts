import { NextRequest, NextResponse } from 'next/server';
import { SOCIAL_PATHS } from '@/lib/social-paths';
import { SocialPlatform } from '@/types';

/**
 * GET /api/icon?p=linkedin&c=%234f46e5&s=28&shape=rounded
 *
 * Returns an SVG image with real Content-Type: image/svg+xml.
 * Webmail clients (Roundcube, Gmail, Outlook Web) load this as a normal
 * <img src="https://yourhost/api/icon?..."> — no data URIs needed.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const platform = (sp.get('p') ?? '') as SocialPlatform;
  const color = sp.get('c') ?? '#4f46e5';
  const size = Math.min(64, Math.max(16, parseInt(sp.get('s') ?? '28', 10)));
  const shape = sp.get('shape') === 'circle' ? 'circle' : 'rounded';

  const path = SOCIAL_PATHS[platform];
  if (!path) {
    return new NextResponse('Not found', { status: 404 });
  }

  const pad = Math.round(size * 0.22);
  const inner = size - pad * 2;
  const rx = shape === 'circle' ? size / 2 : Math.round(size * 0.22);

  // Sanitise color — allow only hex and named colors to prevent injection
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#4f46e5';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${safeColor}"/>
  <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="white">
    <path d="${path}"/>
  </svg>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
