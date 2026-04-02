import { notFound } from 'next/navigation';
import { getCompany, getSignature } from '@/lib/storage';
import SignatureEditorClient from './SignatureEditorClient';

export const dynamic = 'force-dynamic';

export default async function EditSignaturePage({
  params,
}: {
  params: Promise<{ companySlug: string; sigId: string }>;
}) {
  const { companySlug, sigId } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const sig = getSignature(companySlug, sigId);
  if (!sig) notFound();

  return (
    <SignatureEditorClient
      companySlug={company.slug}
      companyName={company.name}
      initialData={sig}
      sigId={sig.id}
      isNew={false}
    />
  );
}
