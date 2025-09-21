import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate a comprehensive, detailed, and well-structured prompt about "${topic}". The prompt should be:
    
1. Detailed and specific (at least 200-300 words)
2. Well-organized with clear sections
3. Include relevant context, requirements, and constraints
4. Be suitable for AI content generation, creative writing, or technical tasks
5. Include examples or specific details where appropriate
6. Be professional and comprehensive

Format the prompt with clear headings and structure. Make it actionable and detailed enough to guide someone in creating high-quality content about this topic.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedPrompt = response.text();

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
