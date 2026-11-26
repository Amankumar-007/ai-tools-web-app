import { NextResponse } from 'next/server';
import { dayKey } from '@/lib/growth/config';
import { withStore } from '@/lib/growth';
import { identityFrom, planEndFrom } from '@/lib/growth/meter';
import { buildSummary } from '@/lib/growth/summary';

export const runtime = 'nodejs';

/**
 * Counts today as an active day for the user's streak (once per day, whatever number of times it is called)
 * and awards milestone credits. Returns the fresh summary plus what was just awarded.
 */
export async function POST(req: Request) {
  const { uid, plan } = identityFrom(req);
  if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const touch = await withStore((store) => store.touch(uid, dayKey()));
  const summary = await buildSummary(uid, plan, planEndFrom(req));
  return NextResponse.json({ ...summary, touch: touch ?? { firstToday: false, streak: summary.streak ?? 0, longestStreak: summary.longestStreak ?? 0, awarded: 0 } }, { headers: { 'Cache-Control': 'no-store' } });
}
