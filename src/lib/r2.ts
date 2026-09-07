import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

export function isR2Enabled(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

function getClient(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
    forcePathStyle: false,
  });
}

export function getR2PublicBase(): string {
  return (
    process.env.R2_PUBLIC_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    ''
  );
}

export interface MediaItem {
  key: string;
  url: string;
  size: number;
  lastModified: string | null;
  storage: 'r2' | 'local';
}

/**
 * List R2 objects under <companySlug>/, newest first.
 * Public URLs built from the bucket public base (r2.dev / custom domain).
 */
export async function listR2Media(companySlug: string): Promise<MediaItem[]> {
  const base = getR2PublicBase();
  if (!base) throw new Error('R2_PUBLIC_URL or NEXT_PUBLIC_BASE_URL is required.');
  const client = getClient();
  const items: MediaItem[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
        Prefix: `${companySlug}/`,
        ContinuationToken: token,
        MaxKeys: 500,
      })
    );
    for (const o of res.Contents ?? []) {
      if (!o.Key) continue;
      items.push({
        key: o.Key,
        url: `${base}/${o.Key}`,
        size: o.Size ?? 0,
        lastModified: o.LastModified ? o.LastModified.toISOString() : null,
        storage: 'r2',
      });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  items.sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''));
  return items;
}

/** Delete one R2 object. Key must be validated by caller (scoped to company). */
export async function deleteR2Media(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key })
  );
}

// ── Local fallback (public/uploads/<slug>/) ───────────────────────────────

import fs from 'fs';
import path from 'path';

const LOCAL_BASE = path.join(process.cwd(), 'public', 'uploads');
const LOCAL_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

export function listLocalMedia(companySlug: string, baseUrl: string): MediaItem[] {
  const dir = path.join(LOCAL_BASE, companySlug);
  if (!fs.existsSync(dir)) return [];
  const base = baseUrl.replace(/\/$/, '');
  return fs
    .readdirSync(dir)
    .filter((f) => {
      const p = path.join(dir, f);
      return (
        fs.statSync(p).isFile() &&
        LOCAL_EXTS.has(path.extname(f).toLowerCase()) &&
        /^[A-Za-z0-9._-]+$/.test(f)
      );
    })
    .map((f) => {
      const st = fs.statSync(path.join(dir, f));
      return {
        key: `${companySlug}/${f}`,
        url: `${base}/uploads/${companySlug}/${f}`,
        size: st.size,
        lastModified: st.mtime.toISOString(),
        storage: 'local' as const,
      };
    })
    .sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''));
}

export function deleteLocalMedia(companySlug: string, filename: string): boolean {
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return false;
  const p = path.resolve(path.join(LOCAL_BASE, companySlug, filename));
  if (!p.startsWith(path.resolve(LOCAL_BASE) + path.sep)) return false;
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return false;
  if (!LOCAL_EXTS.has(path.extname(p).toLowerCase())) return false;
  fs.unlinkSync(p);
  return true;
}

function sanitizeExt(ext: string): string {
  const e = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(e) ? e : 'jpg';
}

/**
 * Upload buffer to R2 at <companySlug>/<safeName>, return public URL.
 * Requires R2_PUBLIC_URL (custom domain or r2.dev) to build a
 * directly-embeddable https URL for email clients.
 */
export async function uploadToR2(
  bytes: Buffer,
  companySlug: string,
  ext: string,
  contentType: string
): Promise<string> {
  const safeExt = sanitizeExt(ext);
  const key = `${companySlug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  const base = getR2PublicBase();
  if (!base) throw new Error('R2_PUBLIC_URL or NEXT_PUBLIC_BASE_URL is required.');
  // The S3 API endpoint (<account>.r2.cloudflarestorage.com) needs signed
  // requests and never serves objects publicly — catch that misconfig early
  // instead of returning image URLs that 403 everywhere.
  if (/^https:\/\/[0-9a-f]{32}\.r2\.cloudflarestorage\.com\/?$/i.test(base)) {
    throw new Error(
      'R2_PUBLIC_URL must be the bucket public URL (custom domain or https://pub-….r2.dev), not the S3 API endpoint.'
    );
  }
  return `${base}/${key}`;
}
