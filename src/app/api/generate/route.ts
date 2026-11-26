import { NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { readJsonLimited } from '@/lib/security/body';
import { generateImage, ImageGenError, parseAspectRatio } from '@/lib/ai/image-gen';

// Node runtime: the quota store and rate limiter need it.
export const runtime = 'nodejs';
export const maxDuration = 120;

async function handle(req: Request) {
  const read = await readJsonLimited<{ prompt?: unknown; aspectRatio?: unknown }>(req, 16 * 1024);
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status });

  const prompt = typeof read.data?.prompt === 'string' ? read.data.prompt.trim().slice(0, 2000) : '';
  if (!prompt) return NextResponse.json({ error: 'Describe the image you want.' }, { status: 400 });
  if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ error: 'Image generation is not configured.' }, { status: 503 });

  try {
    const image = await generateImage({ prompt, aspectRatio: parseAspectRatio(read.data?.aspectRatio), signal: req.signal });
    return NextResponse.json({ imageBase64: image.imageBase64, mimeType: image.mimeType, model: image.model });
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    if (error instanceof ImageGenError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Image generation failed. Please try again.' }, { status: 500 });
  }
}

/**
 * Spends one chat message from the caller's daily quota (an image is asked for from the chat);
 * refunded if the request fails.
 */
export const POST = withQuota<Request>('chat', handle);
