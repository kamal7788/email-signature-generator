import { SignatureData, SocialPlatform } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Returns a hosted URL for the social icon image.
 *
 * During local dev the icon is served from /api/icon (same origin).
 * In production the NEXT_PUBLIC_BASE_URL env var is prepended so that
 * the absolute URL is embedded directly into the copied HTML — ensuring
 * webmail clients (Roundcube, Gmail web, Outlook web) can fetch the image
 * without it being stripped as a data URI.
 *
 * The base is intentionally NOT used here at generation time because
 * generateSignatureHtml runs both server-side (no window) and client-side.
 * The copy handlers in the UI components do the /uploads/ → absolute URL
 * replacement; for /api/icon we use a relative path here and the same
 * replacement pattern makes it absolute at copy time.
 */
function iconUrl(
  platform: SocialPlatform,
  color: string,
  size: number,
  shape: 'rounded' | 'circle'
): string {
  const c = encodeURIComponent(color);
  return `/api/icon?p=${platform}&c=${c}&s=${size}&shape=${shape}`;
}

function socialIcon(
  platform: SocialPlatform,
  url: string,
  color: string,
  size = 28,
  shape: 'rounded' | 'circle' = 'rounded'
): string {
  const src = iconUrl(platform, color, size, shape);
  return `<a href="${esc(url)}" target="_blank" style="display:inline-block;text-decoration:none;margin-right:6px;vertical-align:middle;line-height:0;"><img src="${src}" width="${size}" height="${size}" alt="${platform}" style="display:block;border:none;" /></a>`;
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

// ── Minimal B — two-column split ─────────────────────────────────────────────

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

// ── Modern B — card: colored left block ──────────────────────────────────────

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
    <td style="background-color:${esc(c.primary)};padding:20px 18px;vertical-align:middle;text-align:center;width:148px;">
      ${hasPortrait ? `<img src="${esc(sig.portraitUrl)}" width="72" height="72" style="border-radius:50%;display:block;margin:0 auto;object-fit:cover;border:3px solid rgba(255,255,255,0.4);" alt="${esc(sig.fullName)}" />` : ''}
      <p style="margin:${hasPortrait ? '10px' : '0'} 0 0;padding:0;font-size:15px;font-weight:bold;color:#ffffff;line-height:1.2;word-break:break-word;">${esc(sig.fullName)}</p>
      <p style="margin:3px 0 0;padding:0;font-size:10px;color:rgba(255,255,255,0.78);line-height:1.3;word-break:break-word;">${esc(sig.jobTitle)}</p>
    </td>
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
