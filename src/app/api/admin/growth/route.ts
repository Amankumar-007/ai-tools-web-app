import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { billingReady } from '@/lib/billing/razorpay';
import { dayKey } from '@/lib/growth/config';
import { growthStoreKind, withStore } from '@/lib/growth';

export const runtime = 'nodejs';

/** Admin only: how the growth features are doing today, and whether storage and billing are actually wired up. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const stats = await withStore((store) => store.stats(dayKey()));
  return NextResponse.json({ success: true, store: growthStoreKind(), storeReachable: stats !== null, billingReady: billingReady(), day: dayKey(), stats }, { headers: { 'Cache-Control': 'no-store' } });
}
