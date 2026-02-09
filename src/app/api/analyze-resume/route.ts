import { NextResponse } from 'next/server';
import { analyzeResume } from '../../../services/geminiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;
    const jobDescription = body?.jobDescription;

    if (!text) return NextResponse.json({ error: 'Missing `text` in request body' }, { status: 400 });

    const result = await analyzeResume(text, jobDescription);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('analyze-resume API error:', err);
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
