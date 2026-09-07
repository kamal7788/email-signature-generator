import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CompanyMeta, Company, SignatureData } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data', 'companies');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'company';
}

function findUniqueSlug(base: string): string {
  const root = base || 'company';
  if (!fs.existsSync(companyDir(root))) return root;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${root}-${i}`;
    if (!fs.existsSync(companyDir(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function companyDir(slug: string) {
  return path.join(DATA_DIR, slug);
}

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9-]{1,80}$/.test(slug);
}

function assertSafeSlug(slug: string): void {
  if (!isSafeSlug(slug)) throw new Error(`Invalid company slug "${slug}".`);
}

function signaturesDir(slug: string) {
  return path.join(DATA_DIR, slug, 'signatures');
}

// ── Companies ────────────────────────────────────────────────────────────────

export function createCompany(name: string): CompanyMeta {
  ensureDir(DATA_DIR);
  // Auto-suffix on collision (acme, acme-2, acme-3…) instead of throwing 409.
  const slug = findUniqueSlug(slugify(name));
  const dir = companyDir(slug);
  ensureDir(dir);
  ensureDir(signaturesDir(slug));

  const meta: CompanyMeta = {
    id: slug,
    name,
    slug,
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
  return meta;
}

export function listCompanies(): CompanyMeta[] {
  ensureDir(DATA_DIR);
  return fs
    .readdirSync(DATA_DIR)
    .map((dir) => {
      const p = path.join(DATA_DIR, dir, 'meta.json');
      return fs.existsSync(p)
        ? (JSON.parse(fs.readFileSync(p, 'utf-8')) as CompanyMeta)
        : null;
    })
    .filter(Boolean) as CompanyMeta[];
}

export function getCompany(slug: string): Company | null {
  if (!isSafeSlug(slug)) return null;
  const p = path.join(companyDir(slug), 'meta.json');
  if (!fs.existsSync(p)) return null;
  const meta = JSON.parse(fs.readFileSync(p, 'utf-8')) as CompanyMeta;
  return { ...meta, signatures: listSignatures(slug) };
}

export function deleteCompany(slug: string): boolean {
  if (!isSafeSlug(slug)) return false;
  const dir = companyDir(slug);
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

// ── Signatures ────────────────────────────────────────────────────────────────

export function createSignature(
  companySlug: string,
  data: Omit<SignatureData, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
): SignatureData {
  assertSafeSlug(companySlug);
  ensureDir(signaturesDir(companySlug));
  const id = uuidv4();
  const sig: SignatureData = {
    ...data,
    id,
    companyId: companySlug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(signaturesDir(companySlug), `${id}.json`),
    JSON.stringify(sig, null, 2)
  );
  return sig;
}

export function listSignatures(companySlug: string): SignatureData[] {
  if (!isSafeSlug(companySlug)) return [];
  const dir = signaturesDir(companySlug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) =>
      JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as SignatureData
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getSignature(
  companySlug: string,
  sigId: string
): SignatureData | null {
  if (!isSafeSlug(companySlug)) return null;
  if (!/^[A-Za-z0-9-]{1,80}$/.test(sigId)) return null;
  const p = path.join(signaturesDir(companySlug), `${sigId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as SignatureData;
}

export function updateSignature(
  companySlug: string,
  sigId: string,
  data: Partial<SignatureData>
): SignatureData | null {
  const existing = getSignature(companySlug, sigId);
  if (!existing) return null;
  const updated: SignatureData = {
    ...existing,
    ...data,
    id: existing.id,
    companyId: existing.companyId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(signaturesDir(companySlug), `${sigId}.json`),
    JSON.stringify(updated, null, 2)
  );
  return updated;
}

export function deleteSignature(companySlug: string, sigId: string): boolean {
  if (!isSafeSlug(companySlug)) return false;
  if (!/^[A-Za-z0-9-]{1,80}$/.test(sigId)) return false;
  const p = path.join(signaturesDir(companySlug), `${sigId}.json`);
  if (!fs.existsSync(p)) return false;
  fs.unlinkSync(p);
  return true;
}

export function duplicateSignature(
  companySlug: string,
  sigId: string
): SignatureData | null {
  const original = getSignature(companySlug, sigId);
  if (!original) return null;
  const { id, createdAt, updatedAt, label, ...rest } = original;
  return createSignature(companySlug, { ...rest, label: `${label} (Copy)` });
}
