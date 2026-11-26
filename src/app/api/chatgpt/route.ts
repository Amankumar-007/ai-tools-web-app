import type { NextRequest } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { getLiveCatalog } from '@/lib/ai-context/catalog';
import { decideTask } from '@/lib/ai-context/decide';
import { freeLimitActive, freeLimitResetAt, markFreeLimitHit, parseFreeLimit } from '@/lib/ai-context/provider-state';
import { buildMessages } from '@/lib/ai-context/prompt';
import { parseChatRequest } from '@/lib/ai-context/request';
import { planModels, supportsImages } from '@/lib/ai-context/router';
import { AUTO_MODEL, LIMITS } from '@/lib/ai-context/types';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

const CONNECT_TIMEOUT_MS = 8_000;

type Upstream = { response: Response; controller: AbortController; id: string };
type Attempt = { id: string; provider: 'openrouter' | 'gemini' | 'openai' };

/**
 * Gemini through its OpenAI-compatible endpoint (same streaming format, accepts pictures). Used when OpenRouter's free
 * models are out of allowance or down. The "-latest" names follow Google's current models, so they do not go stale.
 */
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
// Lite models first (fast, no "thinking" delay); the full Flash model is often overloaded, so it goes last.
const GEMINI_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

const ENDPOINTS: Record<Attempt['provider'], string> = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  gemini: GEMINI_URL,
  openai: 'https://api.openai.com/v1/chat/completions',
};
const KEYS: Record<Attempt['provider'], () => string | undefined> = {
  openrouter: () => process.env.OPENROUTER_API_KEY,
  gemini: () => process.env.GEMINI_API_KEY,
  openai: () => process.env.OPENAI_API_KEY,
};

