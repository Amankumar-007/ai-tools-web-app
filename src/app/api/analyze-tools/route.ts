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

    const prompt = `You are a world-class AI researcher and benchmark architect. Perform an exhaustive, objective, and technical comparison of the following AI tools:
${JSON.stringify(toolsData, null, 2)}

Produce a deep, highly detailed comparison in strict JSON format. The JSON MUST follow this EXACT structure:
{
  "summary": "A 3-4 sentence authoritative executive summary comparing core model architectures, reasoning depth, context windows, and real-world trade-offs between these platforms.",
  "metrics": [
    {
      "name": "ExactToolName1",
      "speed": 92,
      "accuracy": 95,
      "value": 88,
      "innovation": 94,
      "easeOfUse": 90,
      "contextDepth": 96
    }
  ],
  "features": [
    { "feature": "Complex Reasoning & Mathematical Logic", "ExactToolName1": "Exceptional", "ExactToolName2": "Very High" },
    { "feature": "Code Generation & Multi-File Architecture", "ExactToolName1": "Industry-Leading", "ExactToolName2": "Strong" },
    { "feature": "Effective Context Window & Retrieval", "ExactToolName1": "200k Tokens", "ExactToolName2": "128k Tokens" },
    { "feature": "Live Web Browsing & Source Citations", "ExactToolName1": "✓ Native", "ExactToolName2": "✓ Native" },
    { "feature": "Multimodal Input (Vision, Audio, Docs)", "ExactToolName1": "Vision + Files", "ExactToolName2": "Full Multimodal" },
    { "feature": "File & PDF Document Parsing Limits", "ExactToolName1": "Up to 30MB", "ExactToolName2": "Up to 512MB" },
    { "feature": "Free Tier Allowances & Daily Caps", "ExactToolName1": "Generous", "ExactToolName2": "Moderate" },
    { "feature": "API Latency, Reliability & Token Rates", "ExactToolName1": "Fast (<1s TTFT)", "ExactToolName2": "Ultra-Fast" },
    { "feature": "Enterprise Privacy & SOC-2 Compliance", "ExactToolName1": "✓ Available", "ExactToolName2": "✓ Available" }
  ],
  "toolDetails": [
    {
      "name": "ExactToolName1",
      "overallScore": 94,
      "badge": "Best for Coding & Software Engineering",
      "coreStrengths": [
        "Unmatched multi-step reasoning and prompt adherence",
        "Clean, error-free code generation and architectural refactoring",
        "Deep context comprehension with zero hallucination on long documents"
      ],
      "tradeoffs": [
        "Lower hourly rate limits during peak global traffic",
        "Requires paid subscription for frontier reasoning models"
      ],
      "pricingBreakdown": "Free tier available; Pro plan at $20/month; API pay-per-token."
    }
  ],
  "highlights": [
    {
      "title": "Best for Software Engineering & Coding",
      "tool": "ExactToolName",
      "reason": "Technical reason explaining why this platform wins this specific domain."
    },
    {
      "title": "Best for Creative Writing & Nuance",
      "tool": "ExactToolName",
      "reason": "Technical reason explaining why this platform wins this specific domain."
    },
    {
      "title": "Best for Real-Time Research & Citations",
      "tool": "ExactToolName",
      "reason": "Technical reason explaining why this platform wins this specific domain."
    },
    {
      "title": "Best for API Scale & High-Volume Automation",
      "tool": "ExactToolName",
      "reason": "Technical reason explaining why this platform wins this specific domain."
    }
  ],
  "verdict": "A decisive, actionable strategic recommendation detailing exactly when to choose each tool based on specific workflows, team sizes, and budgets."
}

CRITICAL RULES:
1. Every tool listed in the input MUST appear in 'metrics', 'toolDetails', and as a key in every item of 'features'.
2. Return ONLY the raw valid JSON object. No markdown ticks, no commentary.`;

    const callModel = async (modelId: string) => {
      return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://tomatoai.in',
          'X-Title': 'TomatoAI Tool Analysis',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 3500,
        }),
      });
    };

    const modelsToTry = [
      'openrouter/free',
      'google/gemma-4-26b-a4b-it:free',
      'nvidia/nemotron-3.5-lightning:free',
      'google/gemma-4-31b-it:free',
      'nvidia/nemotron-3-nano-30b-a3b:free'
    ];

    let content: string | null = null;
    for (const model of modelsToTry) {
      try {
        const response = await callModel(model);
        if (response.ok) {
          const data = await response.json();
          const candidate = data.choices?.[0]?.message?.content;
          if (candidate && candidate.trim().length > 50) {
            content = candidate;
            break;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next...`, err);
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis generated from AI' },
        { status: 502 }
      );
    }

    // Extract JSON using robust regex
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
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
