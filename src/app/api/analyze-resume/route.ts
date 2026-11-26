import { NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { analyzeResume } from '../../../services/geminiService';

async function handle(req: Request) {
  try {
    const body = await req.json();
    // Now expects 'structuredData' (JSON object from structure-resume step)
    // Falls back to accepting plain 'text' for backward compatibility
    const structuredData = body?.structuredData;
    const rawText = body?.text;
    const jobDescription = body?.jobDescription;

    if (!structuredData && !rawText) {
      return NextResponse.json(
        { error: 'Missing `structuredData` (or fallback `text`) in request body' },
        { status: 400 }
      );
    }

    // Prefer structured data; wrap raw text as minimal structured object if only text is provided
    const resumePayload: Record<string, any> = structuredData
      ? structuredData
      : { rawText, sections: {}, contact: {}, experience: [], education: [], skills: {} };

    const result = await analyzeResume(resumePayload, jobDescription);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('analyze-resume API error:', err);
    return NextResponse.json({ error: 'Resume analysis failed. Please try again.' }, { status: 500 });
  }
}

/** Spends one AI tool run from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<Request>('tool', handle);
