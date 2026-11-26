/**
 * X (Twitter) video links: validating what the visitor pastes and reading the video files of a PUBLIC post.
 *
 * How it works (checked against real public posts): X publishes every public post's data for its own embeddable
 * widgets at `cdn.syndication.twimg.com/tweet-result`. The answer lists each video as MP4 files of different quality
 * with their bitrates. We call only that fixed address (the pasted link supplies nothing but a numeric post id), never
 * log in, and never relay the video: the visitor's browser downloads it straight from X's video CDN.
 */

export type XUrlResult = { ok: true; id: string; url: string } | { ok: false; error: string };

export interface XVideoSource { url: string; quality: number | null; bitrate: number | null; label: string }
export interface XPost { title: string | null; thumbnail: string | null; sources: XVideoSource[]; isGif: boolean }

const PAGE_HOSTS = new Set(['x.com', 'twitter.com', 'mobile.twitter.com', 'www.x.com', 'www.twitter.com', 'mobile.x.com']);
const STATUS_PATH = /^\/(?:[A-Za-z0-9_]{1,15}|i(?:\/web)?)\/status(?:es)?\/(\d{5,20})(?:\/|$)/;

/** Accepts a pasted link (scheme optional) and returns the numeric post id, or a friendly error. */
export function parseXUrl(input: string): XUrlResult {
  const text = input.trim();
  if (!text) return { ok: false, error: 'Paste the link of an X (Twitter) post that contains a video.' };
  if (text.length > 400 || /[\s<>"']/.test(text)) return { ok: false, error: 'That does not look like a single link. Paste just the post URL.' };
  let url: URL;
  try { url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`); } catch { return { ok: false, error: 'That does not look like a valid link.' }; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { ok: false, error: 'Only web links (https://) are supported.' };
  if (url.username || url.password || url.port) return { ok: false, error: 'That link has parts we cannot use. Copy it again from X.' };
  if (!PAGE_HOSTS.has(url.hostname.toLowerCase())) return { ok: false, error: 'This tool only works with X or Twitter links (x.com, twitter.com).' };
  const m = STATUS_PATH.exec(url.pathname);
  if (!m) return { ok: false, error: 'Open the post itself on X, tap Share, choose "Copy link", and paste that here.' };
  return { ok: true, id: m[1], url: `https://x.com/i/status/${m[1]}` };
}

/** Video and thumbnail files must come from X's media CDNs. Anything else in an answer is ignored. */
export function isAllowedXMediaUrl(value: string): boolean {
  try {
    const u = new URL(value);
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && (h === 'video.twimg.com' || h === 'pbs.twimg.com');
  } catch { return false; }
}

/** The token X's own embeds send. It only has to be derived from the id. */
export function syndicationToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

export function syndicationUrl(id: string): string {
  return `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(id)}&token=${syndicationToken(id)}&lang=en`;
}

interface Variant { content_type?: string; url?: string; bitrate?: number }
interface Media { type?: string; media_url_https?: string; video_info?: { variants?: Variant[] } }

function resolutionOf(url: string): number | null {
  const m = /\/(\d{2,4})x(\d{2,4})\//.exec(url);
  if (!m) return null;
  const w = Number(m[1]), h = Number(m[2]);
  return Math.min(w, h) >= 100 ? Math.min(w, h) : null;
}

const cap = (s: string | null, n: number) => (s ? (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s) : null);

export class XError extends Error {
  constructor(readonly code: 'not_found' | 'no_video' | 'unavailable' | 'blocked' | 'unreachable', message: string, readonly status: number) { super(message); this.name = 'XError'; }
}

/** Reads the answer of the syndication endpoint. Throws XError with a plain-language message when there is no usable video. */
export function parseXPost(data: unknown): XPost {
  if (!data || typeof data !== 'object') throw new XError('unreachable', 'X sent an unexpected answer. Try again in a moment.', 502);
  const post = data as Record<string, unknown>;
  if (post.__typename === 'TweetTombstone') throw new XError('unavailable', 'This post is not available: it may be private, from a protected account, deleted, or hidden by X.', 404);
  const media = Array.isArray(post.mediaDetails) ? (post.mediaDetails as unknown[]).filter((m): m is Media => !!m && typeof m === 'object') : [];
  const videos = media.filter((m) => (m.type === 'video' || m.type === 'animated_gif') && m.video_info);
  if (videos.length === 0) throw new XError('no_video', 'We could not find a video in this post. It may only have photos or text, or the video may belong to a quoted or reposted post (paste that post\'s own link instead).', 404);

  const first = videos[0];
  const found = new Map<string, XVideoSource>();
  for (const v of Array.isArray(first.video_info!.variants) ? first.video_info!.variants! : []) {
    if (!v || typeof v !== 'object') continue;
    if (v.content_type !== 'video/mp4' || typeof v.url !== 'string' || !isAllowedXMediaUrl(v.url)) continue;
    const quality = resolutionOf(v.url);
    const bitrate = typeof v.bitrate === 'number' && v.bitrate > 0 ? v.bitrate : null;
    found.set(v.url, { url: v.url, quality, bitrate, label: quality ? `${quality}p` : bitrate ? `${Math.round(bitrate / 1000)} kbps` : 'Original' });
  }
  const sources = [...found.values()].sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0) || (b.bitrate ?? 0) - (a.bitrate ?? 0));
  if (sources.length === 0) throw new XError('no_video', 'This post\'s video is only offered as a live stream, so there is no file to save.', 404);

  const user = post.user && typeof post.user === 'object' ? (post.user as Record<string, unknown>) : {};
  const name = typeof user.name === 'string' ? user.name : null;
  const text = typeof post.text === 'string' ? post.text.replace(/https?:\/\/t\.co\/\w+/g, '').replace(/\s+/g, ' ').trim() : '';
  const title = cap([name, text].filter(Boolean).join(': ') || null, 200);
  const thumb = typeof first.media_url_https === 'string' && isAllowedXMediaUrl(first.media_url_https) ? first.media_url_https : null;
  return { title, thumbnail: thumb, sources, isGif: first.type === 'animated_gif' };
}

export interface XFetchLike { (url: string, init: { headers: Record<string, string>; signal: AbortSignal }): Promise<Response> }

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', Accept: 'application/json' };

/** Looks up one public post by id. Only the fixed X embed address is ever requested. */
export async function fetchXPost(id: string, doFetch: XFetchLike = fetch as unknown as XFetchLike): Promise<XPost> {
  if (!/^\d{5,20}$/.test(id)) throw new XError('not_found', 'That does not look like a post link.', 400);
  let res: Response;
  try { res = await doFetch(syndicationUrl(id), { headers: HEADERS, signal: AbortSignal.timeout(12_000) }); }
  catch { throw new XError('unreachable', 'Could not reach X right now. Try again in a moment.', 502); }
  if (res.status === 404 || res.status === 410) { await res.body?.cancel().catch(() => {}); throw new XError('not_found', 'X says this post does not exist. Check the link, or the post may have been deleted.', 404); }
  if (res.status === 429 || res.status === 403) { await res.body?.cancel().catch(() => {}); throw new XError('blocked', 'X is limiting requests right now. Please try again in a few minutes.', 503); }
  if (!res.ok) { await res.body?.cancel().catch(() => {}); throw new XError('unreachable', 'X did not return the post. Try again later.', 502); }
  const raw = await res.text();
  if (raw.length > 2_000_000) throw new XError('unreachable', 'X sent an unexpected answer. Try again in a moment.', 502);
  if (raw.trim() === '') throw new XError('unavailable', 'This post is not available: it may be private, from a protected account, deleted, or hidden by X.', 404);
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new XError('unreachable', 'X sent an unexpected answer. Try again in a moment.', 502); }
  return parseXPost(data);
}

export function safeXFileName(title: string | null, label: string, gif: boolean): string {
  const base = (title ?? 'x-video').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50).replace(/^-+|-+$/g, '') || 'x-video';
  return `${base}-${label.replace(/[^\w-]/g, '')}${gif ? '-gif' : ''}.mp4`;
}
