/**
 * LinkedIn video links: validating what the visitor pastes, and reading the video out of a public post's page.
 *
 * How it works (checked against a real public post): a public LinkedIn video post's HTML lists the playable files in a
 * `<video data-sources="[...]">` attribute (one MP4 per quality with its bitrate) and repeats one of them in JSON-LD
 * as a VideoObject `contentUrl`. We read those; we never log in, never touch private content, and never relay the
 * video itself: the visitor's browser downloads it straight from LinkedIn's CDN.
 */

export const MAX_HTML_BYTES = 3_000_000;

export type UrlResult = { ok: true; url: string } | { ok: false; error: string };

const PAGE_HOST = /^(?:[a-z0-9-]{1,30}\.)?linkedin\.com$/;
const POST_PATHS = ['/posts/', '/feed/update/', '/embed/feed/update/', '/video/', '/events/'];

/** Hosts the server is allowed to fetch pages from (checked again on every redirect hop). */
export function isAllowedPageHost(host: string): boolean {
  const h = host.toLowerCase();
  return PAGE_HOST.test(h) || h === 'lnkd.in';
}

/** Video files must come from LinkedIn's media CDN. Anything else in a page is ignored. */
export function isAllowedMediaUrl(value: string): boolean {
  try {
    const u = new URL(value);
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && (h === 'licdn.com' || h.endsWith('.licdn.com'));
  } catch { return false; }
}

/** Accepts a pasted link (scheme optional), returns a clean https URL on linkedin.com or lnkd.in, or a friendly error. */
export function parseLinkedInUrl(input: string): UrlResult {
  const text = input.trim();
  if (!text) return { ok: false, error: 'Paste the link of a LinkedIn post that contains a video.' };
  if (text.length > 600 || /[\s<>"']/.test(text)) return { ok: false, error: 'That does not look like a single link. Paste just the post URL.' };
  let url: URL;
  try { url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`); } catch { return { ok: false, error: 'That does not look like a valid link.' }; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { ok: false, error: 'Only web links (https://) are supported.' };
  if (url.username || url.password || url.port) return { ok: false, error: 'That link has parts we cannot use. Copy it again from LinkedIn.' };
  if (!isAllowedPageHost(url.hostname)) return { ok: false, error: 'This tool only works with LinkedIn links (linkedin.com).' };
  if (url.hostname.toLowerCase() === 'lnkd.in') {
    if (url.pathname.length < 2) return { ok: false, error: 'That short link is incomplete.' };
    return { ok: true, url: `https://lnkd.in${url.pathname}` };
  }
  if (!POST_PATHS.some((p) => url.pathname.startsWith(p))) {
    return { ok: false, error: 'Open the post itself on LinkedIn, tap the three dots, choose "Copy link to post", and paste that here.' };
  }
  // Tracking parameters are useless here and would only make the address longer.
  return { ok: true, url: `https://${url.hostname.toLowerCase()}${url.pathname}` };
}

export function decodeEntities(s: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return named[e.toLowerCase()] ?? m;
  });
}

export interface VideoSource { url: string; quality: number | null; bitrate: number | null; label: string }
export interface ParsedPost { title: string | null; thumbnail: string | null; sources: VideoSource[]; authwall: boolean }

