import { notFound } from 'next/navigation';
import { getCompany } from '@/lib/storage';
import SignatureEditorClient from '../[sigId]/SignatureEditorClient';
import { DEFAULT_COLORS, DEFAULT_DLP, SignatureData } from '@/types';

export const dynamic = 'force-dynamic';

export default async function NewSignaturePage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = getCompany(companySlug);
  if (!company) notFound();

  const blank: Omit<SignatureData, 'id' | 'companyId' | 'createdAt' | 'updatedAt'> = {
    label: 'New Signature',
    fullName: '',
    jobTitle: '',
    company: company.name,
    email: '',
    phone: '',
    website: '',
    logoUrl: '',
    portraitUrl: '',
    showPortrait: false,
    socialLinks: [],
    template: 'corporate-a',
    colors: DEFAULT_COLORS,
    dlpDisclaimer: DEFAULT_DLP,
  };

  return (
    <SignatureEditorClient
      companySlug={company.slug}
      companyName={company.name}
      initialData={blank}
      isNew
    />
  );
}
