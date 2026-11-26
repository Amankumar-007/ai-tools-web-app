/**
 * Referral, streak and quota-reset rules. Edge-safe and browser-safe (pure, no I/O).
 */

/** Bonus credits (1 credit = 1 extra AI message or tool run, beyond the daily allowance). */
export const REFERRAL = {
  /** Paid to the new user when they first use the product. */
  refereeBonus: 20,
  /** Paid to the person who invited them. */
  referrerBonus: 20,
  /** Most referral rewards one person can earn per calendar month (anti-farming). */
  referrerMonthlyCap: 20,
} as const;

/** Streak length (consecutive days) -> bonus credits. */
export const STREAK_MILESTONES: Record<number, number> = { 3: 5, 7: 10, 14: 20, 30: 50, 60: 100, 100: 200 };

/** Daily limits reset at midnight in this UTC offset. 330 = IST (UTC+5:30). */
export const RESET_OFFSET_MINUTES = 330;
export const RESET_LABEL = 'midnight IST';

export function dayKey(now: number = Date.now()): string {
  return new Date(now + RESET_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10);
}

/** Unix ms of the next reset. */
export function nextResetAt(now: number = Date.now()): number {
  const local = now + RESET_OFFSET_MINUTES * 60_000;
  const nextLocalMidnight = Math.floor(local / 86_400_000) * 86_400_000 + 86_400_000;
  return nextLocalMidnight - RESET_OFFSET_MINUTES * 60_000;
}

export const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}
