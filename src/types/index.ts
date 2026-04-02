export type TemplateName =
  | 'corporate-a' | 'corporate-b'
  | 'minimal-a'   | 'minimal-b'
  | 'modern-a'    | 'modern-b'
  // legacy aliases (saved JSON may contain these)
  | 'corporate' | 'minimal' | 'modern';

export type SocialPlatform =
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'github'
  | 'tiktok'
  | 'whatsapp'
  | 'pinterest';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface SignatureColors {
  primary: string;
  secondary: string;
  text: string;
  lightText: string;
  socialIcons: string;
}

export interface SignatureData {
  id: string;
  companyId: string;
  label: string;
  // Personal info
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  // Assets
  logoUrl: string;
  portraitUrl: string;
  showPortrait: boolean;
  // Social links
  socialLinks: SocialLink[];
  // Template
  template: TemplateName;
  // Colors
  colors: SignatureColors;
  // DLP disclaimer (corporate templates)
  dlpDisclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMeta {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Company extends CompanyMeta {
  signatures: SignatureData[];
}

export const DEFAULT_COLORS: SignatureColors = {
  primary: '#4f46e5',
  secondary: '#818cf8',
  text: '#1e293b',
  lightText: '#64748b',
  socialIcons: '#4f46e5',
};

export const DEFAULT_DLP = `This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error please notify the system manager. This message contains confidential information and is intended only for the individual named.`;

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  github: 'GitHub',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  pinterest: 'Pinterest',
};

// kept for any fallback references
export const SOCIAL_ABBR: Record<SocialPlatform, string> = {
  linkedin: 'in',
  twitter: 'X',
  facebook: 'f',
  instagram: 'ig',
  youtube: 'yt',
  github: 'gh',
  tiktok: 'tt',
  whatsapp: 'wa',
  pinterest: 'P',
};

export function isCorporateTemplate(t: TemplateName) {
  return t === 'corporate-a' || t === 'corporate-b' || t === 'corporate';
}
