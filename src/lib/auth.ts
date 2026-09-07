/**
 * Shared Basic-Auth helpers.
 *
 * Auth is OPTIONAL: it only activates when both AUTH_USERNAME and
 * AUTH_PASSWORD are set. This keeps local dev open while letting
 * deployments lock the studio behind a simple login.
 *
 * Public-for-email-clients paths (icon + image reads) must stay
 * unauthenticated, otherwise Gmail/Outlook/Roundcube cannot fetch
 * <img> URLs embedded in copied signatures.
 */

export function isAuthEnabled(): boolean {
  return Boolean(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function checkBasicAuth(authHeader: string | null): boolean {
  if (!isAuthEnabled()) return true;
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
    const idx = decoded.indexOf(':');
    if (idx < 0) return false;
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    const expectedUser = process.env.AUTH_USERNAME ?? '';
    const expectedPass = process.env.AUTH_PASSWORD ?? '';
    return (
      timingSafeEqual(user, expectedUser) && timingSafeEqual(pass, expectedPass)
    );
  } catch {
    return false;
  }
}

export function unauthorizedResponse(): Response {
  return new Response('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Email Signature Studio"' },
  });
}

/** Route-handler guard. Returns null when OK, else a 401 Response. */
export function requireAuth(req: Request): Response | null {
  if (!isAuthEnabled()) return null;
  if (checkBasicAuth(req.headers.get('authorization'))) return null;
  return unauthorizedResponse() as unknown as Response;
}

/**
 * True for GETs that email clients must fetch without credentials:
 * dynamic social icons + uploaded image reads (both /api/uploads and
 * static /uploads URLs rewrite to absolute on copy).
 */
export function isPublicImageRead(pathname: string, method: string): boolean {
  if (method !== 'GET') return false;
  return (
    pathname === '/api/icon' ||
    pathname.startsWith('/api/icon/') ||
    pathname === '/api/uploads' ||
    pathname.startsWith('/api/uploads/') ||
    pathname === '/uploads' ||
    pathname.startsWith('/uploads/')
  );
}
