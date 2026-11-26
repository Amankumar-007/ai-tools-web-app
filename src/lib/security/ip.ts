/**
 * Client IP detection that is hard to spoof.
 *
 * Forwarding headers are only believed when something we control sets them: Vercel (VERCEL=1), or a
 * reverse proxy you have declared with TRUST_PROXY_HEADERS=1. Anywhere else a client could send
 * `X-Real-IP: <random>` on every request to dodge IP limits, so all such callers share one bucket instead.
 *
 * Platform headers (set by Vercel's edge, overwriting anything the client sent) are
 * preferred. Behind other proxies the *rightmost* X-Forwarded-For entry is the one
 * added by the nearest proxy; the leftmost is client-controlled and is never used.
 * IPv6 addresses are reduced to their /64 prefix so an attacker who owns a /64
 * (which is typical) cannot dodge limits by rotating addresses.
 */

function expandIpv6(address: string): string[] | null {
  const a = address.toLowerCase().split('%')[0];
  // IPv4-mapped (::ffff:1.2.3.4) is handled by the caller.
  if (a.includes('.')) return null;
  if ((a.match(/::/g) || []).length > 1) return null;
  const [head, tail] = a.split('::');
  const h = head ? head.split(':') : [];
  const t = tail !== undefined && tail !== '' ? tail.split(':') : [];
  const missing = 8 - h.length - t.length;
  if (a.includes('::') ? missing < 0 : h.length !== 8) return null;
  const groups = a.includes('::') ? [...h, ...Array(missing).fill('0'), ...t] : h;
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => g.padStart(4, '0'));
}

/** Normalises an address into the unit we rate-limit on. */
export function ipBucket(raw: string): string {
  const ip = raw.trim().replace(/^\[|\]$/g, '');
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) return mapped[1];
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return ip;
  if (ip.includes(':')) {
    const groups = expandIpv6(ip);
    if (groups) return `${groups.slice(0, 4).join(':')}::/64`;
  }
  return 'unknown';
}

function proxyIsTrusted(): boolean {
  return process.env.VERCEL === '1' || process.env.TRUST_PROXY_HEADERS === '1';
}

export function clientIp(headers: Headers): string {
  if (!proxyIsTrusted()) return 'unknown';
  const platform = headers.get('x-vercel-forwarded-for') || headers.get('cf-connecting-ip') || headers.get('x-real-ip');
  if (platform) return ipBucket(platform.split(',')[0]);
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length) return ipBucket(parts[parts.length - 1]);
  }
  return 'unknown';
}
