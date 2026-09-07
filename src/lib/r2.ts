import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
  return `${base}/${key}`;
}
