import { NextResponse } from 'next/server';
import { normalizeReferralCode, REFERRAL } from '@/lib/growth/config';
import { withStore } from '@/lib/growth';
import { identityFrom } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';
import { hit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * A new user redeems the referral code from the link that brought them. The reward is NOT paid here: it is
 * paid, to both people, on the new user's first real use of the product (see growth_consume), so signing up
 * fake accounts earns nothing.
 */
export async function POST(req: Request) {
  const { uid } = identityFrom(req);
  if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401, headers: NO_STORE });

  // Guessing codes is the abuse here: a hard per-user cap on top of the middleware's limits.
  const attempts = await hit(`refclaim:${uid}`, 10, 3600);
  if (!attempts.ok) return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429, headers: NO_STORE });

  const read = await readJsonLimited<{ code?: unknown }>(req, 512);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status, headers: NO_STORE });
  const code = normalizeReferralCode(read.data?.code);
  if (!code) return NextResponse.json({ ok: false, reason: 'invalid_code' }, { status: 200, headers: NO_STORE });

  const result = await withStore((store) => store.claimReferral(uid, code));
  if (!result) return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503, headers: NO_STORE });
  return NextResponse.json({ ...result, bonus: result.ok ? REFERRAL.refereeBonus : 0 }, { headers: NO_STORE });
}
