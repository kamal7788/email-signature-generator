'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      router.push(`/companies/${data.slug}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
            ← Companies
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-300 text-sm">New Company</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-indigo-600/20 flex items-center justify-center text-3xl mx-auto mb-4">
              &#127970;
            </div>
            <h1 className="text-2xl font-bold text-white">Create a Company</h1>
            <p className="text-slate-400 mt-2 text-sm">
              A company folder holds all your email signatures for that organization.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
            <div className="mb-5">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                id="name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corporation"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 rounded-lg border border-slate-600 px-4 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating…' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
