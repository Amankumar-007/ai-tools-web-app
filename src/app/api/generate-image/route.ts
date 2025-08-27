// src/app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithOpenRouter } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let prompt = '';
    let size = '1024x1024';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      prompt = (body?.prompt || '').toString();
      size = (body?.size || size).toString();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      prompt = String(form.get('prompt') || '');
      size = String(form.get('size') || size);
    } else {
      const bodyText = await req.text().catch(() => '');
      try {
        const parsed = JSON.parse(bodyText || '{}');
        prompt = (parsed?.prompt || '').toString();
        size = (parsed?.size || size).toString();
      } catch {
        // ignore
      }
    }

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Missing required field: prompt' }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ success: false, error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
    }

    const { imageBase64, mimeType } = await generateImageWithOpenRouter({ prompt, size });

    return NextResponse.json({
      success: true,
      mimeType,
      dataUrl: `data:${mimeType};base64,${imageBase64}`,
    });
  } catch (err: any) {
    console.error('generate-image error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to generate image' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'POST { prompt, size? } to /api/generate-image' });
}
