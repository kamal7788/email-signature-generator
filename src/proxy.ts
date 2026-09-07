import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkBasicAuth, isAuthEnabled, isPublicImageRead } from '@/lib/auth';

export default function proxy(req: NextRequest) {
  // Open by default; lock down only when AUTH_USERNAME/PASSWORD are set.
  if (!isAuthEnabled()) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Let email clients fetch images/icons without credentials.
  if (isPublicImageRead(pathname, req.method)) return NextResponse.next();

  // Allow Next internals; everything else needs the login.
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon')
  ) {
    return NextResponse.next();
  }

  if (checkBasicAuth(req.headers.get('authorization'))) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Email Signature Studio"' },
  });
}

export const config = {
  // Run on pages + API, skip static asset internals handled above.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
