import 'server-only';

import crypto from 'node:crypto';

/**
 * Razorpay, server side. Plans are PREPAID: each purchase is one Razorpay Order for 30 days or a year, paid
 * through Razorpay Checkout (UPI, cards, netbanking, wallets). Prepaid works for every Razorpay account
 * immediately (recurring "subscriptions" need extra activation) and avoids failed auto-debits.
 *
 * Nothing here trusts the browser: a payment only counts after we (1) verify Razorpay's signature and
 * (2) read the payment and order back from Razorpay's API with our secret key.
 */

const API_BASE = () => (process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com').replace(/\/+$/, '');

export const ORDER_ID = /^order_[A-Za-z0-9]{6,40}$/;
export const PAYMENT_ID = /^pay_[A-Za-z0-9]{6,40}$/;

export function razorpayKeys(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
}

/**
 * Billing is only switched on when EVERYTHING needed to take AND deliver a payment is configured:
 * the API keys, the webhook secret (the safety net when someone pays and closes the tab) and the Supabase
 * service key (to grant the plan). Otherwise checkout stays off and the pricing page offers a waitlist.
 */
export function billingReady(): boolean {
  return Boolean(
    razorpayKeys() &&
    process.env.RAZORPAY_WEBHOOK_SECRET &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export class RazorpayError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
    this.name = 'RazorpayError';
  }
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const keys = razorpayKeys();
  if (!keys) throw new RazorpayError(500, 'not_configured', 'Razorpay keys are not set');
  const response = await fetch(`${API_BASE()}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64')}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  const text = await response.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!response.ok) {
    const err = (json as { error?: { code?: string; description?: string } } | null)?.error;
    throw new RazorpayError(response.status, err?.code || 'http_error', err?.description || `Razorpay returned ${response.status}`);
  }
  return json as T;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid?: number;
  currency: string;
  status: string;
  receipt?: string | null;
  /** Razorpay returns [] (an empty array) when an order has no notes. */
  notes?: Record<string, string> | unknown[];
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  status: string; // created | authorized | captured | refunded | failed
  amount: number;
  currency: string;
  amount_refunded?: number;
  refund_status?: string | null;
}

export function createOrder(input: { amount: number; currency: string; receipt: string; notes: Record<string, string> }): Promise<RazorpayOrder> {
  return call<RazorpayOrder>('POST', '/v1/orders', input);
}

export function fetchOrder(id: string): Promise<RazorpayOrder> {
  if (!ORDER_ID.test(id)) throw new RazorpayError(400, 'bad_id', 'Invalid order id');
  return call<RazorpayOrder>('GET', `/v1/orders/${id}`);
}

export function fetchPayment(id: string): Promise<RazorpayPayment> {
  if (!PAYMENT_ID.test(id)) throw new RazorpayError(400, 'bad_id', 'Invalid payment id');
  return call<RazorpayPayment>('GET', `/v1/payments/${id}`);
}

/** Orders can be configured to leave payments "authorized"; those must be captured or Razorpay refunds them after ~5 days. */
export function capturePayment(id: string, amount: number, currency: string): Promise<RazorpayPayment> {
  if (!PAYMENT_ID.test(id)) throw new RazorpayError(400, 'bad_id', 'Invalid payment id');
  return call<RazorpayPayment>('POST', `/v1/payments/${id}/capture`, { amount, currency });
}

function safeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/i.test(a) || !/^[0-9a-f]{64}$/i.test(b)) return false;
  return crypto.timingSafeEqual(Buffer.from(a.toLowerCase(), 'hex'), Buffer.from(b.toLowerCase(), 'hex'));
}

/** The signature Razorpay Checkout hands the browser after a successful payment: HMAC-SHA256("order_id|payment_id"). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256 of the exact raw request body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}
