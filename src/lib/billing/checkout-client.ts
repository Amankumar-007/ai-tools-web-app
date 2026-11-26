/** Browser side of paying with Razorpay Checkout. The server decides price and plan; this only opens the payment window. */

import { authFetch } from '@/lib/auth-fetch';
import { supabase } from '@/lib/supabase-browser';
import type { Interval, PaidPlanId } from './plans';

interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  notes?: Record<string, string>;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
}
interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void): void;
}
declare global {
  interface Window { Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('browser only'));
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve() : reject(new Error('Razorpay did not load')));
    script.onerror = () => { scriptPromise = null; script.remove(); reject(new Error('Could not load the payment window. Check your connection or ad-blocker.')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type CheckoutResult =
  | { status: 'paid'; plan: PaidPlanId }
  /** Paid, but the server is still confirming: tell the user not to pay again. */
  | { status: 'pending'; message: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'signed-out' };

interface OrderResponse { keyId: string; orderId: string; amount: number; currency: string; name: string; description: string; error?: string; code?: string }

export async function startCheckout(plan: PaidPlanId, interval: Interval, email?: string): Promise<CheckoutResult> {
  const res = await authFetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, interval }) });
  const order = (await res.json().catch(() => ({}))) as Partial<OrderResponse>;
  if (res.status === 401) return { status: 'signed-out' };
  if (res.status === 503) return { status: 'unavailable', message: order.error || 'Paid plans are not open yet.' };
  if (!res.ok || !order.orderId || !order.keyId || !order.amount || !order.currency) return { status: 'failed', message: order.error || 'Could not start checkout. Please try again.' };

  try { await loadCheckoutScript(); } catch (error) { return { status: 'failed', message: error instanceof Error ? error.message : 'Could not load the payment window.' }; }
  const Razorpay = window.Razorpay!;

  return new Promise<CheckoutResult>((resolve) => {
    let settled = false;
    const finish = (result: CheckoutResult) => { if (!settled) { settled = true; resolve(result); } };

    const checkout = new Razorpay({
      key: order.keyId!,
      order_id: order.orderId!,
      amount: order.amount!,
      currency: order.currency!,
      name: order.name || 'TomatoAI',
      description: order.description || 'TomatoAI plan',
      prefill: email ? { email } : undefined,
      theme: { color: '#f97316' },
      modal: { confirm_close: true, ondismiss: () => finish({ status: 'cancelled' }) },
      handler: async (response) => {
        try {
          const verify = await authFetch('/api/billing/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) });
          const body = (await verify.json().catch(() => ({}))) as { ok?: boolean; pending?: boolean; message?: string; error?: string };
          if (verify.ok && body.ok) {
            // The plan lives in the sign-in token: refresh it so the new plan applies immediately.
            await supabase.auth.refreshSession().catch(() => {});
            return finish({ status: 'paid', plan });
          }
          if (verify.status === 202 || body.pending) return finish({ status: 'pending', message: body.message || 'Your payment is being confirmed. Your plan will switch on within a minute. Please do not pay again.' });
          // The money may have been taken: never suggest paying again.
          finish({ status: 'pending', message: body.error || 'Payment received. Your plan will switch on shortly. Please do not pay again.' });
        } catch {
          finish({ status: 'pending', message: 'Payment received, but we could not confirm it just now. Your plan will switch on shortly. Please do not pay again.' });
        }
      },
    });
    checkout.on('payment.failed', (response) => {
      // The window stays open so they can retry with another method; only report it, do not settle.
      console.warn('[checkout] payment attempt failed:', response.error?.description);
    });
    checkout.open();
  });
}
