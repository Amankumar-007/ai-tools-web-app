/**
 * Fixed-window rate limiter that runs in the Edge runtime (middleware) and Node.
 *
 * Storage:
 *  - If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, counters live in
 *    Redis, so limits hold across every serverless instance and region. This is what
 *    you want in production.
 *  - Otherwise (local dev, or Redis briefly unreachable) an in-memory store is used.
 *    It is bounded in size so it cannot be used to exhaust memory, but it is per
 *    instance: on serverless hosting each instance counts separately.
 */

export type RateResult = {
  ok: boolean;
  limit: number;
  /** Requests used in the current window, including this one. */
  count: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

type Entry = { count: number; resetAt: number };

const MAX_KEYS = 20_000;
const g = globalThis as unknown as { __tomatoRateStore?: Map<string, Entry> };
const memory = (g.__tomatoRateStore ??= new Map<string, Entry>());

function sweep(now: number) {
  for (const [key, entry] of memory) if (entry.resetAt <= now) memory.delete(key);
  if (memory.size > MAX_KEYS) {
    // Still too big: drop the oldest tenth. Map iterates in insertion order.
    let drop = Math.ceil(memory.size / 10);
    for (const key of memory.keys()) {
      memory.delete(key);
      if (--drop <= 0) break;
    }
  }
}

function hitMemory(key: string, limit: number, seconds: number): RateResult {
  const now = Date.now();
  let entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    if (memory.size >= MAX_KEYS) sweep(now);
    entry = { count: 0, resetAt: now + seconds * 1000 };
  }
  entry.count += 1;
  memory.set(key, entry);
  return { ok: entry.count <= limit, limit, count: entry.count, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}

const REDIS_TIMEOUT_MS = 700;

async function hitRedis(key: string, limit: number, seconds: number): Promise<RateResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, seconds, 'NX'], ['TTL', key]]),
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<{ result?: number; error?: string }>;
    const count = Number(rows?.[0]?.result);
    const ttl = Number(rows?.[2]?.result);
    if (!Number.isFinite(count)) return null;
    return { ok: count <= limit, limit, count, retryAfter: Number.isFinite(ttl) && ttl > 0 ? ttl : seconds };
  } catch {
    return null;
  }
}

/** Count one request against `key`. Never throws; falls back to memory if Redis is down. */
export async function hit(key: string, limit: number, seconds: number): Promise<RateResult> {
  return (await hitRedis(key, limit, seconds)) ?? hitMemory(key, limit, seconds);
}

export function usingDurableStore(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
