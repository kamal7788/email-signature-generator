import { SignatureData, SocialPlatform } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── SVG icon paths (Simple Icons — MIT licence) ───────────────────────────────

const SOCIAL_PATHS: Record<SocialPlatform, string> = {
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  twitter:
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  youtube:
    'M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  pinterest:
    'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z',
};

/**
 * Renders a social icon as a data-URI SVG <img> wrapped in an <a>.
 * Works in Gmail, Apple Mail, and most modern email clients.
 * shape: 'rounded' = rounded square, 'circle' = full circle
 */
function socialIcon(
  platform: SocialPlatform,
  url: string,
  color: string,
  size = 28,
  shape: 'rounded' | 'circle' = 'rounded'
): string {
  const path = SOCIAL_PATHS[platform] ?? '';
  const pad = Math.round(size * 0.22);
  const inner = size - pad * 2;
  const rx = shape === 'circle' ? size / 2 : Math.round(size * 0.22);
  // Wrap icon path in a nested <svg> so its viewBox maps correctly
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${rx}" fill="${color}"/><svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 24 24" fill="white"><path d="${path}"/></svg></svg>`;
  const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return `<a href="${esc(url)}" target="_blank" style="display:inline-block;text-decoration:none;margin-right:6px;vertical-align:middle;line-height:0;"><img src="${uri}" width="${size}" height="${size}" alt="${platform}" style="display:block;" /></a>`;
}

// ── Corporate A — classic top-bar layout ──────────────────────────────────────

function corporateAHtml(sig: SignatureData): string {
  const c = sig.colors;
  const hasPortrait = sig.showPortrait && !!sig.portraitUrl;
  const cols = 2 + (sig.logoUrl ? 1 : 0);

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:560px;border-collapse:collapse;">
  <tr>
    <td colspan="${cols}" style="background-color:${esc(c.primary)};height:5px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:16px 12px 12px 0;vertical-align:middle;white-space:nowrap;">${hasPortrait ? `<img src="${esc(sig.portraitUrl)}" width="68" height="68" style="border-radius:50%;display:block;object-fit:cover;border:3px solid ${esc(c.primary)};" alt="${esc(sig.fullName)}" />` : ''}</td>
    <td style="padding:16px 12px 12px;vertical-align:top;">
      <p style="margin:0;padding:0;font-size:18px;font-weight:bold;color:${esc(c.text)};line-height:1.2;">${esc(sig.fullName)}</p>
      <p style="margin:3px 0 0;padding:0;font-size:13px;color:${esc(c.lightText)};line-height:1.3;">${esc(sig.jobTitle)}</p>
      <p style="margin:2px 0 0;padding:0;font-size:13px;font-weight:bold;color:${esc(c.primary)};line-height:1.3;">${esc(sig.company)}</p>
    </td>${sig.logoUrl ? `\n    <td style="padding:16px 0 12px 12px;vertical-align:top;text-align:right;"><img src="${esc(sig.logoUrl)}" height="52" style="max-height:52px;max-width:130px;display:block;" alt="${esc(sig.company)}" /></td>` : ''}
  </tr>
  <tr>
    <td colspan="${cols}" style="padding:0;border-top:2px solid ${esc(c.primary)};font-size:0;line-height:0;">&nbsp;</td>
  </tr>
  <tr>
    <td colspan="${cols}" style="padding:10px 0 6px;">
      <table cellpadding="0" cellspacing="0" border="0">
        ${sig.email ? `<tr><td style="padding:2px 14px 2px 0;font-size:12px;color:${esc(c.lightText)};white-space:nowrap;">Email&nbsp;</td><td style="padding:2px 0;font-size:12px;"><a href="mailto:${esc(sig.email)}" style="color:${esc(c.primary)};text-decoration:none;">${esc(sig.email)}</a></td></tr>` : ''}
        ${sig.phone ? `<tr><td style="padding:2px 14px 2px 0;font-size:12px;color:${esc(c.lightText)};white-space:nowrap;">Tel&nbsp;</td><td style="padding:2px 0;font-size:12px;color:${esc(c.text)};">${esc(sig.phone)}</td></tr>` : ''}
        ${sig.website ? `<tr><td style="padding:2px 14px 2px 0;font-size:12px;color:${esc(c.lightText)};white-space:nowrap;">Web&nbsp;</td><td style="padding:2px 0;font-size:12px;"><a href="${esc(sig.website)}" target="_blank" style="color:${esc(c.primary)};text-decoration:none;">${esc(sig.website)}</a></td></tr>` : ''}
      </table>
    </td>
  </tr>${sig.socialLinks.length > 0 ? `\n  <tr>\n    <td colspan="${cols}" style="padding:8px 0;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons)).join('')}</td>\n  </tr>` : ''}${sig.dlpDisclaimer ? `\n  <tr>\n    <td colspan="${cols}" style="padding:12px 0 0;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;line-height:1.5;font-style:italic;">${esc(sig.dlpDisclaimer)}</td>\n  </tr>` : ''}
</table>`;
}

// ── Corporate B — left accent bar + contact pills ─────────────────────────────

function corporateBHtml(sig: SignatureData): string {
  const c = sig.colors;
  const hasPortrait = sig.showPortrait && !!sig.portraitUrl;
  const chipStyle = `display:inline-block;border:1px solid ${esc(c.primary)};border-radius:20px;padding:4px 12px;font-size:11px;text-decoration:none;margin:0 5px 5px 0;font-family:Arial,Helvetica,sans-serif;`;

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:560px;border-collapse:collapse;">
  <tr>
    <td style="background-color:${esc(c.primary)};width:6px;padding:0;font-size:0;line-height:0;" rowspan="5">&nbsp;</td>
    <td style="padding:16px 16px 10px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>
          ${hasPortrait ? `<td style="padding:0 14px 0 0;vertical-align:middle;"><img src="${esc(sig.portraitUrl)}" width="64" height="64" style="border-radius:50%;display:block;object-fit:cover;" alt="${esc(sig.fullName)}" /></td>` : ''}
          <td style="vertical-align:top;">
            <p style="margin:0;padding:0;font-size:19px;font-weight:bold;color:${esc(c.text)};line-height:1.2;">${esc(sig.fullName)}</p>
            <p style="margin:3px 0 0;padding:0;font-size:13px;color:${esc(c.lightText)};line-height:1.4;">${esc(sig.jobTitle)}${sig.jobTitle && sig.company ? `<span style="color:${esc(c.primary)};"> &bull; </span>` : ''}<span style="color:${esc(c.primary)};font-weight:600;">${esc(sig.company)}</span></p>
          </td>
          ${sig.logoUrl ? `<td style="vertical-align:top;text-align:right;padding-left:16px;"><img src="${esc(sig.logoUrl)}" height="48" style="max-height:48px;max-width:120px;display:block;" alt="${esc(sig.company)}" /></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 16px;border-top:1px solid #e2e8f0;font-size:0;line-height:0;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:10px 16px 6px;">
      ${sig.email ? `<a href="mailto:${esc(sig.email)}" style="${chipStyle}color:${esc(c.primary)};">&#9993;&nbsp;${esc(sig.email)}</a>` : ''}${sig.phone ? `<a href="tel:${esc(sig.phone)}" style="${chipStyle}color:${esc(c.lightText)};">&#9990;&nbsp;${esc(sig.phone)}</a>` : ''}${sig.website ? `<a href="${esc(sig.website)}" target="_blank" style="${chipStyle}color:${esc(c.lightText)};">&#127760;&nbsp;${esc(sig.website)}</a>` : ''}
    </td>
  </tr>${sig.socialLinks.length > 0 ? `\n  <tr>\n    <td style="padding:2px 16px 12px;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons, 26, 'circle')).join('')}</td>\n  </tr>` : `\n  <tr><td style="padding:0 16px 12px;font-size:0;">&nbsp;</td></tr>`}${sig.dlpDisclaimer ? `\n  <tr>\n    <td colspan="2" style="padding:10px 0 0 22px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;line-height:1.5;font-style:italic;">${esc(sig.dlpDisclaimer)}</td>\n  </tr>` : `\n  <tr><td style="padding:0;font-size:0;">&nbsp;</td></tr>`}
</table>`;
}

// ── Minimal A — classic inline text ──────────────────────────────────────────

function minimalAHtml(sig: SignatureData): string {
  const c = sig.colors;
  const nameLine = [sig.fullName, sig.jobTitle, sig.company]
    .filter(Boolean)
    .map(esc)
    .join(' <span style="color:#94a3b8;">&nbsp;|&nbsp;</span> ');

  const contact = [
    sig.email ? `<a href="mailto:${esc(sig.email)}" style="color:${esc(c.primary)};text-decoration:none;">${esc(sig.email)}</a>` : '',
    sig.phone ? `<span style="color:${esc(c.text)};">${esc(sig.phone)}</span>` : '',
    sig.website ? `<a href="${esc(sig.website)}" target="_blank" style="color:${esc(c.primary)};text-decoration:none;">${esc(sig.website)}</a>` : '',
  ]
    .filter(Boolean)
    .join(' <span style="color:#94a3b8;">&nbsp;&bull;&nbsp;</span> ');

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:500px;border-collapse:collapse;">
  <tr>
    <td style="padding:0 0 8px;font-size:15px;font-weight:bold;color:${esc(c.text)};">${nameLine}</td>
  </tr>
  <tr>
    <td style="padding:0;border-bottom:2px solid ${esc(c.primary)};height:0;font-size:0;line-height:0;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:8px 0 6px;font-size:12px;">${contact}</td>
  </tr>${sig.socialLinks.length > 0 ? `\n  <tr>\n    <td style="padding:6px 0 4px;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons)).join('')}</td>\n  </tr>` : ''}${sig.logoUrl ? `\n  <tr>\n    <td style="padding:10px 0 0;"><img src="${esc(sig.logoUrl)}" height="36" style="max-height:36px;max-width:110px;display:block;" alt="${esc(sig.company)}" /></td>\n  </tr>` : ''}
</table>`;
}

// ── Minimal B — two-column split: identity left | contact right ───────────────

function minimalBHtml(sig: SignatureData): string {
  const c = sig.colors;
  const cols = 2 + (sig.logoUrl ? 1 : 0);

  const contactRows = [
    sig.email ? `<tr><td style="padding:2px 0;font-size:12px;"><a href="mailto:${esc(sig.email)}" style="color:${esc(c.primary)};text-decoration:none;">${esc(sig.email)}</a></td></tr>` : '',
    sig.phone ? `<tr><td style="padding:2px 0;font-size:12px;color:${esc(c.text)};">${esc(sig.phone)}</td></tr>` : '',
    sig.website ? `<tr><td style="padding:2px 0;font-size:12px;"><a href="${esc(sig.website)}" target="_blank" style="color:${esc(c.lightText)};text-decoration:none;">${esc(sig.website)}</a></td></tr>` : '',
  ].filter(Boolean).join('');

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:540px;border-collapse:collapse;">
  <tr>
    <td style="padding:0 18px 0 0;vertical-align:top;border-right:3px solid ${esc(c.primary)};white-space:nowrap;">
      <p style="margin:0;padding:0;font-size:17px;font-weight:bold;color:${esc(c.text)};line-height:1.2;">${esc(sig.fullName)}</p>
      ${sig.jobTitle ? `<p style="margin:3px 0 0;padding:0;font-size:12px;color:${esc(c.lightText)};line-height:1.3;">${esc(sig.jobTitle)}</p>` : ''}
      ${sig.company ? `<p style="margin:2px 0 0;padding:0;font-size:12px;font-weight:700;color:${esc(c.primary)};line-height:1.3;">${esc(sig.company)}</p>` : ''}
    </td>
    <td style="padding:0 0 0 18px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">${contactRows}</table>
    </td>${sig.logoUrl ? `\n    <td style="padding:0 0 0 20px;vertical-align:top;text-align:right;"><img src="${esc(sig.logoUrl)}" height="44" style="max-height:44px;max-width:110px;display:block;" alt="${esc(sig.company)}" /></td>` : ''}
  </tr>${sig.socialLinks.length > 0 ? `\n  <tr>\n    <td colspan="${cols}" style="padding:10px 0 0;border-top:1px solid #e2e8f0;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons)).join('')}</td>\n  </tr>` : ''}
</table>`;
}

// ── Modern A — portrait + vertical accent bar ─────────────────────────────────

function modernAHtml(sig: SignatureData): string {
  const c = sig.colors;
  const hasPortrait = sig.showPortrait && !!sig.portraitUrl;
  const totalCols = (hasPortrait ? 1 : 0) + 2 + (sig.logoUrl ? 1 : 0);

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:560px;border-collapse:collapse;">
  <tr>${hasPortrait ? `\n    <td style="padding:0 16px 0 0;vertical-align:top;"><img src="${esc(sig.portraitUrl)}" width="84" height="84" style="border-radius:50%;display:block;object-fit:cover;border:3px solid ${esc(c.primary)};" alt="${esc(sig.fullName)}" /></td>` : ''}
    <td style="width:4px;background-color:${esc(c.primary)};padding:0;vertical-align:stretch;">&nbsp;</td>
    <td style="padding:0 0 0 16px;vertical-align:top;min-width:200px;">
      <p style="margin:0;padding:0;font-size:20px;font-weight:bold;color:${esc(c.text)};line-height:1.2;">${esc(sig.fullName)}</p>
      <p style="margin:3px 0 0;padding:0;font-size:11px;color:${esc(c.lightText)};text-transform:uppercase;letter-spacing:0.8px;">${esc(sig.jobTitle)}</p>
      <p style="margin:2px 0 10px;padding:0;font-size:12px;font-weight:bold;color:${esc(c.primary)};">${esc(sig.company)}</p>
      <table cellpadding="0" cellspacing="0" border="0">
        ${sig.email ? `<tr><td style="padding:1px 10px 1px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#9993;</td><td style="padding:1px 0;font-size:12px;"><a href="mailto:${esc(sig.email)}" style="color:${esc(c.text)};text-decoration:none;">${esc(sig.email)}</a></td></tr>` : ''}
        ${sig.phone ? `<tr><td style="padding:1px 10px 1px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#9990;</td><td style="padding:1px 0;font-size:12px;color:${esc(c.text)};">${esc(sig.phone)}</td></tr>` : ''}
        ${sig.website ? `<tr><td style="padding:1px 10px 1px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#127760;</td><td style="padding:1px 0;font-size:12px;"><a href="${esc(sig.website)}" target="_blank" style="color:${esc(c.text)};text-decoration:none;">${esc(sig.website)}</a></td></tr>` : ''}
      </table>
    </td>${sig.logoUrl ? `\n    <td style="padding:0 0 0 20px;vertical-align:middle;text-align:right;"><img src="${esc(sig.logoUrl)}" height="52" style="max-height:52px;max-width:130px;display:block;" alt="${esc(sig.company)}" /></td>` : ''}
  </tr>${sig.socialLinks.length > 0 ? `\n  <tr>\n    <td colspan="${totalCols}" style="padding:12px 0 0;border-top:1px solid #e2e8f0;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons)).join('')}</td>\n  </tr>` : ''}
</table>`;
}

// ── Modern B — card: colored left block with portrait + name ──────────────────

function modernBHtml(sig: SignatureData): string {
  const c = sig.colors;
  const hasPortrait = sig.showPortrait && !!sig.portraitUrl;

  const contactRows = [
    sig.email ? `<tr><td style="padding:2px 10px 2px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#9993;</td><td style="padding:2px 0;font-size:12px;"><a href="mailto:${esc(sig.email)}" style="color:${esc(c.text)};text-decoration:none;">${esc(sig.email)}</a></td></tr>` : '',
    sig.phone ? `<tr><td style="padding:2px 10px 2px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#9990;</td><td style="padding:2px 0;font-size:12px;color:${esc(c.text)};">${esc(sig.phone)}</td></tr>` : '',
    sig.website ? `<tr><td style="padding:2px 10px 2px 0;font-size:16px;color:${esc(c.primary)};vertical-align:middle;">&#127760;</td><td style="padding:2px 0;font-size:12px;"><a href="${esc(sig.website)}" target="_blank" style="color:${esc(c.text)};text-decoration:none;">${esc(sig.website)}</a></td></tr>` : '',
  ].filter(Boolean).join('');

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;max-width:560px;border-collapse:collapse;">
  <tr>
    <!-- Left colored block -->
    <td style="background-color:${esc(c.primary)};padding:20px 18px;vertical-align:middle;text-align:center;width:148px;">
      ${hasPortrait ? `<img src="${esc(sig.portraitUrl)}" width="72" height="72" style="border-radius:50%;display:block;margin:0 auto;object-fit:cover;border:3px solid rgba(255,255,255,0.4);" alt="${esc(sig.fullName)}" />` : ''}
      <p style="margin:${hasPortrait ? '10px' : '0'} 0 0;padding:0;font-size:15px;font-weight:bold;color:#ffffff;line-height:1.2;word-break:break-word;">${esc(sig.fullName)}</p>
      <p style="margin:3px 0 0;padding:0;font-size:10px;color:rgba(255,255,255,0.78);line-height:1.3;word-break:break-word;">${esc(sig.jobTitle)}</p>
    </td>
    <!-- Right white block -->
    <td style="padding:16px 18px;vertical-align:top;border-top:3px solid ${esc(c.primary)};border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 8px;padding:0;font-size:13px;font-weight:bold;color:${esc(c.primary)};">${esc(sig.company)}</p>
            <table cellpadding="0" cellspacing="0" border="0">${contactRows}</table>
            ${sig.socialLinks.length > 0 ? `<p style="margin:10px 0 0;padding:0;font-size:0;line-height:0;">${sig.socialLinks.map((s) => socialIcon(s.platform, s.url, c.socialIcons, 26, 'circle')).join('')}</p>` : ''}
          </td>
          ${sig.logoUrl ? `<td style="vertical-align:bottom;text-align:right;padding-left:12px;"><img src="${esc(sig.logoUrl)}" height="44" style="max-height:44px;max-width:100px;display:block;" alt="${esc(sig.company)}" /></td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ── Export ───────────────────────────────────────────────────────────────────

export function generateSignatureHtml(sig: SignatureData): string {
  switch (sig.template) {
    case 'corporate-a':
    case 'corporate':
      return corporateAHtml(sig);
    case 'corporate-b':
      return corporateBHtml(sig);
    case 'minimal-a':
    case 'minimal':
      return minimalAHtml(sig);
    case 'minimal-b':
      return minimalBHtml(sig);
    case 'modern-a':
    case 'modern':
      return modernAHtml(sig);
    case 'modern-b':
      return modernBHtml(sig);
    default:
      return corporateAHtml(sig);
  }
}

export function generateSignaturePlainText(sig: SignatureData): string {
  const lines: string[] = [sig.fullName];
  if (sig.jobTitle) lines.push(sig.jobTitle);
  if (sig.company) lines.push(sig.company);
  lines.push('');
  if (sig.email) lines.push(`Email: ${sig.email}`);
  if (sig.phone) lines.push(`Tel: ${sig.phone}`);
  if (sig.website) lines.push(`Web: ${sig.website}`);
  if (sig.socialLinks.length > 0) {
    lines.push('');
    sig.socialLinks.forEach((s) => lines.push(`${s.platform}: ${s.url}`));
  }
  if (sig.dlpDisclaimer) {
    lines.push('');
    lines.push(sig.dlpDisclaimer);
  }
  return lines.join('\n');
}