async function handle(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'The chat service is not configured.' }, { status: 503 });
    }
    // Size is enforced on the bytes actually received, not just the declared length.
    const read = await readJsonLimited(req, LIMITS.maxBodyBytes);
    if (!read.ok) {
      return Response.json({ error: read.status === 413 ? 'That message and its attachments are too large. Try fewer or smaller files.' : 'Add a message before sending.' }, { status: read.status });
    }
    const parsed = parseChatRequest(read.data);
    if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 });
    const { turns, context, model: requestedModel, temperature } = parsed;

    // 1. What is the user trying to do? A decision model (Perplexity Decider, free) reads the message; the keyword rules
    //    are the fallback if it is slow, unsure or unavailable. It runs alongside the model-list lookup, so it adds no wait.
    const hasPixelImages = context.images.some((image) => image.url);
    const previousReply = [...turns.slice(0, -1)].reverse().find((turn) => turn.role === 'assistant')?.content;
    const [decision, catalog] = await Promise.all([
      decideTask({
        text: turns[turns.length - 1].content,
        hasPixelImages,
        documentNames: context.documents.map((doc) => doc.name),
        previousReply,
      }, req.signal),
      // 2. Which models can do it? (live catalog, so retired models are skipped)
      getLiveCatalog(),
    ]);
    const task = decision.task;
    const plan = planModels({ requested: requestedModel, task, needsVision: hasPixelImages, catalog });
    const attempts: Attempt[] = [
      // While OpenRouter's free allowance is known to be used up, skip straight to the next provider.
      ...(process.env.OPENROUTER_API_KEY && !freeLimitActive() ? plan.models.map((id) => ({ id, provider: 'openrouter' as const })) : []),
      ...(process.env.GEMINI_API_KEY ? GEMINI_MODELS.map((id) => ({ id, provider: 'gemini' as const })) : []),
      ...(process.env.OPENAI_API_KEY ? [{ id: 'gpt-4o-mini', provider: 'openai' as const }] : []),
    ];

    let upstream: Upstream | null = null;
    let openRouterUnavailable = false;
    let sawRateLimit = false;
    let sawFreeLimit = freeLimitActive();

    // 3. Try them in order. Each attempt rebuilds the prompt from the same
    //    context, so a failover never loses documents, images or instructions.
    for (const attempt of attempts) {
      if (req.signal.aborted) return new Response(null, { status: 499 });
      if (attempt.provider === 'openrouter' && openRouterUnavailable) continue;
      const canSeeImages = attempt.provider !== 'openrouter' || supportsImages(attempt.id, catalog);
      if (hasPixelImages && !canSeeImages) continue;
      const messages = buildMessages({ turns, context, task, canSeeImages });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
      try {
        const response = await fetch(ENDPOINTS[attempt.provider], {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${KEYS[attempt.provider]()}`,
            'Content-Type': 'application/json',
            ...(attempt.provider === 'openrouter' ? {
              'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
              'X-Title': process.env.OPENROUTER_SITE_NAME || 'TomatoAI',
            } : {}),
          },
          body: JSON.stringify({ model: attempt.id, messages, temperature, max_tokens: 8192, stream: true }),
          signal: AbortSignal.any([req.signal, controller.signal]),
        });
        if (response.ok && response.body) {
          upstream = { response, controller, id: attempt.id };
          break;
        }
        console.warn(`Chat provider rejected ${attempt.id}: ${response.status}`);
        const rejection = response.status === 429 && attempt.provider === 'openrouter' ? await response.text().catch(() => '') : (await response.body?.cancel(), '');
        if (response.status === 429) sawRateLimit = true;
        if (rejection) {
          // The whole free allowance is gone: every other free model would say the same, so stop trying them.
          const freeLimit = parseFreeLimit(rejection);
          if (freeLimit) { markFreeLimitHit(freeLimit); sawFreeLimit = true; openRouterUnavailable = true; }
        }
        if ((response.status === 401 || response.status === 403) && attempt.provider === 'openrouter') openRouterUnavailable = true;
      } catch (error) {
        if (req.signal.aborted) return new Response(null, { status: 499 });
        console.warn(`Chat provider unavailable for ${attempt.id}:`, error);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!upstream) {
      if (sawFreeLimit) {
        const reset = freeLimitResetAt();
        const when = reset ? ` It comes back around ${new Date(reset).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })} IST.` : '';
        return Response.json({ error: `TomatoAI has used up today's free AI capacity.${when} Please try again then.`, code: 'capacity' }, { status: 503 });
      }
      if (openRouterUnavailable && !process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
        return Response.json({ error: 'The chat service needs attention. Please try again later.' }, { status: 503 });
      }
      if (sawRateLimit) {
        return Response.json({ error: 'The AI service is busy. Please wait a moment and retry.' }, { status: 429 });
      }
      return Response.json({ error: 'The AI service is busy. Please try again in a moment.' }, { status: 503 });
    }

    const { response, controller: upstreamController } = upstream;
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let streamed = false;
    let closed = false;
    const stream = new ReadableStream<Uint8Array>({
      start(output) {
        const finish = () => { if (!closed) { closed = true; output.close(); } };
        const processLine = (line: string) => {
          if (!line.startsWith('data:')) return false;
          const data = line.slice(5).trim();
          if (data === '[DONE]') { finish(); return true; }
          if (!data) return false;
          let event: any;
          try { event = JSON.parse(data); } catch { return false; }
          if (event.error) throw new Error(event.error.message || 'The AI service interrupted the response.');
          const content = event.choices?.[0]?.delta?.content;
          const text = typeof content === 'string' ? content : Array.isArray(content) ? content.map((part: any) => part?.text || '').join('') : '';
          if (text) { streamed = true; output.enqueue(encoder.encode(text)); }
          return false;
        };

        void (async () => {
          let buffer = '';
          try {
            while (!closed) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r?\n/);
              buffer = lines.pop() || '';
              for (const line of lines) if (processLine(line)) return;
            }
            buffer += decoder.decode();
            if (buffer) processLine(buffer);
            if (!streamed && !closed) throw new Error('The AI service returned an empty response.');
            finish();
          } catch (error) {
            if (!closed) { closed = true; output.error(error); }
          } finally {
            upstreamController.abort();
            reader.releaseLock();
          }
        })();
      },
      cancel() { closed = true; upstreamController.abort(); void reader.cancel().catch(() => {}); },
    });

    const headers = new Headers({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Model-Used': upstream.id,
      'X-Task-Type': task,
      // Who decided the task type: the decision model, or the keyword rules (fallback).
      'X-Task-Source': decision.source,
    });
    // The user picked a specific model but another one answered.
    if (requestedModel !== AUTO_MODEL && upstream.id !== requestedModel) headers.set('X-Model-Switched', '1');
    return new Response(stream, { headers });
  } catch (error) {
    console.error('/api/chatgpt error:', error);
    return Response.json({ error: 'Could not start the chat. Please try again.' }, { status: 500 });
  }
}

/** Spends one chat message from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<NextRequest>('chat', handle);
