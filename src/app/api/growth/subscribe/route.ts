import { NextResponse } from 'next/server';
import { withStore } from '@/lib/growth';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };
const EMAIL = /^[^\s@<>"'`,;]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

/** Newsletter / waitlist signup. Public; rate limited per IP by the middleware; honeypot field stops simple bots. */
export async function POST(req: Request) {
  const read = await readJsonLimited<{ email?: unknown; source?: unknown; website?: unknown }>(req, 2048);
  if (!read.ok) return NextResponse.json({ ok: false, error: read.error }, { status: read.status, headers: NO_STORE });
  const body = read.data && typeof read.data === 'object' ? read.data : {};

  // Real people never see or fill the hidden "website" field. Pretend success so bots learn nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return NextResponse.json({ ok: true }, { headers: NO_STORE });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL.test(email)) return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400, headers: NO_STORE });
  const source = typeof body.source === 'string' && /^[a-z0-9_-]{1,40}$/i.test(body.source) ? body.source : null;

  const result = await withStore((store) => store.subscribe(email, source));
  if (!result) return NextResponse.json({ ok: false, error: 'Signups are temporarily unavailable. Please try again later.' }, { status: 503, headers: NO_STORE });
  return NextResponse.json({ ok: true, already: result.already }, { headers: NO_STORE });
}
