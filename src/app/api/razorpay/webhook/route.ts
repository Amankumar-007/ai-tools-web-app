import { NextResponse } from 'next/server';
import { handleRazorpayEvent, type RazorpayEventLike } from '@/lib/billing/fulfil';
import { liveFulfilDeps } from '@/lib/billing/fulfil-deps';
import { billingReady, verifyWebhookSignature } from '@/lib/billing/razorpay';

export const runtime = 'nodejs';

/**
 * Razorpay calls this when a payment is captured or refunded, whether or not the buyer's browser is still open.
 * The signature check is the only authentication: anything not signed with our webhook secret is rejected.
 * Returns 500 on our own failures so Razorpay retries (it retries for ~24h); handling an event twice is harmless
 * because grants are keyed by payment id.
 *
 * Dashboard -> Account & Settings -> Webhooks -> add https://YOUR-DOMAIN/api/razorpay/webhook with events:
 *   payment.authorized, payment.captured, order.paid, refund.processed
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !billingReady()) {
    console.error('[billing] webhook called but billing is not fully configured');
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  // The signature covers the exact bytes Razorpay sent, so read the raw text before parsing.
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, signature, secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

  let event: RazorpayEventLike;
  try { event = JSON.parse(raw) as RazorpayEventLike; } catch { return NextResponse.json({ error: 'Bad payload' }, { status: 400 }); }
  if (typeof event?.event !== 'string') return NextResponse.json({ error: 'Bad payload' }, { status: 400 });

  try {
    const result = await handleRazorpayEvent(event, liveFulfilDeps());
    if (!result.handled && /rejected|never recorded/.test(result.detail)) console.warn(`[billing] ${event.event}: ${result.detail}`);
    return NextResponse.json({ received: true, detail: result.detail });
  } catch (error) {
    console.error(`[billing] failed to process ${event.event}:`, error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
