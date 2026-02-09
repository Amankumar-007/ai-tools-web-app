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

    const metaPrompt = `You are an expert Prompt Engineer with deep knowledge of LLM behavior, prompt optimization, and instructional design. 
    
    Your task is to take the user's input topic: "${topic}" and transform it into a highly effective, professional-grade prompt that can be used with advanced AI models (like GPT-4, Claude 3, Gemini 1.5).

    The generated prompt must be:
    1.  **Comprehensive**: Cover all aspects of the topic.
    2.  **Structured**: Use clear Markdown headings (e.g., # Role, ## Context, ## Task, ## Constraints, ## Output Format).
    3.  **Specific**: Avoid vague language. Define the exact goal.
    4.  **Persona-driven**: Assign a specific role to the AI (e.g., "Act as a Senior Data Scientist" or "Act as a Creative Director").
    5.  **Long and Detailed**: The output prompt should be substantial (approx. 300-500 words) to ensure high-quality results.

    Do NOT just output the prompt. Structure the response as follows:
    
    # [Topic Name] Prompt

    **Prompt Goal:** [Brief explanation of what this prompt achieves]

    ---
    
    [The Actual Prompt Content Goes Here - fully ready to copy and paste]
    
    ---

    Make sure the prompt includes sections for:
    - **Role/Persona**: Who the AI is acting as.
    - **Context/Background**: Essential information.
    - **Step-by-Step Instructions**: What the AI should do.
    - **Constraints/Guidelines**: What to avoid or strictly follow.
    - **Output Format**: How the result should look (e.g., JSON, table, essay).
    
    Generate the best possible prompt now.`;

    const result = await model.generateContent(metaPrompt);
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
