/**
 * Turns an image into text with a vision model, once, so that every model —
 * including ones that cannot see pictures — can still use it afterwards. The
 * text is saved in the user's context store next to the image.
 */

import { getLiveCatalog } from './catalog';
import { planModels } from './router';
import { AUTO_MODEL, LIMITS } from './types';

export type DescribeMode = 'describe' | 'ocr';

const PROMPTS: Record<DescribeMode, string> = {
  describe:
    'Describe this image in detail so that someone who cannot see it could answer questions about it. ' +
    'Cover the main subjects, layout and colours; for charts, tables or diagrams give the values and labels; ' +
    'and transcribe ALL visible text exactly as written. Be factual and do not speculate.',
  ocr:
    'Transcribe all text in this image exactly as written, in reading order, keeping headings, lists and tables ' +
    '(use Markdown tables). Mark anything unreadable as [illegible]. Output only the transcription. ' +
    'If the image contains no text, describe it briefly instead.',
};

const REQUEST_TIMEOUT_MS = 45_000;

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part: any) => (typeof part?.text === 'string' ? part.text : '')).join('');
  return '';
}

export async function describeImage(opts: {
  /** `data:image/…` or `https:` URL. */
  url: string;
  mode: DescribeMode;
  signal?: AbortSignal;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('The image service is not configured.');

  const catalog = await getLiveCatalog();
  const { models } = planModels({ requested: AUTO_MODEL, task: 'vision', needsVision: true, catalog });

  let lastError = 'No vision model answered.';
  for (const model of models) {
    if (opts.signal?.aborted) throw new Error('Cancelled.');
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_SITE_NAME || 'TomatoAI',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPTS[opts.mode] },
                { type: 'image_url', image_url: { url: opts.url } },
              ],
            },
          ],
        }),
        signal: opts.signal ? AbortSignal.any([opts.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]) : AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        lastError = `${model} responded with ${response.status}`;
        await response.body?.cancel();
        continue;
      }
      const data = (await response.json()) as any;
      const text = contentToText(data?.choices?.[0]?.message?.content).trim();
      if (text) return text.slice(0, LIMITS.descriptionChars);
      lastError = `${model} returned no text`;
    } catch (error) {
      if (opts.signal?.aborted) throw new Error('Cancelled.');
      lastError = `${model} failed: ${error instanceof Error ? error.message : 'unknown error'}`;
    }
  }
  throw new Error(lastError);
}
