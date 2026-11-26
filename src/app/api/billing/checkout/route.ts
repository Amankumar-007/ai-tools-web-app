import { NextResponse } from 'next/server';
import { billingCurrency, isPaidPlan, planFeatures, planPrice, PLAN_NAMES, PLAN_RANK, type Interval } from '@/lib/billing/plans';
import { billingReady, createOrder, RazorpayError, razorpayKeys } from '@/lib/billing/razorpay';
import { identityFrom } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * Step 1 of paying: creates a Razorpay Order for the chosen plan and hands the browser what Razorpay Checkout
 * needs to open. The price comes from plans.ts, never from the client, and the buyer/plan are written into the
 * order's notes so the webhook can deliver the plan even if the browser never comes back.
 */
export async function POST(req: Request) {
  const keys = razorpayKeys();
  if (!billingReady() || !keys) {
    return NextResponse.json({ error: 'Paid plans are not open yet. Join the waitlist and we will tell you the moment they are.', code: 'billing_disabled' }, { status: 503, headers: NO_STORE });
  }
  const { uid, plan: currentPlan } = identityFrom(req);
  if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401, headers: NO_STORE });

  const read = await readJsonLimited<{ plan?: unknown; interval?: unknown }>(req, 1024);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status, headers: NO_STORE });
  const plan = read.data?.plan;
  const interval: Interval | null = read.data?.interval === 'year' ? 'year' : read.data?.interval === 'month' ? 'month' : null;
  if (!isPaidPlan(plan) || !interval) return NextResponse.json({ error: 'Choose Pro or Premium, monthly or yearly.' }, { status: 400, headers: NO_STORE });

  // Buying the plan you have extends it; buying a higher one upgrades it. Buying a lower one would waste money.
  if (PLAN_RANK[plan] < PLAN_RANK[currentPlan]) {
    return NextResponse.json({ error: `You are on ${PLAN_NAMES[currentPlan]}, which already includes everything in ${PLAN_NAMES[plan]}. You can renew ${PLAN_NAMES[currentPlan]} or wait until it ends.`, code: 'lower_plan' }, { status: 409, headers: NO_STORE });
  }

  const currency = billingCurrency();
  const amount = planPrice(plan, interval, currency);
  try {
    const order = await createOrder({
      amount,
      currency: currency.toUpperCase(),
      receipt: `tm_${uid.replace(/-/g, '').slice(0, 12)}_${Date.now().toString(36)}`,
      notes: { uid, plan, interval, app: 'tomatoai' },
    });
    return NextResponse.json(
      {
        keyId: keys.keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'TomatoAI',
        description: `${PLAN_NAMES[plan]} · ${interval === 'year' ? '1 year' : '30 days'} · ${planFeatures(plan)[0]}`,
        upgrade: currentPlan !== 'free' && PLAN_RANK[plan] > PLAN_RANK[currentPlan],
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('[billing] could not create order:', error instanceof RazorpayError ? `${error.status} ${error.code} ${error.message}` : error);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 502, headers: NO_STORE });
  }
}
