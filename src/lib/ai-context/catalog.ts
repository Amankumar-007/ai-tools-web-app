/**
 * Live view of which OpenRouter models exist right now and what they accept.
 *
 * Free-model lineups change often; a hard-coded list quickly points at models
 * that no longer exist. We ask OpenRouter (cached for an hour) and only route to
 * models that are really there. If the lookup fails we return null and the
 * router falls back to its static preferences.
 */

export type LiveModel = { id: string; image: boolean; contextLength: number };
export type LiveCatalog = Map<string, LiveModel>;

const CATALOG_URL = 'https://openrouter.ai/api/v1/models';
const TTL_MS = 60 * 60 * 1000;
const FAILURE_RETRY_MS = 60 * 1000;
const TIMEOUT_MS = 4_000;

let cache: { expiresAt: number; catalog: LiveCatalog | null } | null = null;
let inflight: Promise<LiveCatalog | null> | null = null;

async function fetchCatalog(): Promise<LiveCatalog | null> {
  try {
    const response = await fetch(CATALOG_URL, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: unknown };
    if (!Array.isArray(body.data)) return null;
    const catalog: LiveCatalog = new Map();
    for (const entry of body.data as any[]) {
      if (!entry || typeof entry.id !== 'string') continue;
      const inputs: unknown = entry.architecture?.input_modalities;
      catalog.set(entry.id, {
        id: entry.id,
        image: Array.isArray(inputs) && inputs.includes('image'),
        contextLength: typeof entry.context_length === 'number' ? entry.context_length : 0,
      });
    }
    return catalog.size > 0 ? catalog : null;
  } catch {
    return null;
  }
}

export async function getLiveCatalog(): Promise<LiveCatalog | null> {
  if (cache && Date.now() < cache.expiresAt) return cache.catalog;
  if (!inflight) {
    inflight = fetchCatalog()
      .then((fresh) => {
        // Keep serving the last good catalog if a refresh fails, and retry soon.
        const result = fresh ?? cache?.catalog ?? null;
        cache = { expiresAt: Date.now() + (fresh ? TTL_MS : FAILURE_RETRY_MS), catalog: result };
        return result;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}
