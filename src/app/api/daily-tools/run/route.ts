import { NextResponse } from 'next/server';
import { AiBlockedError, AiUnavailableError, completeText } from '@/lib/ai/complete';
import { AI_SPECS, validateValues } from '@/lib/daily-tools/ai/forms';
import { buildPrompt, buildRefinePrompt, hasPrompt, REFINEMENTS } from '@/lib/daily-tools/ai/prompts';
import { getLanguage } from '@/lib/daily-tools/languages';
import { withQuota } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';
export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'no-store' };
const MAX_PREVIOUS = 20_000;
const MAX_OUTPUT = 30_000;

interface Body { tool?: unknown; values?: unknown; language?: unknown; refine?: { instruction?: unknown; previous?: unknown } | null }

const fail = (status: number, error: string, extra: Record<string, unknown> = {}) => NextResponse.json({ error, ...extra }, { status, headers: NO_STORE });

/** Models sometimes wrap the whole answer in one code fence; the UI renders Markdown, so unwrap it. */
function unfence(text: string): string {
  const match = /^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```\s*$/i.exec(text.trim());
  return match ? match[1].trim() : text.trim();
}

/**
 * Runs one AI tool. The browser only picks a tool, fills in the tool's own form and optionally chooses a fixed
 * "refine" instruction; the prompt itself is built here, so this cannot be used as a general-purpose chatbot.
 * One run = one AI tool run from the user's daily allowance (refunded automatically if anything fails).
 */
async function handle(req: Request): Promise<Response> {
  const read = await readJsonLimited<Body>(req, 150 * 1024);
  if (!read.ok) return fail(read.status, read.error);
  const body = read.data;
  if (!body || typeof body !== 'object') return fail(400, 'Invalid request.');

  const slug = body.tool;
  if (typeof slug !== 'string' || !Object.prototype.hasOwnProperty.call(AI_SPECS, slug) || !hasPrompt(slug)) return fail(400, 'Unknown tool.');
  const spec = AI_SPECS[slug];

  const checked = validateValues(spec, body.values);
  if (!checked.ok) return fail(400, checked.error);

  let languageId = 'en';
  if (spec.language === 'output') {
    if (body.language !== undefined && !getLanguage(body.language)) return fail(400, 'Unsupported language.');
    languageId = getLanguage(body.language)?.id ?? 'en';
  }

  let built;
  try {
    if (body.refine) {
      const key = body.refine.instruction;
      const previous = body.refine.previous;
      if (typeof key !== 'string' || !Object.prototype.hasOwnProperty.call(REFINEMENTS, key)) return fail(400, 'Unknown refinement.');
      if (typeof previous !== 'string' || !previous.trim() || previous.length > MAX_PREVIOUS) return fail(400, 'There is nothing to refine.');
      built = buildRefinePrompt(slug, checked.values, languageId, previous, key);
    } else {
      built = buildPrompt(slug, checked.values, languageId);
    }
  } catch {
    return fail(400, 'Could not understand that request.');
  }

  try {
    const { text, provider } = await completeText(built);
    return NextResponse.json({ text: unfence(text).slice(0, MAX_OUTPUT), tool: slug, language: languageId }, { headers: { ...NO_STORE, 'X-AI-Provider': provider } });
  } catch (error) {
    if (error instanceof AiBlockedError) return fail(422, error.message, { code: 'blocked' });
    if (error instanceof AiUnavailableError) return fail(503, error.message, { code: 'unavailable' });
    console.error('[daily-tools] run failed:', error instanceof Error ? error.message : 'unknown error');
    return fail(500, 'Something went wrong. Please try again.');
  }
}

export const POST = withQuota<Request>('tool', handle);
