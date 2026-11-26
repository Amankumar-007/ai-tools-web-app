/**
 * Same-origin enforcement for state-changing API requests.
 *
 * Browsers always attach `Origin` (and `Sec-Fetch-Site`) to cross-site and same-site
 * POSTs, and a page can't forge them. Requiring a trusted value:
 *  - stops other websites from driving this API with a visitor's browser (CSRF), and
 *  - turns away bare scripts that send neither header.
 * A determined attacker can still forge the headers from a script, which is why
 * rate limits and authentication sit on top of this and not instead of it.
 */

function hostOf(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).host.toLowerCase();
  } catch {
    return null;
  }
}

function allowedHosts(requestHost: string | null): Set<string> {
  const hosts = new Set<string>();
  const add = (value: string | undefined | null) => { const h = hostOf(value); if (h) hosts.add(h); };
  add(requestHost);
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.NEXT_PUBLIC_BASE_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  for (const extra of (process.env.ALLOWED_ORIGINS || '').split(',')) add(extra.trim());
  return hosts;
}

export type OriginVerdict = { ok: true } | { ok: false; reason: string };

export function checkSameOrigin(headers: Headers, requestHost: string | null): OriginVerdict {
  const fetchSite = headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return { ok: false, reason: 'cross-site request' };

  const origin = headers.get('origin');
  if (origin) {
    const host = hostOf(origin);
    if (!host || !allowedHosts(requestHost).has(host)) return { ok: false, reason: 'untrusted origin' };
    return { ok: true };
  }

  // No Origin: acceptable only when the browser says the request is same-origin.
  if (fetchSite === 'same-origin' || fetchSite === 'same-site') return { ok: true };
  const referer = hostOf(headers.get('referer'));
  if (referer && allowedHosts(requestHost).has(referer)) return { ok: true };
  return { ok: false, reason: 'missing origin' };
}