const qualityOf = (url: string): number | null => {
  const m = /(?:mp4|h264|vid)[-_/]*(\d{3,4})p/i.exec(url) ?? /[-_/](\d{3,4})p[-_/]/i.exec(url);
  return m ? Number(m[1]) : null;
};

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*>`, 'i');
  const tag = re.exec(html)?.[0];
  const c = tag && /content=("([^"]*)"|'([^']*)')/i.exec(tag);
  return c ? decodeEntities(c[2] ?? c[3] ?? '') : null;
}

const cap = (s: string | null, n: number) => (s ? s.replace(/\s+/g, ' ').trim().slice(0, n) : null);

export function parseLinkedInPage(html: string): ParsedPost {
  const found = new Map<string, { url: string; bitrate: number | null }>();
  const add = (raw: unknown, bitrate: unknown = null) => {
    if (typeof raw !== 'string') return;
    const url = decodeEntities(raw).trim();
    if (!isAllowedMediaUrl(url) || /\.m3u8|\.mpd|\.ts(\?|$)/i.test(url)) return;
    if (!found.has(url)) found.set(url, { url, bitrate: typeof bitrate === 'number' && Number.isFinite(bitrate) ? bitrate : null });
  };

  // 1. <video data-sources="[{...}]">: one entry per quality.
  for (const m of html.matchAll(/data-sources=("([^"]*)"|'([^']*)')/gi)) {
    try {
      const list = JSON.parse(decodeEntities(m[2] ?? m[3] ?? '')) as unknown;
      if (Array.isArray(list)) for (const it of list) if (it && typeof it === 'object') { const o = it as Record<string, unknown>; if (!o.type || /mp4/i.test(String(o.type))) add(o.src, o['data-bitrate']); }
    } catch { /* attribute was not JSON: ignore it */ }
  }

  // 2. JSON-LD VideoObject.
  let ldTitle: string | null = null; let ldThumb: string | null = null;
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]) as unknown;
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const stack: unknown[] = [node];
        while (stack.length) {
          const cur = stack.pop();
          if (!cur || typeof cur !== 'object') continue;
          const o = cur as Record<string, unknown>;
          if (o['@type'] === 'VideoObject') { add(o.contentUrl); if (typeof o.name === 'string') ldTitle ??= o.name; const t = Array.isArray(o.thumbnailUrl) ? o.thumbnailUrl[0] : o.thumbnailUrl; if (typeof t === 'string') ldThumb ??= t; }
          for (const v of Object.values(o)) if (v && typeof v === 'object') stack.push(v);
        }
      }
    } catch { /* not JSON-LD we understand */ }
  }

  // 3. Last resort: any LinkedIn video CDN link in the page.
  if (found.size === 0) for (const m of html.matchAll(/https:\/\/dms\.licdn\.com\/playlist\/vid\/[^"'\s<>\\]+/g)) add(m[0]);

  const sources: VideoSource[] = [...found.values()]
    .map((s) => { const quality = qualityOf(s.url); return { url: s.url, quality, bitrate: s.bitrate, label: quality ? `${quality}p` : s.bitrate ? `${Math.round(s.bitrate / 1000)} kbps` : 'Original' }; })
    .sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0) || (b.bitrate ?? 0) - (a.bitrate ?? 0));

  // The real video poster beats og:image, which is LinkedIn's generic logo for logged-out visitors.
  const posterAttr = html.match(/data-poster-url=["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&') ?? null;
  const candidates = [ldThumb, posterAttr, metaContent(html, 'og:image')].filter((u): u is string => !!u && isAllowedMediaUrl(u));
  return {
    title: cap(metaContent(html, 'og:title') ?? ldTitle, 200),
    thumbnail: candidates[0] ?? null,
    sources,
    authwall: /authwall|\/signup\/cold-join|\/uas\/login|sign in to view/i.test(html) && sources.length === 0,
  };
}

// ── fetching ─────────────────────────────────────────────────────────

export type LinkedInErrorCode = 'private' | 'no_video' | 'blocked' | 'unreachable' | 'not_found';
export class LinkedInError extends Error {
  constructor(readonly code: LinkedInErrorCode, message: string, readonly status: number) { super(message); this.name = 'LinkedInError'; }
}

export interface FetchLike { (url: string, init: { redirect: 'manual'; headers: Record<string, string>; signal: AbortSignal }): Promise<Response> }

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function readCapped(res: Response, max: number): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = []; let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const room = max - total;
    // Keep what fits (a page can arrive as one huge chunk), then stop: never buffer an unbounded page.
    if (value.byteLength > room) { chunks.push(value.subarray(0, room)); total = max; await reader.cancel().catch(() => {}); break; }
    chunks.push(value);
    total += value.byteLength;
  }
  const all = new Uint8Array(chunks.reduce((s, c) => s + c.length, 0)); let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return new TextDecoder().decode(all);
}

/**
 * Fetches a public post page. Redirects are followed by hand (max 4) and EVERY hop must stay on LinkedIn, so a link
 * can never be used to make our server reach any other address.
 */
export async function fetchLinkedInPost(startUrl: string, doFetch: FetchLike = fetch as unknown as FetchLike): Promise<ParsedPost> {
  let url = startUrl;
  for (let hop = 0; hop <= 4; hop++) {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !isAllowedPageHost(u.hostname) || u.port || u.username || u.password) throw new LinkedInError('unreachable', 'That link leaves LinkedIn, so it was not opened.', 400);
    let res: Response;
    try { res = await doFetch(url, { redirect: 'manual', headers: BROWSER_HEADERS, signal: AbortSignal.timeout(12_000) }); }
    catch { throw new LinkedInError('unreachable', 'Could not reach LinkedIn right now. Try again in a moment.', 502); }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      await res.body?.cancel().catch(() => {});
      if (!loc) throw new LinkedInError('unreachable', 'LinkedIn sent an unexpected response.', 502);
      let next: URL;
      try { next = new URL(loc, url); } catch { throw new LinkedInError('unreachable', 'LinkedIn sent an unexpected response.', 502); }
      if (/\/(authwall|login|uas\/login|signup)/i.test(next.pathname) || next.searchParams.has('session_redirect')) throw new LinkedInError('private', 'LinkedIn asks people to sign in to see this post, so it is not public and cannot be downloaded here.', 403);
      url = next.toString();
      continue;
    }
    if (res.status === 404 || res.status === 410) { await res.body?.cancel().catch(() => {}); throw new LinkedInError('not_found', 'LinkedIn says this post does not exist. Check the link, or the post may have been deleted.', 404); }
    if (res.status === 429 || res.status === 999 || res.status === 403) { await res.body?.cancel().catch(() => {}); throw new LinkedInError('blocked', 'LinkedIn is limiting requests right now. Please try again in a few minutes.', 503); }
    if (!res.ok) { await res.body?.cancel().catch(() => {}); throw new LinkedInError('unreachable', 'LinkedIn did not return the post. Try again later.', 502); }

    const html = await readCapped(res, MAX_HTML_BYTES);
    const parsed = parseLinkedInPage(html);
    if (parsed.sources.length === 0) {
      if (parsed.authwall) throw new LinkedInError('private', 'LinkedIn asks people to sign in to see this post, so it is not public and cannot be downloaded here.', 403);
      throw new LinkedInError('no_video', 'We could not find a video in this post. It may be an image or document post, a LinkedIn Live, a video hosted elsewhere (like YouTube), or a private post.', 404);
    }
    return parsed;
  }
  throw new LinkedInError('unreachable', 'That link redirected too many times.', 502);
}

export function safeFileName(title: string | null, label: string): string {
  const base = (title ?? 'linkedin-video').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50).replace(/^-+|-+$/g, '') || 'linkedin-video';
  return `${base}-${label.replace(/[^\w-]/g, '')}.mp4`;
}
