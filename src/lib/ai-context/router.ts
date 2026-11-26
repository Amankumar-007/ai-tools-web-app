/**
 * Automatic model selection.
 *
 * Given what the user is trying to do (see `detectTask`) this picks an ordered
 * list of models to try. Because every request is rebuilt from the context
 * store, any model in the list receives identical context — switching models
 * (or failing over to the next one) never loses anything.
 */

import { AUTO_MODEL, type TaskType } from './types';
import type { LiveCatalog } from './catalog';

/**
 * Preferred models per task, best first. Entries that are not in OpenRouter's
 * live catalog are skipped automatically, so it is safe to list models that
 * come and go (e.g. the coding models below).
 */
export const TASK_MODELS: Record<TaskType, string[]> = {
  vision: [
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3.5-super-vl:free',
    'google/gemma-4-26b-a4b-it:free',
    'dots-studio/dots-3-note-preview:free',
    'particle-ai/particle-1:free',
    'inclusionai/ling-3.2-flash:free',
  ],
  code: [
    'qwen/qwen3-coder:free',
    'cohere/north-mini-code:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'google/gemma-4-31b-it:free',
  ],
  reasoning: [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'google/gemma-4-31b-it:free',
    'baidu/ernie-5.5-flash-preview:free',
  ],
  document: [
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3.5-super-vl:free',
  ],
  writing: [
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'google/gemma-4-26b-a4b-it:free',
  ],
  quick: [
    'nvidia/nemotron-3.5-lightning:free',
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
  ],
  general: [
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'google/gemma-4-26b-a4b-it:free',
  ],
};

/** Always tried last: OpenRouter's own router, which accepts text and images. */
const SAFETY_NET = ['openrouter/free'];

/** Models known to accept images, used only when the live catalog is unavailable. */
const KNOWN_VISION = new Set([
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'dots-studio/dots-3-note-preview:free',
  'particle-ai/particle-1:free',
  'inclusionai/ling-3.2-flash:free',
]);

export const MAX_ATTEMPTS = 4;

export function supportsImages(id: string, catalog: LiveCatalog | null): boolean {
  const live = catalog?.get(id);
  return live ? live.image : KNOWN_VISION.has(id);
}

function isAvailable(id: string, catalog: LiveCatalog | null): boolean {
  return !catalog || catalog.has(id) || id === 'openrouter/free';
}

export type RoutePlan = {
  /** Models to try, in order. Never empty. */
  models: string[];
  /** True when the model the user picked had to be replaced before trying anything. */
  replacedRequested: boolean;
};

export function planModels(opts: {
  /** Model id from the client: a specific model, or `AUTO_MODEL`. */
  requested: string;
  task: TaskType;
  /** True when the model must be able to look at images. */
  needsVision: boolean;
  catalog: LiveCatalog | null;
}): RoutePlan {
  const { requested, task, needsVision, catalog } = opts;
  const explicit = requested !== AUTO_MODEL;

  const usable = (id: string) => isAvailable(id, catalog) && (!needsVision || supportsImages(id, catalog));

  const ordered: string[] = [];
  let replacedRequested = false;
  if (explicit) {
    if (usable(requested)) ordered.push(requested);
    else replacedRequested = true;
  }
  ordered.push(...TASK_MODELS[task], ...SAFETY_NET);

  const seen = new Set<string>();
  let models = ordered.filter((id) => {
    if (seen.has(id) || !usable(id)) return false;
    seen.add(id);
    return true;
  });

  // The live catalog said nothing is usable (or the preferences are stale):
  // fall back to the safety net rather than failing outright.
  if (models.length === 0) models = [...SAFETY_NET];

  return { models: models.slice(0, MAX_ATTEMPTS), replacedRequested };
}
