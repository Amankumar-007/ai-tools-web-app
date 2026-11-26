import 'server-only';

import { getLiveCatalog } from '@/lib/ai-context/catalog';
import { planModels } from '@/lib/ai-context/router';
import { AUTO_MODEL } from '@/lib/ai-context/types';

const PER_ATTEMPT_TIMEOUT_MS = 90_000;

/**
 * Drop-in replacement for `fetch(OPENROUTER_URL, { body: JSON.stringify({ model, ... }) })`.
 *
 * Free models come and go (several that tools hardcoded have been retired, which silently broke those tools).
 * This keeps the caller's request exactly as written, but picks models from OpenRouter's LIVE catalog: the
 * requested model if it still exists, then the best available fallbacks. A model that errors or is
 * rate-limited is skipped. The first successful Response is returned; if all fail, the last failure is
 * returned so the caller's existing error handling still works.
 */
export async function openRouterFetch(url: string, init: RequestInit, opts: { task?: 'general' | 'reasoning' | 'writing' | 'document' | 'code' } = {}): Promise<Response> {
  const payload = typeof init.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : {};
  const requested = typeof payload.model === 'string' ? payload.model : AUTO_MODEL;

  const catalog = await getLiveCatalog();
  const { models } = planModels({ requested, task: opts.task ?? 'general', needsVision: false, catalog });

  let last: Response | null = null;
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const response = await fetch(url, {
        ...init,
        body: JSON.stringify({ ...payload, model }),
        signal: AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS),
      });
      if (response.ok) return response;
      await last?.body?.cancel().catch(() => {});
      last = response;
    } catch (error) {
      lastError = error;
    }
  }
  if (last) return last;
  throw lastError instanceof Error ? lastError : new Error('No AI model is reachable right now.');
}
