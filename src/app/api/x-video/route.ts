import { NextResponse } from 'next/server';
import { fetchXPost, parseXUrl, XError, type XPost } from '@/lib/daily-tools/xvideo';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';
export const maxDuration = 30;

const NO_STORE = { 'Cache-Control': 'no-store' };

type Answer = Pick<XPost, 'title' | 'thumbnail' | 'sources' | 'isGif'>;

// Remember recent answers so repeated lookups of the same post do not hit X again.
const CACHE_MS = 10 * 60_000;
const MAX_CACHE = 300;
const cache = new Map<string, { at: number; answer: Answer }>();

function remember(key: string, answer: Answer) {
  if (cache.size >= MAX_CACHE) {
    const cutoff = Date.now() - CACHE_MS;
    for (const [k, v] of cache) if (v.at < cutoff) cache.delete(k);
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
  }
  cache.set(key, { at: Date.now(), answer });
}

/**
 * Finds the video files of a PUBLIC X (Twitter) post. The only address ever requested is X's own fixed embed endpoint
 * (the link a visitor pastes only supplies a numeric post id), no cookies or sign-in are used, and only X media
 * addresses are returned. The video itself is NOT downloaded here: the visitor's browser fetches it directly from X's
 * CDN. Rate limits are per IP (see policies.ts) and apply before this runs.
 */
export async function POST(req: Request) {
  const read = await readJsonLimited<{ url?: unknown }>(req, 2048);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status, headers: NO_STORE });
  const raw = read.data?.url;
  if (typeof raw !== 'string') return NextResponse.json({ error: 'Paste the link of an X post.' }, { status: 400, headers: NO_STORE });

  const parsed = parseXUrl(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error, code: 'invalid_url' }, { status: 400, headers: NO_STORE });

  const hit = cache.get(parsed.id);
  if (hit && Date.now() - hit.at < CACHE_MS) return NextResponse.json(hit.answer, { headers: NO_STORE });

  try {
    const post = await fetchXPost(parsed.id);
    const answer: Answer = { title: post.title, thumbnail: post.thumbnail, sources: post.sources.slice(0, 8), isGif: post.isGif };
    remember(parsed.id, answer);
    return NextResponse.json(answer, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof XError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers: NO_STORE });
    console.error('[x-video] unexpected failure:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500, headers: NO_STORE });
  }
}
