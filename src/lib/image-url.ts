/**
 * Google Drive share URL → direct <img>-safe URL.
 *
 * Users paste whatever Drive gives them:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - https://docs.google.com/uc?id=FILE_ID ...
 *
 * Email clients need a plain image URL, so we normalize to:
 *   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
 * which serves the file bytes without the Drive viewer chrome.
 * File must be shared as "Anyone with the link".
 */

export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const u = url.trim();
  if (!/drive\.google\.|docs\.google\.com\/uc/i.test(u)) return null;

  let m = u.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/);
  if (m) return m[1];

  try {
    const parsed = new URL(u);
    const id = parsed.searchParams.get('id');
    if (id && /^[A-Za-z0-9_-]{10,}$/.test(id)) return id;
  } catch {
    // not a parseable URL — fall through
  }
  return null;
}

export function isDriveUrl(url: string): boolean {
  return extractDriveId(url) !== null;
}

export function toDirectImageUrl(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url.trim();
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
}

/** Normalize any user-pasted image URL for storage + rendering. */
export function normalizeImageUrl(url: string): string {
  const t = (url ?? '').trim();
  if (!t) return '';
  if (isDriveUrl(t)) return toDirectImageUrl(t);
  return t;
}
