'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SignatureData,
  SignatureColors,
  SocialLink,
  SocialPlatform,
  TemplateName,
  SOCIAL_PLATFORM_LABELS,
  DEFAULT_COLORS,
  isCorporateTemplate,
} from '@/types';
import { generateSignatureHtml } from '@/lib/signature-html';

type DraftData = Omit<SignatureData, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
    />
  );
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [hex, setHex] = useState(value);
  const focused = useRef(false);

  // Sync hex display when value changes externally (color picker or reset)
  useEffect(() => {
    if (!focused.current) setHex(value);
  }, [value]);

  function handleHexChange(raw: string) {
    setHex(raw);
    const normalized = raw.startsWith('#') ? raw : `#${raw}`;
    // Only propagate when it's a valid 3- or 6-digit hex
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
      onChange(normalized);
    }
  }

  function handleHexBlur() {
    focused.current = false;
    // Snap the field to the last valid value
    setHex(value);
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2">
      <input
        type="color"
        value={value}
        onChange={(e) => { onChange(e.target.value); setHex(e.target.value); }}
        className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
        style={{ background: 'transparent' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide leading-none mb-1">
          {label}
        </p>
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          onFocus={() => { focused.current = true; }}
          onBlur={handleHexBlur}
          maxLength={7}
          spellCheck={false}
          className="w-full bg-transparent text-xs text-slate-300 font-mono focus:outline-none focus:text-white leading-none"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ─── Template Picker ─────────────────────────────────────────────────────────

const TEMPLATE_GROUPS: {
  group: string;
  variants: { id: TemplateName; label: string; description: string }[];
}[] = [
    {
      group: 'Corporate',
      variants: [
        { id: 'corporate-a', label: 'Corporate A', description: 'Top bar · table contact · DLP' },
        { id: 'corporate-b', label: 'Corporate B', description: 'Left bar · contact pills · DLP' },
      ],
    },
    {
      group: 'Minimal',
      variants: [
        { id: 'minimal-a', label: 'Minimal A', description: 'Inline name · bullet contact' },
        { id: 'minimal-b', label: 'Minimal B', description: 'Split columns · vertical accent' },
      ],
    },
    {
      group: 'Modern',
      variants: [
        { id: 'modern-a', label: 'Modern A', description: 'Portrait · vertical accent bar' },
        { id: 'modern-b', label: 'Modern B', description: 'Card · colored left block' },
      ],
    },
  ];

// ─── Social platforms ─────────────────────────────────────────────────────────

const ALL_PLATFORMS = Object.keys(SOCIAL_PLATFORM_LABELS) as SocialPlatform[];

// ─── Main Editor ─────────────────────────────────────────────────────────────

export default function SignatureEditorClient({
  companySlug,
  companyName,
  initialData,
  sigId,
  isNew,
}: {
  companySlug: string;
  companyName: string;
  initialData: DraftData;
  sigId?: string;
  isNew: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftData>(initialData);
  const [activeTab, setActiveTab] = useState<'profile' | 'assets' | 'social' | 'design' | 'disclaimer'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'portrait' | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const portraitFileRef = useRef<HTMLInputElement>(null);

  const update = useCallback((patch: Partial<DraftData>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const updateColor = useCallback((key: keyof SignatureColors, value: string) => {
    setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: value } }));
  }, []);

  async function uploadFile(file: File, type: 'logo' | 'portrait') {
    setUploading(type);
    const form = new FormData();
    form.append('file', file);
    form.append('companySlug', companySlug);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) {
        if (type === 'logo') update({ logoUrl: data.url });
        else update({ portraitUrl: data.url, showPortrait: true });
      }
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const url = isNew
        ? `/api/companies/${companySlug}/signatures`
        : `/api/companies/${companySlug}/signatures/${sigId}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Save failed.');
        return;
      }
      if (isNew) {
        router.push(`/companies/${companySlug}/signatures/${data.id}`);
      }
    } catch {
      setSaveError('Network error.');
    } finally {
      setSaving(false);
    }
  }

  // For the live preview we use relative URLs (works same-origin in the browser).
  const previewHtml = generateSignatureHtml(draft as SignatureData);
  const html = previewHtml;

  // For copying we need absolute URLs so email clients can fetch the images.
  function buildCopyHtml() {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
      window.location.origin;
    return generateSignatureHtml(draft as SignatureData)
      .replace(/src="(\/uploads\/)/g, `src="${base}$1`)
      .replace(/src="(\/api\/icon)/g, `src="${base}$1`);
  }

  async function handleCopy() {
    const copyHtml = buildCopyHtml();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': new Blob([copyHtml], { type: 'text/html' }) }),
      ]);
    } catch {
      await navigator.clipboard.writeText(copyHtml);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'assets' as const, label: 'Assets' },
    { id: 'social' as const, label: 'Social' },
    { id: 'design' as const, label: 'Design' },
    ...(isCorporateTemplate(draft.template) ? [{ id: 'disclaimer' as const, label: 'Disclaimer' }] : []),
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/companies/${companySlug}`}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex-shrink-0"
          >
            ← {companyName}
          </Link>
          <span className="text-slate-700">/</span>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => update({ label: e.target.value })}
            className="bg-transparent text-slate-100 font-semibold text-sm focus:outline-none border-b border-transparent focus:border-indigo-500 min-w-0 max-w-xs truncate py-0.5"
            placeholder="Signature label"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {saveError && (
            <span className="text-xs text-red-400">{saveError}</span>
          )}
          <button
            onClick={handleCopy}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${copied
                ? 'bg-emerald-700 text-emerald-100'
                : 'border border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
          >
            {copied ? '✓ Copied to Clipboard' : 'Copy HTML'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isNew ? 'Save Signature' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Body: editor left, preview right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div className="w-80 xl:w-96 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto flex-shrink-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${activeTab === t.id
                    ? 'text-indigo-400 border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <>
                <Field label="Full Name">
                  <Input
                    value={draft.fullName}
                    onChange={(v) => update({ fullName: v })}
                    placeholder="Jane Smith"
                  />
                </Field>
                <Field label="Job Title">
                  <Input
                    value={draft.jobTitle}
                    onChange={(v) => update({ jobTitle: v })}
                    placeholder="Senior Manager"
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={draft.company}
                    onChange={(v) => update({ company: v })}
                    placeholder="Acme Corp"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={draft.email}
                    onChange={(v) => update({ email: v })}
                    placeholder="jane@acme.com"
                    type="email"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={draft.phone}
                    onChange={(v) => update({ phone: v })}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={draft.website}
                    onChange={(v) => update({ website: v })}
                    placeholder="https://acme.com"
                  />
                </Field>
              </>
            )}

            {/* ASSETS TAB */}
            {activeTab === 'assets' && (
              <>
                <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Company Logo</p>
                  <Field label="Logo URL">
                    <Input
                      value={draft.logoUrl}
                      onChange={(v) => update({ logoUrl: v })}
                      placeholder="https://example.com/logo.png"
                    />
                  </Field>
                  <p className="text-slate-500 text-xs text-center">— or —</p>
                  <button
                    onClick={() => logoFileRef.current?.click()}
                    disabled={uploading === 'logo'}
                    className="w-full rounded-lg border-2 border-dashed border-slate-600 py-3 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                  >
                    {uploading === 'logo' ? 'Uploading…' : '+ Upload Logo'}
                  </button>
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo')}
                  />
                  {draft.logoUrl && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-2">
                      <img
                        src={draft.logoUrl}
                        alt="Logo preview"
                        className="h-8 max-w-[80px] object-contain"
                      />
                      <button
                        onClick={() => update({ logoUrl: '' })}
                        className="ml-auto text-red-400 text-xs hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Portrait Photo</p>
                  <Field label="Portrait URL">
                    <Input
                      value={draft.portraitUrl}
                      onChange={(v) => update({ portraitUrl: v })}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </Field>
                  <p className="text-slate-500 text-xs text-center">— or —</p>
                  <button
                    onClick={() => portraitFileRef.current?.click()}
                    disabled={uploading === 'portrait'}
                    className="w-full rounded-lg border-2 border-dashed border-slate-600 py-3 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                  >
                    {uploading === 'portrait' ? 'Uploading…' : '+ Upload Portrait'}
                  </button>
                  <input
                    ref={portraitFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'portrait')}
                  />
                  {draft.portraitUrl && (
                    <div className="flex items-center gap-3 rounded-lg bg-slate-900 p-2">
                      <img
                        src={draft.portraitUrl}
                        alt="Portrait preview"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draft.showPortrait}
                            onChange={(e) => update({ showPortrait: e.target.checked })}
                            className="rounded accent-indigo-500"
                          />
                          <span className="text-xs text-slate-300">Show in signature</span>
                        </label>
                      </div>
                      <button
                        onClick={() => update({ portraitUrl: '', showPortrait: false })}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* SOCIAL TAB */}
            {activeTab === 'social' && (
              <SocialLinksEditor
                links={draft.socialLinks}
                onChange={(links) => update({ socialLinks: links })}
              />
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <>
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Template</p>
                <div className="space-y-3">
                  {TEMPLATE_GROUPS.map((group) => (
                    <div key={group.group}>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">
                        {group.group}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.variants.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => update({ template: t.id })}
                            className={`rounded-lg border p-2.5 text-left transition-colors ${draft.template === t.id
                                ? 'border-indigo-500 bg-indigo-900/30'
                                : 'border-slate-700 hover:border-slate-500'
                              }`}
                          >
                            <p className="text-xs font-semibold text-slate-200 leading-tight">{t.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-700" />
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Colors</p>
                <div className="grid grid-cols-2 gap-2">
                  <ColorSwatch label="Primary" value={draft.colors.primary} onChange={(v) => updateColor('primary', v)} />
                  <ColorSwatch label="Secondary" value={draft.colors.secondary} onChange={(v) => updateColor('secondary', v)} />
                  <ColorSwatch label="Body Text" value={draft.colors.text} onChange={(v) => updateColor('text', v)} />
                  <ColorSwatch label="Light Text" value={draft.colors.lightText} onChange={(v) => updateColor('lightText', v)} />
                  <ColorSwatch label="Social Icons" value={draft.colors.socialIcons} onChange={(v) => updateColor('socialIcons', v)} />
                </div>
                <button
                  onClick={() => setDraft((d) => ({ ...d, colors: DEFAULT_COLORS }))}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Reset to defaults
                </button>
              </>
            )}

            {/* DISCLAIMER TAB (corporate only) */}
            {activeTab === 'disclaimer' && (
              <>
                <p className="text-xs text-slate-500 mb-2">
                  This text appears at the bottom of your corporate signature.
                </p>
                <Field label="DLP Disclaimer">
                  <Textarea
                    value={draft.dlpDisclaimer}
                    onChange={(v) => update({ dlpDisclaimer: v })}
                    placeholder="This email and any files transmitted with it are confidential…"
                    rows={6}
                  />
                </Field>
                <button
                  onClick={() => update({ dlpDisclaimer: '' })}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Clear disclaimer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/30">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-shrink-0">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Live Preview</span>
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8">
            {/* Email mock */}
            <div className="max-w-2xl mx-auto rounded-xl border border-slate-700 bg-white shadow-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-slate-500 w-6">To</span>
                  <span className="text-xs text-slate-700 bg-white rounded px-2 py-0.5 border border-slate-200">recipient@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-6">Subject</span>
                  <span className="text-xs text-slate-600">Your email subject</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">Hi there,</p>
                <p className="text-sm text-slate-600 mb-4">
                  This is a preview of what your email will look like with the signature below.
                </p>
                <hr className="border-slate-200 my-4" />
                <div
                  dangerouslySetInnerHTML={{ __html: html }}
                  className="signature-preview"
                />
              </div>
            </div>

            {/* HTML source toggle */}
            <details className="max-w-2xl mx-auto mt-4">
              <summary className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer select-none">
                View HTML source
              </summary>
              <pre className="mt-2 rounded-lg bg-slate-800 border border-slate-700 p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed">
                {html}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Social Links Editor ──────────────────────────────────────────────────────

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  const [adding, setAdding] = useState<SocialPlatform>('linkedin');
  const [url, setUrl] = useState('');

  const available = ALL_PLATFORMS.filter(
    (p) => !links.some((l) => l.platform === p)
  );

  function addLink() {
    if (!url.trim()) return;
    onChange([...links, { platform: adding, url: url.trim() }]);
    setUrl('');
    const next = available.find((p) => p !== adding);
    if (next) setAdding(next);
  }

  function removeLink(platform: SocialPlatform) {
    onChange(links.filter((l) => l.platform !== platform));
  }

  function updateUrl(platform: SocialPlatform, newUrl: string) {
    onChange(links.map((l) => (l.platform === platform ? { ...l, url: newUrl } : l)));
  }

  return (
    <div className="space-y-3">
      {links.map((l) => (
        <div key={l.platform} className="flex gap-2 items-center">
          <span className="text-xs font-medium text-slate-400 w-20 flex-shrink-0">
            {SOCIAL_PLATFORM_LABELS[l.platform]}
          </span>
          <input
            type="url"
            value={l.url}
            onChange={(e) => updateUrl(l.platform, e.target.value)}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            placeholder="https://..."
          />
          <button
            onClick={() => removeLink(l.platform)}
            className="text-red-400 text-sm hover:text-red-300 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {available.length > 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 p-3 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Add Social Link</p>
          <div className="flex gap-2">
            <select
              value={adding}
              onChange={(e) => setAdding(e.target.value as SocialPlatform)}
              className="rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {available.map((p) => (
                <option key={p} value={p}>
                  {SOCIAL_PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={addLink}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {links.length === 0 && available.length === ALL_PLATFORMS.length && (
        <p className="text-xs text-slate-600 text-center py-4">No social links added yet.</p>
      )}
    </div>
  );
}
