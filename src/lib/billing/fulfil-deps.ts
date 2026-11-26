import 'server-only';

import { getStore } from '@/lib/growth';
import type { GrowthStore } from '@/lib/growth/types';
import type { FulfilDeps } from './fulfil';
import { applyEntitlementToUser } from './plan-sink';
import { capturePayment, fetchOrder, fetchPayment } from './razorpay';

/**
 * Payments must never be silently skipped, so unlike credits and streaks this does NOT go through
 * `withStore` (which swallows errors). If storage is missing or failing we throw: the browser callback
 * answers an error and the webhook answers 500, so Razorpay retries until we are healthy again.
 */
function requireStore(): GrowthStore {
  const store = getStore();
  if (!store) throw new Error('Payment ledger is not available: run supabase-growth.sql and set SUPABASE_SERVICE_ROLE_KEY');
  return store;
}

export function liveFulfilDeps(): FulfilDeps {
  return {
    fetchPayment,
    fetchOrder,
    capturePayment,
    claim: (input) => requireStore().claimPayment(input),
    entitlement: (uid, now) => requireStore().paymentEntitlement(uid, now),
    applyEntitlement: applyEntitlementToUser,
    markApplied: (paymentId) => requireStore().markPaymentApplied(paymentId),
    refund: (paymentId) => requireStore().refundPayment(paymentId),
    now: () => Math.floor(Date.now() / 1000),
  };
}
