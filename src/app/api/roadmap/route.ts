import { NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { generateRoadmap } from '../../../services/geminiService';
import { readJsonLimited } from '@/lib/security/body';

async function handle(req: Request) {
  try {
    const read = await readJsonLimited<{ prompt?: unknown }>(req, 16 * 1024);
    if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });
    const prompt = typeof read.data?.prompt === 'string' ? read.data.prompt.trim().slice(0, 2000) : '';

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing `prompt` in request body' },
        { status: 400 }
      );
    }

    const result = await generateRoadmap(prompt);
    return NextResponse.json({ success: true, roadmap: result });
  } catch (err: any) {
    console.error('roadmap generator API error:', err);
    return NextResponse.json({ error: 'Roadmap generation failed. Please try again.' }, { status: 500 });
  }
}

/** Spends one AI tool run from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<Request>('tool', handle);
