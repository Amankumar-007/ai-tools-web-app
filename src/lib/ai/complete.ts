import 'server-only';

import { AUTO_MODEL } from '@/lib/ai-context/types';
import { openRouterFetch } from './openrouter-fetch';

/**
 * One text completion with automatic fallback, for tools that need a single dependable answer:
 *   1. Google Gemini (GEMINI_API_KEY): fast, with a much larger free allowance than OpenRouter's free models.
 *   2. OpenRouter (OPENROUTER_API_KEY): live-catalog routing across free models.
 * The first provider that returns usable text wins. If every provider fails the caller gets AiUnavailableError,
 * which the quota wrapper turns into a refund, so people are never charged for an outage.
 */

export class AiUnavailableError extends Error {
  constructor(message = 'The AI service is busy right now. Please try again in a moment.') { super(message); this.name = 'AiUnavailableError'; }
}
/** The provider refused to answer (its safety filters). Not an outage: retrying the same input will not help. */
export class AiBlockedError extends Error {
  constructor(message = 'The AI could not write that. Try rewording your request.') { super(message); this.name = 'AiBlockedError'; }
}

export interface CompleteOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
  /** An answer shorter than this is treated as a failed attempt (a weak or cut-off model reply), and the next provider is tried. */
  minChars?: number;
}

const GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 45_000;

async function viaGemini(o: CompleteOptions): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    // The key travels in a header, not the URL, so it cannot end up in access logs.
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: [{ role: 'user', parts: [{ text: o.user }] }],
      generationConfig: {
        temperature: o.temperature,
        maxOutputTokens: o.maxTokens,
        // 2.5 models "think" first and the thinking eats the output budget, truncating answers. These tools want the answer.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) { await response.body?.cancel().catch(() => {}); return null; }
  const data = (await response.json().catch(() => null)) as {
    candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  } | null;
  if (data?.promptFeedback?.blockReason) throw new AiBlockedError();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) {
    if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'PROHIBITED_CONTENT') throw new AiBlockedError();
    return null;
  }
  return text;
}

async function viaOpenRouter(o: CompleteOptions): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const response = await openRouterFetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://www.tomatoai.in', 'X-Title': 'TomatoAI' },
    body: JSON.stringify({ model: AUTO_MODEL, messages: [{ role: 'system', content: o.system }, { role: 'user', content: o.user }], temperature: o.temperature, max_tokens: o.maxTokens }),
  }, { task: 'writing' });
  if (!response.ok) { await response.body?.cancel().catch(() => {}); return null; }
  const data = (await response.json().catch(() => null)) as { choices?: Array<{ message?: { content?: string } }> } | null;
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function completeText(o: CompleteOptions): Promise<{ text: string; provider: 'gemini' | 'openrouter' }> {
  for (const [provider, run] of [['gemini', viaGemini], ['openrouter', viaOpenRouter]] as const) {
    try {
      const text = await run(o);
      if (text && text.length >= (o.minChars ?? 1)) return { text, provider };
    } catch (error) {
      if (error instanceof AiBlockedError) throw error;
      // network error or timeout: try the next provider
    }
  }
  throw new AiUnavailableError();
}
