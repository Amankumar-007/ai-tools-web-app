import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const CONNECT_TIMEOUT_MS = 8_000;
const FALLBACK_MODELS = [
  { id: 'openrouter/free', name: 'Auto Free Router' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano' },
];

type Upstream = { response: Response; controller: AbortController; name: string };
type Attempt = { id: string; name: string; provider: 'openrouter' | 'openai' };

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature, model } = await req.json();
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'The chat service is not configured.' }, { status: 503 });
    }
    if (!Array.isArray(messages) || !messages.length || messages.length > 50 || !messages.some((message) => message?.role === 'user')) {
      return Response.json({ error: 'Add a message before sending.' }, { status: 400 });
    }

    const requestedModel = typeof model === 'string' && model.trim() ? model.trim() : 'openrouter/free';
    const attempts: Attempt[] = [
      ...(process.env.OPENROUTER_API_KEY
        ? [{ id: requestedModel, name: requestedModel, provider: 'openrouter' as const }, ...FALLBACK_MODELS.filter((item) => item.id !== requestedModel).map((item) => ({ ...item, provider: 'openrouter' as const }))]
        : []),
      ...(process.env.OPENAI_API_KEY ? [{ id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' as const }] : []),
    ];
    let upstream: Upstream | null = null;
    let openRouterUnavailable = false;

    for (const attempt of attempts) {
      if (req.signal.aborted) return new Response(null, { status: 499 });
      if (attempt.provider === 'openrouter' && openRouterUnavailable) continue;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
      try {
        const response = await fetch(attempt.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${attempt.provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            ...(attempt.provider === 'openrouter' ? {
              'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
              'X-Title': process.env.OPENROUTER_SITE_NAME || 'TomatoAI',
            } : {}),
          },
          body: JSON.stringify({ model: attempt.id, messages, temperature: typeof temperature === 'number' ? temperature : 0.6, max_tokens: 8192, stream: true }),
          signal: AbortSignal.any([req.signal, controller.signal]),
        });
        if (response.ok && response.body) {
          upstream = { response, controller, name: attempt.name };
          break;
        }
        console.warn(`Chat provider rejected ${attempt.id}: ${response.status}`);
        await response.body?.cancel();
        if (response.status === 429) {
          if (!process.env.OPENAI_API_KEY || attempt.provider === 'openai') return Response.json({ error: 'The AI service is busy. Please wait a moment and retry.' }, { status: 429 });
          openRouterUnavailable = true;
        }
        if (response.status === 401 || response.status === 403) {
          if (!process.env.OPENAI_API_KEY || attempt.provider === 'openai') return Response.json({ error: 'The chat service needs attention. Please try again later.' }, { status: 503 });
          openRouterUnavailable = true;
        }
      } catch (error) {
        if (req.signal.aborted) return new Response(null, { status: 499 });
        console.warn(`Chat provider unavailable for ${attempt.id}:`, error);
      } finally {
        clearTimeout(timeout);
      }
    }

    if (!upstream) {
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

    const headers = new Headers({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' });
    if (upstream.name !== requestedModel) headers.set('X-Fallback-Model', upstream.name);
    return new Response(stream, { headers });
  } catch (error) {
    console.error('/api/chatgpt error:', error);
    return Response.json({ error: 'Could not start the chat. Please try again.' }, { status: 500 });
  }
}
