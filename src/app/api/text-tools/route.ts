import { NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';
import { AiBlockedError, AiUnavailableError, completeText } from '@/lib/ai/complete';
import { CONTENT_TYPES, MAX_TEXT, TEXT_MODES, parseJsonAnswer, textToolPrompt, type ContentType, type TextMode } from '@/lib/ai/text-tools';

export const runtime = 'nodejs';
export const maxDuration = 90;

async function handle(req: Request) {
  const read = await readJsonLimited<{ mode?: unknown; text?: unknown; contentType?: unknown }>(req, 64 * 1024);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });
  const mode = (TEXT_MODES as readonly string[]).includes(String(read.data?.mode)) ? (read.data!.mode as TextMode) : null;
  const text = typeof read.data?.text === 'string' ? read.data.text.trim() : '';
  const contentType = (CONTENT_TYPES as readonly string[]).includes(String(read.data?.contentType)) ? (read.data!.contentType as ContentType) : 'blog';
  if (!mode) return NextResponse.json({ error: 'Unknown tool.' }, { status: 400 });
  if (!text) return NextResponse.json({ error: 'Please enter some text.' }, { status: 400 });
  if (text.length > MAX_TEXT) return NextResponse.json({ error: `That text is too long. Keep it under ${MAX_TEXT.toLocaleString('en-IN')} characters.` }, { status: 413 });

  try {
    const { text: answer } = await completeText(textToolPrompt(mode, text, contentType));
    if (mode === 'creative' || mode === 'article') return NextResponse.json({ result: answer });
    const parsed = parseJsonAnswer(answer);
    if (!parsed) return NextResponse.json({ error: 'The AI answer could not be read. Please try again.' }, { status: 502 });
    return NextResponse.json({ result: parsed });
  } catch (error) {
    if (error instanceof AiBlockedError) return NextResponse.json({ error: error.message }, { status: 422 });
    if (error instanceof AiUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
    console.error('/api/text-tools error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Spends one AI tool run from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<Request>('tool', handle);
