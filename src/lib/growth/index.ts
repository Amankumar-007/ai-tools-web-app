import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { MemoryStore } from './memory-store';
import { RpcStore } from './rpc-store';
import { GrowthUnavailableError, type GrowthStore } from './types';

/**
 * Which storage backs credits, streaks, referrals and the newsletter:
 *  - Supabase (production): needs SUPABASE_SERVICE_ROLE_KEY and `supabase-growth.sql` applied.
 *  - A JSON file under .data/ (development only), so everything works locally with no setup.
 *  - Nothing, in production without Supabase: quotas then fall back to the rate limiter (see meter.ts)
 *    and referral/streak/newsletter features switch themselves off instead of failing.
 */
const g = globalThis as unknown as { __tomatoGrowth?: { store: GrowthStore | null; downUntil: number; warned: boolean } };
const state = (g.__tomatoGrowth ??= { store: undefined as unknown as GrowthStore | null, downUntil: 0, warned: false });

function build(): GrowthStore | null {
  if (process.env.GROWTH_DISABLED === '1') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    return new RpcStore(async (fn, args) => {
      const { data, error } = await client.rpc(fn, args);
      return { data, error: error ? { code: error.code, message: error.message } : null };
    }, 'supabase');
  }
  if (process.env.NODE_ENV !== 'production') {
    const file = path.join(process.cwd(), '.data', 'growth-dev.json');
    return new MemoryStore({
      load: () => { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } },
      save: (json) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, json); },
    });
  }
  return null;
}

export function getStore(): GrowthStore | null {
  if (state.store === undefined) state.store = build();
  return state.store;
}

export function growthStoreKind(): 'supabase' | 'memory' | 'none' {
  const store = getStore();
  return !store ? 'none' : store.kind === 'supabase' ? 'supabase' : 'memory';
}

/**
 * Run something against the store. Returns null (instead of throwing) when there is no store or the
 * database is not ready, so callers can degrade gracefully. A missing migration is remembered for a
 * minute so we do not hammer the database with calls that will fail.
 */
export async function withStore<T>(fn: (store: GrowthStore) => Promise<T>): Promise<T | null> {
  const store = getStore();
  if (!store || Date.now() < state.downUntil) return null;
  try {
    return await fn(store);
  } catch (error) {
    const missing = error instanceof GrowthUnavailableError;
    state.downUntil = Date.now() + (missing ? 60_000 : 5_000);
    if (missing && !state.warned) {
      state.warned = true;
      console.error('[growth] Database functions not found. Run supabase-growth.sql in the Supabase SQL editor. Falling back to basic limits.');
    } else if (!missing) {
      console.error('[growth] store error:', error instanceof Error ? error.message : error);
    }
    return null;
  }
}
