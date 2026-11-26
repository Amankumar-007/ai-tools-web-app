import { REFERRAL, STREAK_MILESTONES } from './config';
import {
  GrowthUnavailableError,
  type ClaimResult,
  type ConsumeResult,
  type GrowthStats,
  type GrowthStore,
  type Kind,
  type PaymentClaim,
  type PaymentClaimInput,
  type PaymentEntitlement,
  type Profile,
  type QuotaSource,
  type Subscriber,
  type TouchResult,
} from './types';

/** Calls a database function by name. In production this is `supabase.rpc`; in tests it is a real Postgres. */
export type Rpc = (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { code?: string; message: string } | null }>;

/** Postgres/PostgREST codes that mean "the function (migration) is not there". */
const MISSING = new Set(['PGRST202', '42883', '42P01', 'PGRST205']);

/** Thin mapper: every operation is exactly one atomic SQL function (see supabase-growth.sql). */
export class RpcStore implements GrowthStore {
  constructor(private readonly rpc: Rpc, readonly kind = 'postgres') {}

  private async call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.rpc(fn, args);
    if (error) {
      if (error.code && MISSING.has(error.code)) throw new GrowthUnavailableError(`${fn}: ${error.message}`);
      throw new Error(`${fn} failed: ${error.message}`);
    }
    return data as T;
  }

  profile(uid: string) { return this.call<Profile>('growth_profile', { p_uid: uid }); }

  consume(uid: string, kind: Kind, limit: number, day: string) {
    return this.call<ConsumeResult>('growth_consume', {
      p_uid: uid, p_kind: kind, p_limit: limit, p_day: day,
      p_referee_bonus: REFERRAL.refereeBonus, p_referrer_bonus: REFERRAL.referrerBonus, p_referrer_monthly_cap: REFERRAL.referrerMonthlyCap,
    });
  }

  async refund(uid: string, kind: Kind, day: string, source: QuotaSource) {
    await this.call('growth_refund', { p_uid: uid, p_kind: kind, p_day: day, p_source: source });
  }

  usageToday(uid: string, day: string) { return this.call<Record<Kind, number>>('growth_usage_today', { p_uid: uid, p_day: day }); }
  touch(uid: string, day: string) { return this.call<TouchResult>('growth_touch', { p_uid: uid, p_day: day, p_milestones: STREAK_MILESTONES }); }
  claimReferral(uid: string, code: string) { return this.call<ClaimResult>('growth_claim_referral', { p_uid: uid, p_code: code }); }
  subscribe(email: string, source: string | null) { return this.call<{ ok: boolean; already: boolean }>('growth_subscribe', { p_email: email, p_source: source }); }
  async unsubscribe(token: string) { return (await this.call<{ ok: boolean }>('growth_unsubscribe', { p_token: token })).ok; }
  subscribers() { return this.call<Subscriber[]>('growth_subscribers_export', {}); }
  stats(day: string) { return this.call<GrowthStats>('growth_stats', { p_day: day }); }

  claimPayment(i: PaymentClaimInput) {
    return this.call<PaymentClaim>('growth_payment_claim', {
      p_payment_id: i.paymentId, p_order_id: i.orderId, p_uid: i.uid, p_plan: i.plan, p_period: i.period,
      p_amount: i.amount, p_currency: i.currency, p_now: i.now, p_duration: i.duration,
    });
  }
  paymentEntitlement(uid: string, now: number) { return this.call<PaymentEntitlement | null>('growth_payment_entitlement', { p_uid: uid, p_now: now }); }
  async markPaymentApplied(paymentId: string) { await this.call('growth_payment_mark_applied', { p_payment_id: paymentId }); }
  refundPayment(paymentId: string) { return this.call<{ ok: boolean; uid?: string; changed?: boolean; reason?: string }>('growth_payment_refund', { p_payment_id: paymentId }); }
}
