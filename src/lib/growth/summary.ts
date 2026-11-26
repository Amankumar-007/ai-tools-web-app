import 'server-only';

import { billingReady } from '@/lib/billing/razorpay';
import { planLimits, PLAN_NAMES, type PlanId } from '@/lib/billing/plans';

export type { GrowthSummary };
import { dayKey, nextResetAt, REFERRAL } from './config';
import { withStore } from './index';
import type { GrowthSummary } from './types';


export async function buildSummary(uid: string, plan: PlanId, planEnd: number | null): Promise<GrowthSummary> {
  const limits = planLimits(plan);
  const day = dayKey();
  const base = {
    plan,
    planName: PLAN_NAMES[plan],
    limits: { chat: limits.chatPerDay, tool: limits.toolPerDay },
    resetAt: nextResetAt(),
    billing: { ready: billingReady(), endsAt: plan === 'free' ? null : planEnd },
  };

  const data = await withStore(async (store) => ({ profile: await store.profile(uid), usage: await store.usageToday(uid, day) }));
  if (!data) return { enabled: false, ...base };

  const { profile, usage } = data;
  return {
    enabled: true,
    ...base,
    usage,
    remaining: {
      chat: Math.max(limits.chatPerDay - usage.chat, 0) + profile.credits,
      tool: Math.max(limits.toolPerDay - usage.tool, 0) + profile.credits,
    },
    credits: profile.credits,
    streak: profile.streak,
    longestStreak: profile.longestStreak,
    referral: {
      code: profile.referralCode,
      completed: profile.referralsCompleted,
      pending: profile.referralsPending,
      refereeBonus: REFERRAL.refereeBonus,
      referrerBonus: REFERRAL.referrerBonus,
      monthlyCap: REFERRAL.referrerMonthlyCap,
      wasReferred: Boolean(profile.referredBy),
    },
  };
}
