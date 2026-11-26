import { NextResponse } from 'next/server';
import { recordLiveVisitor } from '@/lib/visitorTracker';
import { readJsonLimited } from '@/lib/security/body';

/** Public page-view ping, rate limited by the middleware. Only the page path is taken from the browser (never an email). */
export async function POST(request: Request) {
  const read = await readJsonLimited<{ path?: unknown }>(request, 2 * 1024);
  if (!read.ok) return NextResponse.json({ success: false }, { status: read.status });
  const body = read.data && typeof read.data === 'object' ? read.data : {};

  // A page path only: no scheme, no control characters, bounded length.
  const path = typeof body.path === 'string' && /^\/[\x21-\x7e]{0,199}$/.test(body.path) ? body.path : '/';

  // The IP comes from the middleware, which overwrites it, so clients cannot spoof it.
  const ip = request.headers.get('x-tomato-ip') || 'unknown';
  recordLiveVisitor(ip, path, (request.headers.get('user-agent') || '').slice(0, 300));

  return NextResponse.json({ success: true });
}
