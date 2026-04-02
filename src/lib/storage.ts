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
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function companyDir(slug: string) {
  return path.join(DATA_DIR, slug);
}

function signaturesDir(slug: string) {
  return path.join(DATA_DIR, slug, 'signatures');
}

// ── Companies ────────────────────────────────────────────────────────────────

export function createCompany(name: string): CompanyMeta {
  ensureDir(DATA_DIR);
  const slug = slugify(name);
  const dir = companyDir(slug);
  if (fs.existsSync(dir)) {
    throw new Error(`A company with slug "${slug}" already exists.`);
  }
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
  const p = path.join(companyDir(slug), 'meta.json');
  if (!fs.existsSync(p)) return null;
  const meta = JSON.parse(fs.readFileSync(p, 'utf-8')) as CompanyMeta;
  return { ...meta, signatures: listSignatures(slug) };
}

export function deleteCompany(slug: string): boolean {
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
