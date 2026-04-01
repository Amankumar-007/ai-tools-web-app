import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
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

    const prompt = `You are an AI tools expert. Find the 10 best AI tools for the category: "${category}".

Include a good mix of free and paid tools. For each tool, provide:
- name: The tool's name
- description: A concise 1-2 sentence description of what it does
- website: The official website URL (must be a real, valid URL)
- pricing: One of "Free", "Freemium", or "Paid"
- rating: A rating from 1 to 5 (can use decimals like 4.7)
- category: The sub-category it belongs to within "${category}"

IMPORTANT: Return ONLY a valid JSON array with no markdown formatting, no code blocks, no extra text. Just the raw JSON array like:
[{"name":"...","description":"...","website":"https://...","pricing":"Free","rating":4.5,"category":"..."}]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tomatoai.in',
        'X-Title': 'TomatoAI Tools',
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
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch AI tools from OpenRouter' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 502 }
      );
    }

    // Parse the JSON from the AI response - handle markdown code blocks if present
    let tools;
    try {
      let jsonStr = content.trim();
      // Strip markdown code block wrappers if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      tools = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          tools = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse AI response' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to parse AI response' },
          { status: 500 }
        );
      }
    }

    // Validate and sanitize the tools data
    const sanitizedTools = tools.map((tool: any, index: number) => ({
      id: index + 1,
      name: tool.name || 'Unknown Tool',
      description: tool.description || 'No description available',
      website: tool.website || '#',
      pricing: ['Free', 'Freemium', 'Paid'].includes(tool.pricing) ? tool.pricing : 'Freemium',
      rating: typeof tool.rating === 'number' ? Math.min(5, Math.max(0, tool.rating)) : 4.0,
      category: tool.category || category,
    }));

    return NextResponse.json({ tools: sanitizedTools });
  } catch (error) {
    console.error('Category tools API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
