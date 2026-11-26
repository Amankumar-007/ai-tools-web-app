import 'server-only';

/**
 * What the chat server has learned about its AI providers' limits, kept in memory per server instance.
 *
 * OpenRouter gives a key without credits only 50 free-model requests a day (1000 once 10 credits are added), shared by
 * every visitor. When that is used up every `:free` model answers 429 at once, so trying them one after another only
 * makes the visitor wait. We remember it briefly and go straight to the next provider.
 */

/** Re-check OpenRouter this often even if its reset is later, so adding credits takes effect within minutes. */
const RECHECK_MS = 10 * 60_000;

let freeLimitUntil = 0;
let resetAt = 0;

/** Does this OpenRouter 429 body say the daily free-model allowance is used up? Returns its reset time if known. */
export function parseFreeLimit(bodyText: string): { resetAt?: number } | null {
  try {
    const error = JSON.parse(bodyText)?.error;
    const headers = error?.metadata?.headers;
    const isFreeLimit = error?.metadata?.limit_source === 'openrouter_free_tier_daily' || /free-models-per-day/i.test(String(error?.message ?? ''));
    if (!isFreeLimit) return null;
    const reset = Number(headers?.['X-RateLimit-Reset']);
    return { resetAt: Number.isFinite(reset) && reset > Date.now() ? reset : undefined };
  } catch {
    return null;
  }
}

export function markFreeLimitHit(info: { resetAt?: number } = {}): void {
  freeLimitUntil = Date.now() + RECHECK_MS;
  if (info.resetAt) resetAt = info.resetAt;
}

/** True while OpenRouter's free allowance is known to be used up. */
export function freeLimitActive(): boolean {
  return Date.now() < freeLimitUntil;
}

/** When the free allowance comes back (ms since epoch), if OpenRouter told us. */
export function freeLimitResetAt(): number | null {
  return resetAt > Date.now() ? resetAt : null;
}

/** For tests. */
export function resetProviderState(): void {
  freeLimitUntil = 0;
  resetAt = 0;
}
