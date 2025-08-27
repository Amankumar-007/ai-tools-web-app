// src/app/api/analyze-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithOpenRouter } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ success: false, error: err?.message || 'Failed to analyze image' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'POST { imageUrl, question? } to /api/analyze-image' });
}
