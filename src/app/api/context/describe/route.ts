import type { NextRequest } from 'next/server';
import { describeImage, type DescribeMode } from '@/lib/ai-context/describe';
import { readJsonLimited } from '@/lib/security/body';

export const runtime = 'nodejs';

const MAX_IMAGE_CHARS = 1_800_000;
const IMAGE_URL = /^(?:data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+)$/;

/** Authenticated by the middleware (not listed as a public route). */
export async function POST(req: NextRequest) {
  const read = await readJsonLimited<{ image?: unknown; mode?: unknown }>(req, 2 * 1024 * 1024);
  if (!read.ok) return Response.json({ error: 'Send an image to describe.' }, { status: read.status });
  const body = read.data && typeof read.data === 'object' ? read.data : {};

  const image = typeof body?.image === 'string' ? body.image : '';
  if (!image || image.length > MAX_IMAGE_CHARS || !IMAGE_URL.test(image)) {
    return Response.json({ error: 'Send a PNG, JPEG, WebP or GIF image under 1.3 MB.' }, { status: 400 });
  }
  const mode: DescribeMode = body?.mode === 'ocr' ? 'ocr' : 'describe';

  try {
    const description = await describeImage({ url: image, mode, signal: req.signal });
    return Response.json({ description });
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    console.warn('/api/context/describe failed:', error);
    return Response.json({ error: 'Could not read that image right now.' }, { status: 502 });
  }
}
