import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { tools } = await req.json();

    if (!tools || !Array.isArray(tools) || tools.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tools are required for comparison' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const toolsData = tools.map(t => ({
      name: t.name,
      description: t.description,
      pricing: t.pricing,
      rating: t.rating,
      category: t.category,
      pros: t.pros,
      cons: t.cons,
      bestFor: t.bestFor,
    }));

    const prompt = `You are an expert AI product analyst. Compare the following AI tools in detail:
${JSON.stringify(toolsData, null, 2)}

Provide a comprehensive, professional comparison in JSON format. The JSON should have the following structure:
{
  "summary": "A brief overview of how these tools compare.",
  "metrics": [
    { "name": "ToolName", "speed": 0-100, "accuracy": 0-100, "value": 0-100, "innovation": 0-100, "easeOfUse": 0-100 }
  ],
  "features": [
    { "feature": "Feature Name", "ToolName1": "✓/✗/Partial", "ToolName2": "..." }
  ],
  "highlights": [
    { "title": "Best for X", "tool": "ToolName", "reason": "Short reason" }
  ],
  "verdict": "Final overall recommendation."
}

IMPORTANT: Return ONLY valid JSON. No markdown, no extra text.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tomatoai.in',
        'X-Title': 'TomatoAI Tool Analysis',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate AI analysis' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 502 }
      );
    }

    // Parse the JSON from the AI response - handle markdown code blocks if present
    let analysis;
    try {
      let jsonStr = content.trim();
      // Strip markdown code block wrappers if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis into structured data', raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze tools API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
