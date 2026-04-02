import Link from 'next/link';
import { listCompanies } from '@/lib/storage';
import { CompanyMeta } from '@/types';

export const dynamic = 'force-dynamic';

function CompanyCard({ company }: { company: CompanyMeta }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group block rounded-xl border border-slate-700 bg-slate-800 p-6 hover:border-indigo-500 hover:bg-slate-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-3">
            {company.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
            {company.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Created {new Date(company.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-slate-600 group-hover:text-indigo-400 transition-colors text-xl">›</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const companies = listCompanies();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-indigo-400">&#9993;</span> Signature Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Email Signature Generator</p>
          </div>
          <Link
            href="/companies/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Company
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl mb-6">
              &#9993;
            </div>
            <h2 className="text-2xl font-semibold text-slate-200 mb-2">No companies yet</h2>
            <p className="text-slate-500 mb-8 max-w-md">
              Create your first company to start building email signatures for your team.
            </p>
            <Link
              href="/companies/new"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Create your first company
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-100">Companies</h2>
              <span className="text-sm text-slate-500">{companies.length} {companies.length === 1 ? 'company' : 'companies'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
              <Link
                href="/companies/new"
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-6 text-slate-600 hover:border-indigo-500 hover:text-indigo-400 transition-all min-h-[140px]"
              >
                <span className="text-3xl mb-2">+</span>
                <span className="text-sm font-medium">Add Company</span>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
