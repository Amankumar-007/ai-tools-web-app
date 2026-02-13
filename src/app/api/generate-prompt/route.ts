import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, model } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is missing from environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API Key is missing.' },
        { status: 500 }
      );
    }

    const selectedModel = "nvidia/nemotron-3-nano-30b-a3b:free";

    const metaPrompt = `You are a world-class Prompt Engineer.
    
    Transform this idea into a professional prompt:
    "${topic}"

    Format as:
    # Title
    **Engineered for**: ${selectedModel}
    **Complexity**: Advanced
    ---
    [PROMPT]
    ---
    **Why this works**: [Explanation]`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "TomatoAI",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: metaPrompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const msg = errorData?.error?.message || `OpenRouter error: ${res.status}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt
    });

  } catch (error: any) {
    console.error('Error in generate-prompt:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
