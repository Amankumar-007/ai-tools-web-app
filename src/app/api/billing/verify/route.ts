import { NextResponse } from 'next/server';
import { fulfilPayment } from '@/lib/billing/fulfil';
import { liveFulfilDeps } from '@/lib/billing/fulfil-deps';
import { billingReady, ORDER_ID, PAYMENT_ID, razorpayKeys, verifyCheckoutSignature } from '@/lib/billing/razorpay';
import { identityFrom } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };

/**
 * Step 2 of paying: Razorpay Checkout calls back in the browser with a signed receipt. We check the signature,
 * then read the payment and order back from Razorpay with our secret key before granting anything, so a forged
 * request cannot unlock a plan. The webhook covers the case where the browser never gets here.
 */
export async function POST(req: Request) {
  const keys = razorpayKeys();
  if (!billingReady() || !keys) return NextResponse.json({ error: 'Billing is not enabled yet.', code: 'billing_disabled' }, { status: 503, headers: NO_STORE });
  const { uid } = identityFrom(req);
  if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401, headers: NO_STORE });

  const read = await readJsonLimited<{ razorpay_order_id?: unknown; razorpay_payment_id?: unknown; razorpay_signature?: unknown }>(req, 2048);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status, headers: NO_STORE });
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = read.data ?? {};
  if (typeof orderId !== 'string' || !ORDER_ID.test(orderId) || typeof paymentId !== 'string' || !PAYMENT_ID.test(paymentId) || typeof signature !== 'string') {
    return NextResponse.json({ error: 'Invalid payment details.' }, { status: 400, headers: NO_STORE });
  }
  if (!verifyCheckoutSignature(orderId, paymentId, signature, keys.keySecret)) {
    console.warn(`[billing] bad checkout signature for ${paymentId} (user ${uid})`);
    return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400, headers: NO_STORE });
  }

  try {
    const outcome = await fulfilPayment({ paymentId, orderId, expectedUid: uid }, liveFulfilDeps());
    switch (outcome.status) {
      case 'applied':
        return NextResponse.json({ ok: true, plan: outcome.plan, periodEnd: outcome.periodEnd }, { headers: NO_STORE });
      case 'pending':
        // Paid but Razorpay has not finished capturing: the webhook will finish it. Do not tell them to pay again.
        return NextResponse.json({ ok: false, pending: true, message: 'Your payment is being confirmed. Your plan will switch on within a minute. Please do not pay again.' }, { status: 202, headers: NO_STORE });
      case 'ignored':
        return NextResponse.json({ error: 'This payment is not for a TomatoAI plan.' }, { status: 400, headers: NO_STORE });
      case 'rejected':
        console.error(`[billing] verify rejected ${paymentId} for ${uid}: ${outcome.reason}`);
        return NextResponse.json({ error: 'We could not activate this payment automatically. Contact support with your payment id: ' + paymentId }, { status: 409, headers: NO_STORE });
    }
  } catch (error) {
    // Money may have been taken: keep the message calm and tell them it will self-heal through the webhook.
    console.error(`[billing] verify failed for ${paymentId}:`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Payment received, but activating it hit a snag. It will be retried automatically; please do not pay again.', code: 'retrying' }, { status: 500, headers: NO_STORE });
  }
}
