import { NextResponse } from 'next/server';

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rawText: string = body?.rawText;

        if (!rawText || rawText.trim().length < 50) {
            return NextResponse.json({ error: 'Missing or too-short `rawText` in request body' }, { status: 400 });
        }

        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Resume Intelligence - Structuring"
            },
            body: JSON.stringify({
                model: "nvidia/nemotron-3-nano-30b-a3b:free",
                temperature: 0.1,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert resume parser. Your ONLY job is to read raw, messy resume text extracted from a PDF and return a perfectly structured JSON object. You NEVER add explanations. You ONLY output valid JSON."
                    },
                    {
                        role: "user",
                        content: `Parse the following raw resume text into a structured JSON object.

STRICT JSON SCHEMA to follow:
{
  "contact": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "portfolio": string,
    "other": string[]
  },
  "summary": string,
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "responsibilities": string[]
    }
  ],
  "education": [
    {
      "degree": string,
      "field": string,
      "institution": string,
      "location": string,
      "graduationYear": string,
      "gpa": string,
      "achievements": string[]
    }
  ],
  "skills": {
    "technical": string[],
    "soft": string[],
    "tools": string[],
    "languages": string[],
    "frameworks": string[],
    "databases": string[],
    "cloud": string[],
    "other": string[]
  },
  "projects": [
    {
      "name": string,
      "description": string,
      "technologies": string[],
      "link": string,
      "highlights": string[]
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "date": string,
      "link": string
    }
  ],
  "achievements": string[],
  "publications": string[],
  "volunteering": string[],
  "languages": [
    {
      "language": string,
      "proficiency": string
    }
  ],
  "totalYearsExperience": number,
  "seniorityLevel": "Entry" | "Mid" | "Senior" | "Lead" | "Executive",
  "primaryDomain": string,
  "rawText": string
}

Rules:
- Fill every field you can extract from the raw text. Use empty string "" or empty array [] for missing fields.
- "rawText" should be the original raw text passed in.
- Be precise — do NOT hallucinate information not present in the resume.
- Dates should be in "MMM YYYY" format where possible (e.g., "Jan 2022").
- For skills, categorize them intelligently (React = frameworks, Python = technical, AWS = cloud, etc.).
- Estimate "totalYearsExperience" from the experience section dates.
- Determine "seniorityLevel" based on years of experience and job titles.
- "primaryDomain" should describe the candidate's main field (e.g., "Frontend Development", "Data Science", "DevOps", etc.)

Raw Resume Text:
${rawText}
`
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter API error during structuring: ${err}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("AI returned empty response during resume structuring");
        }

        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content.trim();

        try {
            const structured = JSON.parse(jsonString);
            // Always include rawText for fallback scenarios
            structured.rawText = rawText;
            return NextResponse.json(structured);
        } catch {
            console.error("Invalid JSON from structuring model:", content);
            // Graceful fallback: return as minimal wrapper
            return NextResponse.json({ rawText, sections: {}, parseError: true });
        }
    } catch (err: any) {
        console.error('structure-resume API error:', err);
        return NextResponse.json({ error: 'Resume structuring failed. Please try again.' }, { status: 500 });
    }
}
