// src/app/api/generate-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateResumeTemplate, type ResumeData } from '@/lib/resume-templates';
import { createResumePrompt } from '@/lib/resume-prompts';

export const dynamic = 'force-dynamic';

type RequestBody = ResumeData & { useAI?: boolean };

export async function POST(req: NextRequest) {
  try {
    let payload: RequestBody | null = null;

    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!payload || !payload.personalInfo?.fullName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (fullName)' },
        { status: 400 }
      );
    }

    // Default to local template so it always works
    let html = generateResumeTemplate(payload);
    let aiEnhanced = false;
    let fallback = false;

    // Optional AI path (safe-guarded dynamic import so it won’t break if the package isn’t installed)
    if (payload.useAI && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = createResumePrompt(payload);
        const res = await model.generateContent(prompt);
        let text = res.response.text().trim();

        // If Gemini wrapped in markdown code block, extract HTML
        const match = text.match(/```html\s*([\s\S]*?)\s*```/i) || text.match(/```[\s\S]*?```/);
        if (match) text = match[1] || text;

        // Basic sanity check
        if (/<html[\s\S]*<\/html>/i.test(text)) {
          html = text;
          aiEnhanced = true;
        } else {
          fallback = true;
        }
      } catch (e) {
        console.error('Gemini generation failed, using template:', e);
        fallback = true;
      }
    } else if (payload.useAI && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      fallback = true;
    }

    return NextResponse.json({
      success: true,
      html,
      aiEnhanced,
      fallback
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error generating resume' },
      { status: 500 }
    );
  }
}

// Optional: respond to GET with method info (helps debugging)
// You can remove this if you want.
export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'Use POST /api/generate-resume' },
    { status: 200 }
  );
}