import 'server-only';

import { isPlanId, planLimits, PLAN_NAMES, type PlanId } from '@/lib/billing/plans';
import { hit } from '@/lib/security/ratelimit';
import { dayKey, nextResetAt, RESET_LABEL } from './config';
import { withStore } from './index';
import type { Kind, QuotaSource } from './types';

/** Trusted identity, set by the middleware (it overwrites anything the client sent). */
export function identityFrom(req: Request): { uid: string | null; plan: PlanId } {
  const uid = req.headers.get('x-tomato-uid');
  const plan = req.headers.get('x-tomato-plan');
  return { uid: uid && /^[0-9a-f-]{36}$/i.test(uid) ? uid : null, plan: isPlanId(plan) ? plan : 'free' };
}

/** When the caller's paid plan ends (unix seconds), from the trusted header the middleware sets. */
export function planEndFrom(req: Request): number | null {
  const n = Number(req.headers.get('x-tomato-plan-end'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export interface QuotaGranted {
  ok: true;
  /** Messages/runs left today (allowance plus bonus credits). Null for anonymous callers. */
  remaining: number | null;
  limit: number | null;
  credits: number;
  headers: Record<string, string>;
  /** Call when the work could not be delivered, to give the unit back. */
  refund: () => Promise<void>;
}
export interface QuotaDenied { ok: false; response: Response }

const NOOP = async () => {};

function denied(kind: Kind, plan: PlanId, limit: number, used: number): QuotaDenied {
  const resetAt = nextResetAt();
  const what = kind === 'chat' ? 'AI messages' : 'AI tool runs';
  const message = plan === 'free'
    ? `You've used all ${limit} free ${what} for today. They reset at ${RESET_LABEL}. Upgrade, or invite a friend to earn bonus credits.`
    : `You've reached your daily limit of ${limit} ${what}. It resets at ${RESET_LABEL}.`;
  return {
    ok: false,
    response: Response.json(
      { error: message, code: 'quota', kind, plan, limit, used, credits: 0, resetAt, upgradeUrl: '/pricing' },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))) } }
    ),
  };
}

/**
 * Spend one unit of the caller's daily allowance (then bonus credits) for `kind`.
 * Anonymous callers pass through: the middleware already limits them per IP.
 * Uses the database when available; otherwise a per-day rate-limit counter with the same plan limits.
 */
export async function meter(req: Request, kind: Kind): Promise<QuotaGranted | QuotaDenied> {
  const { uid, plan } = identityFrom(req);
  if (!uid) return { ok: true, remaining: null, limit: null, credits: 0, headers: {}, refund: NOOP };

  const limits = planLimits(plan);
  const limit = kind === 'chat' ? limits.chatPerDay : limits.toolPerDay;
  const day = dayKey();

  const result = await withStore((store) => store.consume(uid, kind, limit, day));
  if (result) {
    if (!result.ok) return denied(kind, plan, limit, result.used);
    const source = result.source as QuotaSource;
    const remaining = Math.max(limit - result.used, 0) + result.credits;
    return {
      ok: true, remaining, limit, credits: result.credits,
      headers: { 'X-Quota-Remaining': String(remaining), 'X-Quota-Limit': String(limit), 'X-Quota-Credits': String(result.credits), 'X-Plan': plan },
      refund: () => withStore((store) => store.refund(uid, kind, day, source)).then(() => {}),
    };
  }

  // No database: still enforce the plan's daily limit (no bonus credits without storage).
  const counter = await hit(`quota:${uid}:${kind}:${day}`, limit, 2 * 86_400);
  if (!counter.ok) return denied(kind, plan, limit, limit);
  const remaining = Math.max(limit - counter.count, 0);
  return {
    ok: true, remaining, limit, credits: 0,
    headers: { 'X-Quota-Remaining': String(remaining), 'X-Quota-Limit': String(limit), 'X-Quota-Credits': '0', 'X-Plan': plan },
    refund: NOOP,
  };
}

/**
 * Wrap a route handler so it spends one unit of the caller's daily quota. The unit is given back when the
 * request fails (any 4xx/5xx), so people are never charged for errors, bad input or provider outages, and on
 * success the response carries X-Quota-* headers so the UI can show what is left without another request.
 */
export function withQuota<Req extends Request>(kind: Kind, handler: (req: Req) => Promise<Response>) {
  return async (req: Req): Promise<Response> => {
    const quota = await meter(req, kind);
    if (!quota.ok) return quota.response;
    let response: Response;
    try {
      response = await handler(req);
    } catch (error) {
      await quota.refund();
      throw error;
    }
    if (response.status >= 400) {
      await quota.refund();
    } else {
      try { for (const [name, value] of Object.entries(quota.headers)) response.headers.set(name, value); } catch { /* immutable response */ }
    }
    return response;
  };
}

export { PLAN_NAMES };
