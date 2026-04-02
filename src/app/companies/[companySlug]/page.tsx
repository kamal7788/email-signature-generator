import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompany } from '@/lib/storage';
import CompanyDashboardClient from './CompanyDashboardClient';

export const dynamic = 'force-dynamic';

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
              ← Companies
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-100 font-semibold">{company.name}</span>
          </div>
          <Link
            href={`/companies/${company.slug}/signatures/new`}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Signature
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <CompanyDashboardClient
          company={company}
          initialSignatures={company.signatures}
        />
      </main>
    </div>
  );
}
