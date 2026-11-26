// src/app/api/analyze-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { analyzeImageWithOpenRouter } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

async function handle(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let imageUrl = '';
    let question = 'What is in this image?';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      imageUrl = (body?.imageUrl || '').toString();
      question = (body?.question || question).toString();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      imageUrl = String(form.get('imageUrl') || '');
      question = String(form.get('question') || question);
    } else {
      const bodyText = await req.text().catch(() => '');
      try {
        const parsed = JSON.parse(bodyText || '{}');
        imageUrl = (parsed?.imageUrl || '').toString();
        question = (parsed?.question || question).toString();
      } catch {}
    }

    // Only https images or inline image data: never file:, http: or internal addresses.
    question = question.slice(0, 500);
    const SAFE_IMAGE_URL = /^(?:https:\/\/\S+|data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+)$/;
    if (imageUrl && (imageUrl.length > 2_000_000 || !SAFE_IMAGE_URL.test(imageUrl))) {
      return NextResponse.json({ success: false, error: 'imageUrl must be an https URL or a PNG/JPEG/WebP/GIF data URL.' }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ success: false, error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
    }

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'Missing required field: imageUrl' }, { status: 400 });
    }

    const answer = await analyzeImageWithOpenRouter(imageUrl, question);

    return NextResponse.json({ success: true, answer });
  } catch (err: any) {
    console.error('analyze-image error:', err);
    return NextResponse.json({ success: false, error: 'Failed to analyze image. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'POST { imageUrl, question? } to /api/analyze-image' });
}

/** Spends one AI tool run from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<NextRequest>('tool', handle);
