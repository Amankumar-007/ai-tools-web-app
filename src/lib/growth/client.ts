/** Browser-side helpers for the growth features (quota summary, daily streak, referral links). */

import { authFetch } from '@/lib/auth-fetch';
import { normalizeReferralCode } from './config';
import type { GrowthSummary } from './types';

export { forgetReferral, pendingReferral, rememberReferral } from './referral-store';

export function referralLink(code: string): string {
  return `${window.location.origin}/r/${code}`;
}

export function whatsappShareUrl(link: string, bonus: number): string {
  const text = `I use TomatoAI for AI chat, PDFs and 400+ AI tools. Join with my link and we both get ${bonus} bonus credits: ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function getSummary(): Promise<GrowthSummary | null> {
  try {
    const res = await authFetch('/api/growth/me');
    return res.ok ? ((await res.json()) as GrowthSummary) : null;
  } catch { return null; }
}

export type TouchSummary = GrowthSummary & { touch: { firstToday: boolean; streak: number; longestStreak: number; awarded: number } };

export async function touchToday(): Promise<TouchSummary | null> {
  try {
    const res = await authFetch('/api/growth/touch', { method: 'POST' });
    return res.ok ? ((await res.json()) as TouchSummary) : null;
  } catch { return null; }
}

export async function claimReferral(code: string): Promise<{ ok: boolean; reason?: string; bonus?: number }> {
  try {
    const res = await authFetch('/api/growth/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    return (await res.json()) as { ok: boolean; reason?: string; bonus?: number };
  } catch { return { ok: false, reason: 'unavailable' }; }
}
