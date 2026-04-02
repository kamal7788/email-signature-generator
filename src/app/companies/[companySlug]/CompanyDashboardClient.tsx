'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Company, SignatureData } from '@/types';
import { generateSignatureHtml } from '@/lib/signature-html';

const TEMPLATE_LABELS: Record<string, string> = {
  'corporate-a': 'Corporate A', 'corporate-b': 'Corporate B', corporate: 'Corporate',
  'minimal-a': 'Minimal A', 'minimal-b': 'Minimal B', minimal: 'Minimal',
  'modern-a': 'Modern A', 'modern-b': 'Modern B', modern: 'Modern',
};
const TEMPLATE_COLORS: Record<string, string> = {
  'corporate-a': 'bg-blue-900/50 text-blue-300 border-blue-700',
  'corporate-b': 'bg-blue-900/50 text-blue-300 border-blue-700',
  corporate: 'bg-blue-900/50 text-blue-300 border-blue-700',
  'minimal-a': 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  'minimal-b': 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  minimal: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  'modern-a': 'bg-purple-900/50 text-purple-300 border-purple-700',
  'modern-b': 'bg-purple-900/50 text-purple-300 border-purple-700',
  modern: 'bg-purple-900/50 text-purple-300 border-purple-700',
};

function SignatureCard({
  sig,
  companySlug,
  onDuplicate,
  onDelete,
}: {
  sig: SignatureData;
  companySlug: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    setCopying(true);
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      window.location.origin;
    const html = generateSignatureHtml(sig).replace(
      /src="(\/uploads\/)/g,
      `src="${base}$1`
    );
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: copy as plain text
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden hover:border-slate-600 transition-colors">
      {/* Preview strip */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: sig.colors.primary }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm leading-tight">{sig.label}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{sig.fullName} · {sig.jobTitle}</p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TEMPLATE_COLORS[sig.template]}`}
          >
            {TEMPLATE_LABELS[sig.template]}
          </span>
        </div>

        {/* Mini preview */}
        <div className="rounded-lg border border-slate-700 bg-white p-3 mb-4 overflow-hidden max-h-28">
          <div
            className="pointer-events-none"
            style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '166%' }}
            dangerouslySetInnerHTML={{ __html: generateSignatureHtml(sig) }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={copying}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              copied
                ? 'bg-emerald-700 text-emerald-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {copied ? '✓ Copied!' : copying ? 'Copying…' : 'Copy HTML'}
          </button>
          <Link
            href={`/companies/${companySlug}/signatures/${sig.id}`}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDuplicate(sig.id)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            title="Duplicate"
          >
            ⧉
          </button>
          <button
            onClick={() => onDelete(sig.id)}
            className="rounded-lg border border-red-900/50 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDashboardClient({
  company,
  initialSignatures,
}: {
  company: Company;
  initialSignatures: SignatureData[];
}) {
  const router = useRouter();
  const [signatures, setSignatures] = useState<SignatureData[]>(initialSignatures);

  const handleDuplicate = useCallback(
    async (sigId: string) => {
      const res = await fetch(
        `/api/companies/${company.slug}/signatures/${sigId}/duplicate`,
        { method: 'POST' }
      );
      if (res.ok) {
        const dup = await res.json();
        setSignatures((prev) => [dup, ...prev]);
      }
    },
    [company.slug]
  );

  const handleDelete = useCallback(
    async (sigId: string) => {
      if (!confirm('Delete this signature? This cannot be undone.')) return;
      const res = await fetch(
        `/api/companies/${company.slug}/signatures/${sigId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setSignatures((prev) => prev.filter((s) => s.id !== sigId));
      }
    },
    [company.slug]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{company.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {signatures.length} {signatures.length === 1 ? 'signature' : 'signatures'}
          </p>
        </div>
      </div>

      {signatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">✍️</div>
          <h2 className="text-xl font-semibold text-slate-300 mb-2">No signatures yet</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Create your first signature for {company.name}.
          </p>
          <Link
            href={`/companies/${company.slug}/signatures/new`}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Create Signature
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {signatures.map((sig) => (
            <SignatureCard
              key={sig.id}
              sig={sig}
              companySlug={company.slug}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
          <Link
            href={`/companies/${company.slug}/signatures/new`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-6 text-slate-600 hover:border-indigo-500 hover:text-indigo-400 transition-all min-h-[200px]"
          >
            <span className="text-3xl mb-2">+</span>
            <span className="text-sm font-medium">New Signature</span>
          </Link>
        </div>
      )}
    </>
  );
}
