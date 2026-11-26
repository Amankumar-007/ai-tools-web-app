import { normalizeReferralCode } from './config';

/**
 * Remembers an invite code in this browser until the visitor signs in. Kept apart from client.ts (which talks to the
 * server through the signed-in fetch) so that reading it never downloads the sign-in client.
 */

const REF_KEY = 'tomato_ref';
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Remember the code from an invite link until the visitor signs in (works across the sign-up flow). */
export function rememberReferral(raw: string | null | undefined): boolean {
  const code = normalizeReferralCode(raw);
  if (!code) return false;
  try { localStorage.setItem(REF_KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* private mode */ }
  return true;
}

export function pendingReferral(): string | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number };
    if (!at || Date.now() - at > REF_TTL_MS) { localStorage.removeItem(REF_KEY); return null; }
    return normalizeReferralCode(code);
  } catch { return null; }
}

export function forgetReferral() {
  try { localStorage.removeItem(REF_KEY); } catch { /* ignore */ }
}
