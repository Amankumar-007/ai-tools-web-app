import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import toolsData from '@/data/ai-tools.json';

// Global cache for AI results to persist across requests in the same execution environment
const aiCache = new Map<string, any>();

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

    const normalizedCategory = category.toLowerCase().trim();

    // 1. QUICKEST: Check in-memory cache first
    if (aiCache.has(normalizedCategory)) {
      console.log(`Cache hit for category: ${category}`);
      return NextResponse.json({ tools: aiCache.get(normalizedCategory), source: 'cache' });
    }

    // 2. FAST: Check local ai-tools.json which is loaded at build/init time
    const localTools = toolsData
      .filter((tool: any) =>
        tool.category?.toLowerCase() === normalizedCategory ||
        normalizedCategory.includes(tool.category?.toLowerCase()) ||
        tool.category?.toLowerCase().includes(normalizedCategory)
      )
      .map((tool: any, index: number) => ({
        id: `local-${index + 1}`,
        name: tool.name,
        description: tool.description,
        website: tool.website,
        pricing: tool.pricing,
        rating: tool.rating,
        category: tool.category,
      }));

    // If we have a good number of local tools (>= 5), return them immediately
    if (localTools.length >= 5) {
      console.log(`Local data hit for category: ${category} (${localTools.length} tools)`);
      aiCache.set(normalizedCategory, localTools); // Cache it too
      return NextResponse.json({ tools: localTools, source: 'local' });
    }

    // 3. FALLBACK: Fetch from OpenRouter if local data is insufficient
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // If we have some local tools but not enough, and no API key, just return what we have
      if (localTools.length > 0) {
        return NextResponse.json({ tools: localTools, source: 'local-incomplete' });
      }
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `AI tools expert. List 10 tools for category: "${category}". 
Return raw JSON array ONLY. Format: [{"name":"...","description":"...","website":"https://...","pricing":"Free/Freemium/Paid","rating":4.5,"category":"..."}]`;

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
        temperature: 0.1, // Lower temperature for more consistent results and potentially faster generation
        max_tokens: 1500, // Reduced from 4000 to improve latency
      }),
    });

    if (!response.ok) {
      if (localTools.length > 0) {
        return NextResponse.json({ tools: localTools, source: 'local-fallback' });
      }
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch AI tools' },
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

    // Parse the JSON from the AI response
    let tools;
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      tools = JSON.parse(jsonStr);
    } catch (parseError) {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          tools = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json({ error: 'Parse error' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
      }
    }

    // Validate and sanitize
    const sanitizedTools = tools.map((tool: any, index: number) => ({
      id: `ai-${index + 1}`,
      name: tool.name || 'Unknown Tool',
      description: tool.description || 'No description',
      website: tool.website || '#',
      pricing: ['Free', 'Freemium', 'Paid'].includes(tool.pricing) ? tool.pricing : 'Freemium',
      rating: typeof tool.rating === 'number' ? Math.min(5, Math.max(0, tool.rating)) : 4.0,
      category: tool.category || category,
    }));

    // Cache the result for future requests
    aiCache.set(normalizedCategory, sanitizedTools);

    return NextResponse.json({ tools: sanitizedTools, source: 'ai' });
  } catch (error) {
    console.error('Category tools API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
