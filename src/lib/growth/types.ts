import type { Interval, PaidPlanId, PlanId } from '../billing/plans';

export type Kind = 'chat' | 'tool';
export type QuotaSource = 'daily' | 'credit';

export interface Profile {
  uid: string;
  referralCode: string;
  credits: number;
  streak: number;
  longestStreak: number;
  lastActive: string | null;
  referredBy: string | null;
  referralStatus: 'pending' | 'completed' | null;
  referralsCompleted: number;
  referralsPending: number;
}

export interface ConsumeResult {
  ok: boolean;
  source?: QuotaSource;
  used: number;
  limit: number;
  credits: number;
  referralCompleted?: boolean;
  referralBonus?: number;
}

export interface TouchResult {
  firstToday: boolean;
  streak: number;
  longestStreak: number;
  awarded: number;
}

export type ClaimReason = 'invalid_code' | 'self' | 'already_referred' | 'not_new';
export type ClaimResult = { ok: true } | { ok: false; reason: ClaimReason };

export interface GrowthStats {
  profiles: number;
  referralsCompleted: number;
  referralsPending: number;
  subscribers: number;
  activeToday: number;
  chatToday: number;
  toolToday: number;
  creditsOutstanding: number;
  /** Paid purchases that have not been refunded. */
  payments: number;
  /** Money taken per currency, in minor units (paise). */
  revenue: Record<string, number>;
}

export interface Subscriber { email: string; source: string | null; createdAt: string }

export interface PaymentClaimInput {
  paymentId: string;
  orderId: string;
  uid: string;
  plan: PaidPlanId;
  period: Interval;
  /** Minor units (paise). */
  amount: number;
  currency: string;
  /** Unix seconds. */
  now: number;
  /** Seconds this purchase buys. */
  duration: number;
}
export type PaymentStatus = 'paid' | 'refunded' | 'superseded';
export type PaymentClaim =
  | { ok: false; reason: string }
  | { ok: true; created: boolean; applied: boolean; status: PaymentStatus; uid: string; plan: PaidPlanId; period: Interval; periodStart: number; periodEnd: number; reason: string | null };
export interface PaymentEntitlement { plan: PaidPlanId; period: Interval; periodEnd: number; paymentId: string }

/** Everything the growth features need from storage. Two implementations: Postgres (RPC) and in-memory. */
export interface GrowthStore {
  readonly kind: string;
  profile(uid: string): Promise<Profile>;
  consume(uid: string, kind: Kind, limit: number, day: string): Promise<ConsumeResult>;
  refund(uid: string, kind: Kind, day: string, source: QuotaSource): Promise<void>;
  usageToday(uid: string, day: string): Promise<Record<Kind, number>>;
  touch(uid: string, day: string): Promise<TouchResult>;
  claimReferral(uid: string, code: string): Promise<ClaimResult>;
  subscribe(email: string, source: string | null): Promise<{ ok: boolean; already: boolean }>;
  unsubscribe(token: string): Promise<boolean>;
  subscribers(): Promise<Subscriber[]>;
  stats(day: string): Promise<GrowthStats>;

  // Payments. Unlike the rest, a failure here must be loud (never swallowed): money is involved.
  claimPayment(input: PaymentClaimInput): Promise<PaymentClaim>;
  paymentEntitlement(uid: string, now: number): Promise<PaymentEntitlement | null>;
  markPaymentApplied(paymentId: string): Promise<void>;
  refundPayment(paymentId: string): Promise<{ ok: boolean; uid?: string; changed?: boolean; reason?: string }>;
}

/** Thrown when the database is not set up for growth features yet (migration not applied). */
export class GrowthUnavailableError extends Error {
  constructor(message = 'Growth storage is not available') { super(message); this.name = 'GrowthUnavailableError'; }
}

/** What /api/growth/me returns: everything the account page and the usage chip need. */
export interface GrowthSummary {
  /** False when the database is not set up: the UI then hides credits, streaks and referrals. */
  enabled: boolean;
  plan: PlanId;
  planName: string;
  limits: { chat: number; tool: number };
  resetAt: number;
  billing: { ready: boolean; /** When the paid period ends (unix seconds); null on Free. */ endsAt: number | null };
  usage?: { chat: number; tool: number };
  /** Allowance left today plus bonus credits. */
  remaining?: { chat: number; tool: number };
  credits?: number;
  streak?: number;
  longestStreak?: number;
  referral?: { code: string; completed: number; pending: number; refereeBonus: number; referrerBonus: number; monthlyCap: number; wasReferred: boolean };
}
