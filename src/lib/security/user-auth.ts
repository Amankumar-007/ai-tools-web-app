/**
 * Verifies a Supabase user access token (Edge-safe: only fetch + Web Crypto + jose).
 *
 * - With SUPABASE_JWT_SECRET set the signature is checked locally, no network.
 * - Without it the token is checked against Supabase once, and the answer is cached
 *   for a minute. Invalid tokens are cached briefly too, so garbage tokens cannot be
 *   used to hammer Supabase through this server.
 * Tokens are never stored: only a SHA-256 of the token is used as the cache key.
 */

import { jwtVerify } from 'jose';
import { effectivePlan, planEndsAt, type PlanId, type PlanMetadata } from '../billing/plans';

/** `plan` is what the user is entitled to right now (kept on their account by the payment flow); `planEnd` is when it runs out (unix seconds). */
export type VerifiedUser = { uid: string; plan: PlanId; planEnd: number | null };

function fromMetadata(uid: string, raw: unknown): VerifiedUser {
  const meta = raw && typeof raw === 'object' ? (raw as PlanMetadata) : null;
  return { uid, plan: effectivePlan(meta), planEnd: planEndsAt(meta) };
}

type Cached = { user: VerifiedUser | null; expiresAt: number };
const g = globalThis as unknown as { __tomatoAuthCache?: Map<string, Cached> };
const cache = (g.__tomatoAuthCache ??= new Map<string, Cached>());

const POSITIVE_TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 15_000;
const MAX_CACHE = 5_000;

const jwtSecret = () => (process.env.SUPABASE_JWT_SECRET ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET) : null);

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function remember(key: string, user: VerifiedUser | null, ttl: number) {
  if (cache.size >= MAX_CACHE) {
    const now = Date.now();
    for (const [k, v] of cache) if (v.expiresAt <= now) cache.delete(k);
    if (cache.size >= MAX_CACHE) cache.clear();
  }
  cache.set(key, { user, expiresAt: Date.now() + ttl });
}

export function bearerToken(headers: Headers): string | null {
  const header = headers.get('authorization');
  if (header && /^Bearer\s+\S+$/i.test(header)) return header.replace(/^Bearer\s+/i, '');
  return null;
}

export async function verifyUserToken(token: string): Promise<VerifiedUser | null> {
  if (!token || token.length > 4096) return null;
  const key = await sha256(token);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.user;

  const secret = jwtSecret();
  if (secret) {
    try {
      const { payload } = await jwtVerify(token, secret, { audience: 'authenticated', algorithms: ['HS256'] });
      const user = payload.sub ? fromMetadata(payload.sub, (payload as Record<string, unknown>).app_metadata) : null;
      remember(key, user, user ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS);
      return user;
    } catch {
      remember(key, null, NEGATIVE_TTL_MS);
      return null;
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3_000),
      cache: 'no-store',
    });
    if (response.status === 401 || response.status === 403) {
      remember(key, null, NEGATIVE_TTL_MS);
      return null;
    }
    if (!response.ok) return null; // Supabase trouble: don't cache, don't trust.
    const body = (await response.json()) as { id?: string; app_metadata?: unknown };
    const user = body?.id ? fromMetadata(body.id, body.app_metadata) : null;
    remember(key, user, user ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS);
    return user;
  } catch {
    return null;
  }
}
