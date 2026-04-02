import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Email Signature Generator',
  description: 'Create and manage professional email signatures for your team.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f172a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
