/**
 * Builds the text that goes inside a QR code for the common cases: link, text, Wi-Fi, UPI payment, contact card,
 * email, phone, SMS, WhatsApp, location. Pure and strictly validated, so a typo never produces a code that looks
 * fine but does not work (the worst failure for a QR code is a payment or Wi-Fi code that silently scans wrong).
 */

export type QrKind = 'url' | 'text' | 'wifi' | 'upi' | 'vcard' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'geo';
export type Fields = Record<string, string>;
export type QrResult = { ok: true; payload: string } | { ok: false; error: string };

const bad = (error: string): QrResult => ({ ok: false, error });
const ok = (payload: string): QrResult => ({ ok: true, payload });
const has = (s: string | undefined): s is string => typeof s === 'string' && s.trim() !== '';

/** Max text a QR code can hold at the lowest error correction (version 40-L, byte mode). */
export const MAX_QR_BYTES = 2953;
const bytes = (s: string) => new TextEncoder().encode(s).length;

/** Escape for Wi-Fi codes: backslash, semicolon, comma, colon and quote must be escaped. */
export const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, '\\$1');
/** Escape for vCard values. */
export const vcardEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([;,])/g, '\\$1');

export const UPI_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

export function normalizeUrl(input: string): string | null {
  const t = input.trim();
  if (!t || /\s/.test(t)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withScheme);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
    return u.toString();
  } catch { return null; }
}

/** Digits only; accepts +91 98765 43210, 098765-43210 and so on. Defaults a bare 10-digit number to India. */
export function normalizePhone(input: string, defaultCountry = '91'): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  const d = digits.replace(/\D/g, '');
  if (/^0?\d{10}$/.test(d)) return `+${defaultCountry}${d.slice(-10)}`;
  if (/^\d{8,15}$/.test(d) && d.length > 10) return `+${d}`;
  return null;
}

export function buildQr(kind: QrKind, f: Fields): QrResult {
  let r: QrResult;
  switch (kind) {
    case 'url': { const u = normalizeUrl(f.url ?? ''); r = u ? ok(u) : bad('Enter a valid web address, like example.com/page.'); break; }
    case 'text': r = has(f.text) ? ok(f.text) : bad('Type the text to put in the code.'); break;
    case 'wifi': {
      if (!has(f.ssid)) { r = bad('Enter the Wi-Fi network name.'); break; }
      const sec = f.security === 'nopass' || f.security === 'WEP' ? f.security : 'WPA';
      if (sec !== 'nopass' && !has(f.password)) { r = bad('Enter the Wi-Fi password, or choose "No password".'); break; }
      r = ok(`WIFI:T:${sec};S:${wifiEscape(f.ssid)};${sec === 'nopass' ? '' : `P:${wifiEscape(f.password ?? '')};`}${f.hidden === 'yes' ? 'H:true;' : ''};`);
      break;
    }
    case 'upi': {
      const pa = (f.pa ?? '').trim();
      if (!UPI_ID.test(pa)) { r = bad('Enter a valid UPI ID, like name@bank.'); break; }
      const params = new URLSearchParams();
      params.set('pa', pa);
      if (has(f.pn)) params.set('pn', f.pn.trim().slice(0, 60));
      if (has(f.am)) {
        if (!/^\d{1,9}(\.\d{1,2})?$/.test(f.am.trim()) || Number(f.am) <= 0) { r = bad('Amount must be a number like 499 or 499.50, with at most 2 decimals.'); break; }
        params.set('am', String(Number(f.am)));
      }
      params.set('cu', 'INR');
      if (has(f.tn)) params.set('tn', f.tn.trim().slice(0, 80));
      // UPI apps expect spaces as %20 (URLSearchParams would write "+").
      r = ok(`upi://pay?${params.toString().replace(/\+/g, '%20')}`);
      break;
    }
    case 'vcard': {
      if (!has(f.name)) { r = bad('Enter the contact name.'); break; }
      const phone = has(f.phone) ? normalizePhone(f.phone) : undefined;
      if (has(f.phone) && !phone) { r = bad('That phone number does not look right.'); break; }
      if (has(f.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { r = bad('That email address does not look right.'); break; }
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${vcardEscape(f.name.trim())}`, `N:${vcardEscape(f.name.trim())};;;;`];
      if (has(f.org)) lines.push(`ORG:${vcardEscape(f.org.trim())}`);
      if (has(f.title)) lines.push(`TITLE:${vcardEscape(f.title.trim())}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (has(f.email)) lines.push(`EMAIL:${vcardEscape(f.email.trim())}`);
      if (has(f.url)) { const u = normalizeUrl(f.url); if (!u) { r = bad('That website address does not look right.'); break; } lines.push(`URL:${u}`); }
      lines.push('END:VCARD');
      r = ok(lines.join('\r\n'));
      break;
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((f.to ?? '').trim())) { r = bad('Enter a valid email address.'); break; }
      const params = new URLSearchParams();
      if (has(f.subject)) params.set('subject', f.subject);
      if (has(f.body)) params.set('body', f.body);
      const q = params.toString().replace(/\+/g, '%20');
      r = ok(`mailto:${f.to.trim()}${q ? `?${q}` : ''}`);
      break;
    }
    case 'phone': { const p = normalizePhone(f.phone ?? ''); r = p ? ok(`tel:${p}`) : bad('Enter a valid phone number, like 98765 43210.'); break; }
    case 'sms': { const p = normalizePhone(f.phone ?? ''); r = p ? ok(`SMSTO:${p}:${(f.message ?? '').replace(/\r?\n/g, ' ')}`) : bad('Enter a valid phone number.'); break; }
    case 'whatsapp': {
      const p = normalizePhone(f.phone ?? '');
      if (!p) { r = bad('Enter a valid WhatsApp number, like 98765 43210.'); break; }
      r = ok(`https://wa.me/${p.slice(1)}${has(f.message) ? `?text=${encodeURIComponent(f.message)}` : ''}`);
      break;
    }
    case 'geo': {
      const lat = Number(f.lat), lng = Number(f.lng);
      if (!has(f.lat) || !has(f.lng) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { r = bad('Latitude must be between -90 and 90, and longitude between -180 and 180.'); break; }
      r = ok(`geo:${lat},${lng}`);
      break;
    }
    default: r = bad('Unknown code type.');
  }
  if (r.ok && bytes(r.payload) > MAX_QR_BYTES) return bad('That is too much text for one QR code. Shorten it.');
  return r;
}
