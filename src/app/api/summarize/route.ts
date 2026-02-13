import { NextResponse } from 'next/server';

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type SummaryType = "general" | "bullet" | "executive" | "academic";
type FeatureType = "summary" | "keywords" | "questions" | "analysis";

const getPrompt = (text: string, feature: FeatureType, summaryType?: SummaryType): string => {
  switch (feature) {
    case "summary":
      const prompts: Record<SummaryType, string> = {
        general: `Provide a clear and concise summary of the following text in 3-5 key points:\n\n${text}\n\nFormat your response as:\n• Key point 1\n• Key point 2\n• Key point 3`,
        bullet: `Create a bullet-point summary of the main ideas from this text. Use proper bullet points (• or ●) and ensure each point is concise:\n\n${text}\n\nFormat your response as:\n● Main idea 1\n● Main idea 2\n● Main idea 3\n● Main idea 4`,
        executive: `Write an executive summary highlighting the most critical information. Use **bold** for key terms and underline important concepts:\n\n${text}\n\nFormat with clear sections and emphasis on critical points.`,
        academic: `Provide an academic-style summary with key findings and conclusions. Use proper formatting with **bold** key terms and _underlined_ important concepts:\n\n${text}\n\nInclude: Introduction, Key Findings, Conclusions`,
      };
      return prompts[summaryType || "general"];

    case "keywords":
      return `Extract the most important keywords and key phrases from this text. Return them as **bold** keywords with brief descriptions:\n\n${text}\n\nFormat as:\n• **Keyword 1**: Brief description\n• **Keyword 2**: Brief description`;

    case "questions":
      return `Based on this text, generate 5 thoughtful questions that test understanding of the main concepts. Number them clearly:\n\n${text}\n\nFormat as:\n1. Question about concept 1?\n2. Question about concept 2?\n3. Question about concept 3?\n4. Question about concept 4?\n5. Question about concept 5?`;

    case "analysis":
      return `Analyze this content and provide insights about:\n1. **Main themes** - Identify the primary topics\n2. **Tone and sentiment** - Describe the emotional tone\n3. **Target audience** - Who would benefit from this\n4. **Key takeaways** - Most important points\n\nUse **bold** headers and _underline_ key terms.\n\nText:\n${text}`;

    default:
      return `Summarize this text:\n\n${text}`;
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, feature = "summary", summaryType = "general" } = body;

    if (!text) {
      return NextResponse.json({ error: 'Missing text in request body' }, { status: 400 });
    }

    const prompt = getPrompt(text, feature, summaryType);

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "AI Content Summarizer"
      },
      body: JSON.stringify({
        model: "arcee-ai/trinity-large-preview:free",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error: ${err}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned an empty response");
    }

    return NextResponse.json({ result: content });
  } catch (err: any) {
    console.error('Summarize API error:', err);
    return NextResponse.json({ error: err.message || 'Summarization failed' }, { status: 500 });
  }
}
