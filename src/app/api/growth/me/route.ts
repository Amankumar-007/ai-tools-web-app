import { NextResponse } from 'next/server';
import { identityFrom, planEndFrom } from '@/lib/growth/meter';
import { buildSummary } from '@/lib/growth/summary';

export const runtime = 'nodejs';

/** The signed-in user's plan, usage today, credits, streak and referral stats. */
export async function GET(req: Request) {
  const { uid, plan } = identityFrom(req);
  if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(await buildSummary(uid, plan, planEndFrom(req)), { headers: { 'Cache-Control': 'no-store' } });
}
