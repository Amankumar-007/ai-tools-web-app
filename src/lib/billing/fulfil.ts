import { isPaidPlan, periodSeconds, type Interval, type PaidPlanId } from './plans';
import type { PaymentClaim, PaymentClaimInput, PaymentEntitlement } from '../growth/types';

/**
 * Turns "Razorpay says this payment exists" into "this user has plan X until Y".
 *
 * Pure: every side effect is injected (`FulfilDeps`), so each branch is unit-tested without Razorpay or a
 * database. It is called from BOTH the browser callback (/api/billing/verify) and the webhook; whichever
 * arrives first does the work and the other finds it already done, because the payment ledger is keyed by
 * Razorpay's payment id.
 */

export interface PaymentLike { id: string; order_id: string | null; status: string; amount: number; currency: string; amount_refunded?: number; refund_status?: string | null }
export interface OrderLike { id: string; amount: number; currency: string; status: string; notes?: unknown }

export interface FulfilDeps {
  fetchPayment(id: string): Promise<PaymentLike>;
  fetchOrder(id: string): Promise<OrderLike>;
  capturePayment(id: string, amount: number, currency: string): Promise<PaymentLike>;
  claim(input: PaymentClaimInput): Promise<PaymentClaim>;
  entitlement(uid: string, now: number): Promise<PaymentEntitlement | null>;
  applyEntitlement(uid: string, entitlement: PaymentEntitlement | null, now: number): Promise<void>;
  markApplied(paymentId: string): Promise<void>;
  refund(paymentId: string): Promise<{ ok: boolean; uid?: string; changed?: boolean }>;
  now(): number;
}

export type FulfilOutcome =
  /** The plan is active (now, or already was). */
  | { status: 'applied'; uid: string; plan: PaidPlanId; periodEnd: number; created: boolean }
  /** Not ours, or nothing to do (e.g. another product on the same Razorpay account). */
  | { status: 'ignored'; reason: string }
  /** Razorpay has not captured the money (yet). Not an error: the webhook will deliver the capture. */
  | { status: 'pending'; reason: string }
  /** Something is wrong and a human may need to look. */
  | { status: 'rejected'; reason: string; uid?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface OrderIntent { uid: string; plan: PaidPlanId; interval: Interval }

/** What we wrote into the order's notes when WE created it. Anything else is not our payment. */
export function intentFromNotes(notes: unknown): OrderIntent | null {
  if (!notes || typeof notes !== 'object' || Array.isArray(notes)) return null;
  const n = notes as Record<string, unknown>;
  const interval = n.interval === 'year' ? 'year' : n.interval === 'month' ? 'month' : null;
  if (typeof n.uid !== 'string' || !UUID.test(n.uid) || !isPaidPlan(n.plan) || !interval) return null;
  return { uid: n.uid.toLowerCase(), plan: n.plan, interval };
}

export async function fulfilPayment(
  input: { paymentId: string; orderId?: string; expectedUid?: string },
  deps: FulfilDeps
): Promise<FulfilOutcome> {
  let payment = await deps.fetchPayment(input.paymentId);
  const orderId = payment.order_id;
  if (!orderId) return { status: 'ignored', reason: 'payment has no order' };
  if (input.orderId && orderId !== input.orderId) return { status: 'rejected', reason: 'payment does not belong to this order' };

  if (payment.status === 'authorized') {
    // Money is held but not taken. Capture it, or Razorpay auto-refunds after a few days.
    try {
      payment = await deps.capturePayment(payment.id, payment.amount, payment.currency);
    } catch {
      payment = await deps.fetchPayment(input.paymentId); // maybe a parallel call (browser vs webhook) captured it first
    }
  }
  if (payment.status === 'refunded') return { status: 'ignored', reason: 'payment was refunded' };
  if (payment.status !== 'captured') return { status: 'pending', reason: `payment is ${payment.status}` };

  const order = await deps.fetchOrder(orderId);
  const intent = intentFromNotes(order.notes);
  if (!intent) return { status: 'ignored', reason: 'order was not created by this app' };
  if (input.expectedUid && intent.uid !== input.expectedUid.toLowerCase()) return { status: 'rejected', reason: 'payment belongs to a different account', uid: intent.uid };
  if (order.currency !== payment.currency || payment.amount < order.amount) return { status: 'rejected', reason: 'paid amount does not match the order', uid: intent.uid };

  const now = deps.now();
  const claim = await deps.claim({
    paymentId: payment.id,
    orderId: order.id,
    uid: intent.uid,
    plan: intent.plan,
    period: intent.interval,
    amount: payment.amount,
    currency: payment.currency,
    now,
    duration: periodSeconds(intent.interval),
  });
  if (!claim.ok) return { status: 'rejected', reason: claim.reason, uid: intent.uid };
  if (claim.status === 'refunded') return { status: 'ignored', reason: 'payment was refunded' };

  // Always re-derive the plan from the ledger (idempotent), so retries and out-of-order deliveries converge.
  const entitlement = await deps.entitlement(intent.uid, now);
  await deps.applyEntitlement(intent.uid, entitlement, now);
  await deps.markApplied(payment.id);

  if (claim.status === 'superseded') return { status: 'rejected', reason: 'a higher plan was already active; this payment needs a manual refund', uid: intent.uid };
  return { status: 'applied', uid: intent.uid, plan: claim.plan, periodEnd: entitlement?.periodEnd ?? claim.periodEnd, created: claim.created };
}

export interface RazorpayEventLike { event: string; payload?: Record<string, { entity?: Record<string, unknown> } | undefined> }
export interface HandleResult { handled: boolean; detail: string }

/** Webhook events -> actions. Unknown events are acknowledged and ignored so Razorpay does not keep retrying them. */
export async function handleRazorpayEvent(event: RazorpayEventLike, deps: FulfilDeps): Promise<HandleResult> {
  const payment = event.payload?.payment?.entity as { id?: unknown; order_id?: unknown } | undefined;
  const refund = event.payload?.refund?.entity as { payment_id?: unknown } | undefined;

  switch (event.event) {
    case 'payment.authorized':
    case 'payment.captured':
    case 'order.paid': {
      if (typeof payment?.id !== 'string') return { handled: false, detail: 'event has no payment id' };
      const outcome = await fulfilPayment({ paymentId: payment.id, orderId: typeof payment.order_id === 'string' ? payment.order_id : undefined }, deps);
      return { handled: outcome.status === 'applied', detail: `${outcome.status}${'reason' in outcome ? `: ${outcome.reason}` : ''}` };
    }
    case 'refund.processed': {
      const paymentId = refund?.payment_id;
      if (typeof paymentId !== 'string') return { handled: false, detail: 'event has no payment id' };
      const current = await deps.fetchPayment(paymentId);
      const full = current.status === 'refunded' || current.refund_status === 'full' || (current.amount_refunded ?? 0) >= current.amount;
      if (!full) return { handled: false, detail: 'partial refund: plan unchanged' };
      const result = await deps.refund(paymentId);
      if (!result.ok || !result.uid) return { handled: false, detail: 'refund for a payment we never recorded' };
      const now = deps.now();
      await deps.applyEntitlement(result.uid, await deps.entitlement(result.uid, now), now);
      return { handled: true, detail: 'refunded: access removed' };
    }
    default:
      return { handled: false, detail: `ignored ${event.event}` };
  }
}
