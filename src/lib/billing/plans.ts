/**
 * Plans, prices and limits: the ONE place to change them. The pricing page, the checkout, the quota
 * meter and the rate-limit multipliers all read from here, so what you advertise is what is enforced.
 *
 * Every limit can be overridden per environment (e.g. PLAN_FREE_CHAT_PER_DAY=30) without a deploy of code.
 * Safe to import from the browser and from the Edge middleware (pure, no I/O).
 */

export type PlanId = 'free' | 'pro' | 'premium';
export type PaidPlanId = Exclude<PlanId, 'free'>;
export type Interval = 'month' | 'year';
export type Currency = 'usd' | 'inr';

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'premium'];

export interface PlanLimits {
  /** AI chat messages per day (resets at midnight IST). */
  chatPerDay: number;
  /** Runs of the other AI tools per day (resume, summarizer, prompt, roadmap, image...). */
  toolPerDay: number;
  /** Multiplier on the per-minute request limits in the middleware (higher plans can burst more). */
  burstMultiplier: number;
}

const DEFAULT_LIMITS: Record<PlanId, PlanLimits> = {
  free: { chatPerDay: 20, toolPerDay: 5, burstMultiplier: 1 },
  pro: { chatPerDay: 300, toolPerDay: 100, burstMultiplier: 2 },
  premium: { chatPerDay: 1000, toolPerDay: 400, burstMultiplier: 4 },
};

function envInt(name: string, fallback: number): number {
  const raw = typeof process !== 'undefined' ? process.env[name] : undefined;
  const n = Number(raw);
  return raw !== undefined && raw !== '' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export function planLimits(plan: PlanId): PlanLimits {
  const base = DEFAULT_LIMITS[plan];
  const key = plan.toUpperCase();
  return {
    chatPerDay: envInt(`PLAN_${key}_CHAT_PER_DAY`, base.chatPerDay),
    toolPerDay: envInt(`PLAN_${key}_TOOL_PER_DAY`, base.toolPerDay),
    burstMultiplier: base.burstMultiplier,
  };
}

/** Prices in the currency's smallest unit (cents / paise). Sent to Razorpay with each order, so there are no plan objects to create in its dashboard. */
const PRICES: Record<Currency, Record<PaidPlanId, Record<Interval, number>>> = {
  usd: {
    pro: { month: 999, year: 9999 },
    premium: { month: 1999, year: 19999 },
  },
  inr: {
    pro: { month: 49900, year: 499900 },
    premium: { month: 99900, year: 999900 },
  },
};

export function billingCurrency(): Currency {
  // Razorpay accounts bill in INR out of the box; USD only works once international payments are enabled on the account.
  const raw = typeof process !== 'undefined' ? (process.env.BILLING_CURRENCY || '').toLowerCase() : '';
  return raw === 'usd' ? 'usd' : 'inr';
}

export function planPrice(plan: PaidPlanId, interval: Interval, currency: Currency = billingCurrency()): number {
  return PRICES[currency][plan][interval];
}

export function formatMoney(minorUnits: number, currency: Currency): string {
  const value = minorUnits / 100;
  return new Intl.NumberFormat(currency === 'inr' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const PLAN_NAMES: Record<PlanId, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

export const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, premium: 2 };

/** Length of one paid period. Plans are prepaid: you buy 30 days or 365 days, and renew when you like. */
export function periodSeconds(interval: Interval): number {
  return (interval === 'year' ? 365 : 30) * 24 * 60 * 60;
}

export function isPlanId(value: unknown): value is PlanId {
  return value === 'free' || value === 'pro' || value === 'premium';
}
export function isPaidPlan(value: unknown): value is PaidPlanId {
  return value === 'pro' || value === 'premium';
}

/** Plan states that keep paid access. The webhook/ledger sets 'active' on purchase and 'ended' on refund or expiry. */
const ACTIVE_STATUSES = new Set(['active']);

export interface PlanMetadata {
  plan?: unknown;
  plan_status?: unknown;
  /** Unix seconds when the prepaid period ends. */
  plan_period_end?: unknown;
}

/**
 * The plan a user gets RIGHT NOW, from the metadata the payment flow keeps on their account.
 * Plans are prepaid, so access ends exactly at the period end: no end date means no paid access.
 */
export function effectivePlan(meta: PlanMetadata | null | undefined, nowSeconds: number = Math.floor(Date.now() / 1000)): PlanId {
  if (!meta || !isPaidPlan(meta.plan)) return 'free';
  if (typeof meta.plan_status !== 'string' || !ACTIVE_STATUSES.has(meta.plan_status)) return 'free';
  const end = Number(meta.plan_period_end);
  if (!Number.isFinite(end) || end <= nowSeconds) return 'free';
  return meta.plan;
}

/** When the current paid period ends (unix seconds), or null on the free plan. */
export function planEndsAt(meta: PlanMetadata | null | undefined, nowSeconds: number = Math.floor(Date.now() / 1000)): number | null {
  return effectivePlan(meta, nowSeconds) === 'free' ? null : Number(meta?.plan_period_end);
}

/** Plain-language feature list for the pricing page: only things that are actually enforced. */
export function planFeatures(plan: PlanId): string[] {
  const l = planLimits(plan);
  const features = [
    `${l.chatPerDay.toLocaleString('en-US')} AI chat messages per day`,
    `${l.toolPerDay.toLocaleString('en-US')} AI tool runs per day`,
    'Unlimited use of the 10 on-device Daily Tools (calculators and utilities)',
    'Chat with PDFs, documents and images',
    'Automatic best-model routing',
  ];
  if (l.burstMultiplier > 1) features.push(`${l.burstMultiplier}x higher burst speed limits`);
  features.push(plan === 'free' ? 'Earn bonus credits: invite friends, keep a daily streak' : 'Bonus credits from referrals and streaks on top');
  return features;
}
