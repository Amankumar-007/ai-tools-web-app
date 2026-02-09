import { NextResponse } from 'next/server';
import { optimizeResume } from '../../../services/geminiService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const text = body?.text;
        const jobDescription = body?.jobDescription;

        if (!text || !jobDescription) {
            return NextResponse.json({ error: 'Missing `text` or `jobDescription` in request body' }, { status: 400 });
        }

        const result = await optimizeResume(text, jobDescription);
        return NextResponse.json({ optimizedText: result });
    } catch (err: any) {
        console.error('optimize-resume API error:', err);
        return NextResponse.json({ error: err.message || 'Optimization failed' }, { status: 500 });
    }
}
