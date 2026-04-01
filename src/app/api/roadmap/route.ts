import { NextResponse } from 'next/server';
import { generateRoadmap } from '../../../services/geminiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

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
    return NextResponse.json({ error: err.message || 'Roadmap generation failed. Please try again.' }, { status: 500 });
  }
}
