import { NextResponse } from 'next/server';
import { withQuota } from '@/lib/growth/meter';
import { optimizeResume } from '../../../services/geminiService';

async function handle(req: Request) {
    try {
        const body = await req.json();
        // Now accepts 'structuredData' (preferred) or legacy 'text'
        const structuredData = body?.structuredData;
        const rawText = body?.text;
        const jobDescription = body?.jobDescription;

        if (!jobDescription) {
            return NextResponse.json({ error: 'Missing `jobDescription` in request body' }, { status: 400 });
        }
        if (!structuredData && !rawText) {
            return NextResponse.json({ error: 'Missing `structuredData` (or fallback `text`) in request body' }, { status: 400 });
        }

        // Build the resume payload — prefer structured data for better optimization
        const resumePayload: Record<string, any> = structuredData
            ? structuredData
            : { rawText, sections: {} };

        const result = await optimizeResume(resumePayload, jobDescription);
        return NextResponse.json({ optimizedText: result });
    } catch (err: any) {
        console.error('optimize-resume API error:', err);
        return NextResponse.json({ error: 'Resume optimization failed. Please try again.' }, { status: 500 });
    }
}

/** Spends one AI tool run from the caller's daily quota; refunded if the request fails. */
export const POST = withQuota<Request>('tool', handle);
