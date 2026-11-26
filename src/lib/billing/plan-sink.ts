import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PaymentEntitlement } from '../growth/types';

let admin: SupabaseClient | null = null;

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  admin ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/**
 * Writes the user's current plan onto their Supabase account (app_metadata, which only the service role can
 * change), so every request can read it from their verified token with no database lookup.
 *
 * This is only a cache of the payment ledger: the caller always passes what the ledger says RIGHT NOW, so
 * calling it twice, late or out of order, converges on the truth. `null` means "no active paid plan".
 */
export async function applyEntitlementToUser(uid: string, entitlement: PaymentEntitlement | null, now: number): Promise<void> {
  const client = adminClient();
  const { data, error } = await client.auth.admin.getUserById(uid);
  if (error || !data.user) throw new Error(`user ${uid} not found: ${error?.message ?? 'no user'}`);

  const meta = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  const next = entitlement
    ? { plan: entitlement.plan, plan_status: 'active', plan_period_end: entitlement.periodEnd, plan_interval: entitlement.period, last_payment_id: entitlement.paymentId, plan_updated_at: now }
    : { plan_status: 'ended', plan_period_end: now, plan_updated_at: now };

  const { error: updateError } = await client.auth.admin.updateUserById(uid, { app_metadata: { ...meta, ...next } });
  if (updateError) throw new Error(`could not update plan: ${updateError.message}`);
}
