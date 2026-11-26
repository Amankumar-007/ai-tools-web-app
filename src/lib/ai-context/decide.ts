import 'server-only';

/**
 * Decides what a chat message is asking for, with Perplexity's Decider models on OpenRouter's Decisions API
 * (`POST /api/alpha/decisions`). A decision model does not write text: it answers typed questions about the message and
 * returns a probability for every option, in a single fast call (about half a second, free).
 *
 * This replaces the keyword rules in `heuristics.ts` where the model is confident. The rules stay as the fallback, so a
 * slow, retired or unreachable decision model never blocks or breaks a chat: the answer is just routed the old way.
 * The Decisions API is in alpha (its shape may change), which is another reason for the fallback.
 */

import { detectTask, type TaskSignals } from './heuristics';
import { freeLimitActive } from './provider-state';
import type { TaskType } from './types';

/** Tried in order. Both are free. Override with OPENROUTER_DECIDER_MODELS (comma separated ids). */
const DEFAULT_MODELS = ['perplexity/pplx-decider-v1.3:free', 'perplexity/pplx-decider-flash-v1.3:free'];
/** The whole decision (all models together) never delays a reply by more than this. */
const BUDGET_MS = 3_000;
/** Below this the decision model is guessing: use the rules instead. */
export const MIN_CONFIDENCE = 0.6;
const FAILURES_BEFORE_PAUSE = 3;
const PAUSE_MS = 60_000;

type Choice = Exclude<TaskType, 'vision' | 'document'>;
const CHOICES: Choice[] = ['code', 'reasoning', 'writing', 'quick', 'general'];

const TASK_QUESTION = {
  type: 'choice',
  instructions: 'What kind of help is the user asking for in their latest message?',
  criteria: {
    code: 'Writing, fixing, reviewing or explaining programming code, scripts, queries or technical configuration.',
    reasoning: 'Maths, logic puzzles, calculations, step-by-step analysis, or weighing and comparing options to reach a conclusion.',
    writing: 'Writing, rewriting, translating, summarising or polishing text such as emails, essays, captions, posts or letters.',
    quick: 'A short chat message, greeting or simple factual question that needs a brief answer.',
    general: 'Anything else: advice, explanations, brainstorming, recommendations or longer open-ended questions.',
  },
} as const;

/**
 * Each decision is one more request on the OpenRouter key. On a key without credits the whole site may make only 50 free-model
 * requests a day, and a decision would use up a third to a half of the chat's own allowance, so the decision model only runs
 * when the key has credits (1000 free-model requests a day, and the decision is then cheap). Set OPENROUTER_DECIDER=on to force
 * it on, or off to switch it off.
 */
let tier: { checkedAt: number; free: boolean | null } = { checkedAt: 0, free: null };
const TIER_TTL_MS = 10 * 60_000;

async function onFreeTier(apiKey: string, signal: AbortSignal): Promise<boolean | null> {
  if (Date.now() - tier.checkedAt < TIER_TTL_MS) return tier.free;
  try {
    const base = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
    const response = await fetch(`${base}/key`, { headers: { Authorization: `Bearer ${apiKey}` }, signal });
    const body = response.ok ? ((await response.json().catch(() => null)) as { data?: { is_free_tier?: unknown } } | null) : null;
    const free = typeof body?.data?.is_free_tier === 'boolean' ? body.data.is_free_tier : null;
    tier = { checkedAt: Date.now(), free };
    return free;
  } catch {
    return null;
  }
}

export type TaskDecision = { task: TaskType; source: 'decider' | 'rules'; confidence?: number; model?: string };

let failures = 0;
let pausedUntil = 0;

/** For tests: forget earlier failures. */
export function resetDecider(): void {
  failures = 0;
  pausedUntil = 0;
  tier = { checkedAt: 0, free: null };
}

function deciderModels(): string[] {
  const configured = (process.env.OPENROUTER_DECIDER_MODELS || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^[A-Za-z0-9._\-:/~]{1,100}$/.test(id));
  return configured.length ? configured : DEFAULT_MODELS;
}

function endpoint(): string {
  const base = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
  return `${base.replace(/\/v1$/, '')}/alpha/decisions`;
}

type Answer = { choice: Choice; confidence: number };

/** Ask one model. Returns null when it cannot give a usable answer. */
async function ask(model: string, apiKey: string, state: Record<string, unknown>, signal: AbortSignal): Promise<Answer | null> {
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'TomatoAI',
    },
    body: JSON.stringify({ model, state, questions: { task: TASK_QUESTION } }),
    signal,
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => {});
    return null;
  }
  const body = (await response.json().catch(() => null)) as { answers?: { task?: { type?: unknown; choice?: unknown; confidence?: unknown } } } | null;
  const answer = body?.answers?.task;
  if (!answer || answer.type !== 'choice' || typeof answer.choice !== 'string') return null;
  if (!(CHOICES as string[]).includes(answer.choice)) return null;
  const confidence = typeof answer.confidence === 'number' && Number.isFinite(answer.confidence) ? answer.confidence : 0;
  return { choice: answer.choice as Choice, confidence };
}

/**
 * What is the user trying to do? Facts the browser already knows come first (an attached picture means a vision model is
 * needed); the decision model then reads the message itself.
 */
export async function decideTask(signals: TaskSignals & { previousReply?: string }, signal?: AbortSignal): Promise<TaskDecision> {
  const rules = (): TaskDecision => ({ task: detectTask(signals), source: 'rules' });

  // Only a vision-capable model can look at pixels, whatever the message says.
  if (signals.hasPixelImages) return rules();
  const apiKey = process.env.OPENROUTER_API_KEY;
  const mode = (process.env.OPENROUTER_DECIDER || 'auto').toLowerCase();
  if (!apiKey || mode === 'off' || Date.now() < pausedUntil || freeLimitActive()) return rules();

  const state: Record<string, unknown> = { latest_message: (signals.text || '').slice(0, 1500) };
  if (signals.previousReply) state.assistant_previous_reply = signals.previousReply.slice(0, 400);
  if (signals.documentNames.length) state.attached_documents = signals.documentNames.slice(0, 10);

  const stop = signal ? AbortSignal.any([signal, AbortSignal.timeout(BUDGET_MS)]) : AbortSignal.timeout(BUDGET_MS);
  if (mode !== 'on' && (await onFreeTier(apiKey, stop)) !== false) return rules(); // free tier (or unknown): keep the daily allowance for chat
  for (const model of deciderModels()) {
    if (stop.aborted) break;
    try {
      const answer = await ask(model, apiKey, state, stop);
      if (!answer) continue;
      failures = 0;
      if (answer.confidence < MIN_CONFIDENCE) return rules();
      // Same precedence as the rules: code beats documents, and a document question with no code is a document task.
      const task: TaskType = answer.choice === 'code' ? 'code' : signals.documentNames.length > 0 ? 'document' : answer.choice;
      return { task, source: 'decider', confidence: answer.confidence, model };
    } catch {
      if (signal?.aborted) return rules();
      if (stop.aborted) break;
    }
  }

  failures += 1;
  if (failures >= FAILURES_BEFORE_PAUSE) {
    pausedUntil = Date.now() + PAUSE_MS;
    failures = 0;
  }
  return rules();
}
