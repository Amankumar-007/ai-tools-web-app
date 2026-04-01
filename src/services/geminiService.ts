import { AnalysisResult } from "../types/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Analyze a structured resume JSON (from the structuring pipeline) against
 * an optional job description. Using structured data gives the model
 * cleaner, more precise context, leading to significantly better analysis.
 */
export const analyzeResume = async (
  resumeData: Record<string, any>,
  jobDescription?: string
): Promise<AnalysisResult> => {
  // Build a human-readable, context-rich summary from the structured data for the prompt.
  const structuredContext = buildStructuredContext(resumeData);

  const jdPrompt = jobDescription
    ? `Analyze the resume SPECIFICALLY AGAINST this Job Description:
       Job Description:
       ${jobDescription}
       
       Provide targeted feedback on missing skills, keyword gaps, and match quality.`
    : `Perform a general expert evaluation of this resume for career optimization.`;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Resume Intelligence"
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-nano-30b-a3b:free",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical recruiter and ATS expert with 15+ years of experience. You ONLY respond with valid JSON. No explanations, no markdown, no extra text — pure JSON only."
        },
        {
          role: "user",
          content: `
${jdPrompt}

I am providing you a STRUCTURED JSON resume object for precise analysis. Use this structured data for maximum accuracy instead of raw text.

STRUCTURED RESUME JSON:
${structuredContext}

Return a STRICT JSON response matching this exact schema:

{
  "score": number (0-100, overall resume strength),
  "summary": string (concise 2-3 sentence professional evaluation),
  "strengths": string[] (5-8 specific, concrete strengths referencing actual resume content),
  "weaknesses": {
    "issue": string,
    "location": string (exact section name from the resume: e.g. "Experience at XYZ Corp", "Skills Section"),
    "suggestion": string (concrete, actionable fix),
    "impact": "High" | "Medium" | "Low"
  }[],
  "missingKeywords": string[] (specific skills/tools absent from resume ${jobDescription ? "that appear in the JD" : "that are important for their domain"}),
  "improvementTips": string[] (6-10 specific, actionable tips referencing actual sections),
  "atsCompatibility": number (0-100, ATS parsing friendliness score),
  "grammarAndStyleScore": number (0-100),
  "experienceRelevanceScore": number (0-100),
  "suggestedRoles": string[] (5-8 job titles that best match this profile),
  "layoutSuggestions": string[] (ATS-formatting guidance specific to this resume structure),
  "grammarIssues": {
    "issue": string,
    "location": string,
    "originalText": string,
    "correctedText": string,
    "explanation": string
  }[],
  "ats100Checklist": string[] (10-15 specific, tailored action items to reach 100 ATS score — each must reference actual resume sections)
}

IMPORTANT RULES:
- All feedback must be SPECIFIC to this candidate — no generic advice.
- 'location' must name actual sections visible in the resume (e.g., "Projects > E-Commerce App", "Experience at Google").
- 'score' should reflect real quality: don't inflate or deflate without reason.
- Base 'experienceRelevanceScore' on years of experience and seniority level: ${resumeData.seniorityLevel || "Unknown"}, ${resumeData.totalYearsExperience || 0} years, domain: ${resumeData.primaryDomain || "General"}.
          `
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

  try {
    // Robust JSON extraction: Find the first { and last } to isolate the object
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content.trim();
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Invalid JSON from OpenRouter:", content);
    throw new Error("AI returned invalid JSON format. Please try again.");
  }
};

/**
 * Build a structured, readable context string from the structured resume JSON
 * so the model can reason about specific sections and details precisely.
 */
function buildStructuredContext(data: Record<string, any>): string {
  return JSON.stringify(data, null, 2);
}

export const optimizeResume = async (
  resumeData: Record<string, any>,
  jobDescription: string
): Promise<string> => {
  // Use rawText for rewriting (the model needs prose, not JSON, for text generation)
  const resumeText = resumeData.rawText || JSON.stringify(resumeData, null, 2);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Resume Intelligence"
    },
    body: JSON.stringify({
      model: "tngtech/deepseek-r1t2-chimera:free",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Your goal is to rewrite/fix the user's resume to perfectly match the provided job description while maintaining honesty and professional formatting."
        },
        {
          role: "user",
          content: `
            Please rewrite the following resume to better align with the job description provided. 
            Highlight relevant skills, optimize for ATS keywords, and improve the professional tone.
            Maintain the original structure but enhance the content.
            
            Job Description:
            ${jobDescription}
            
            Current Resume Text:
            ${resumeText}
            
            Return the optimized resume in a clean, professional markdown format.
          `
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${err}`);
  }

  const data = await response.json();
  const optimizedText = data?.choices?.[0]?.message?.content;

  if (!optimizedText) {
    throw new Error("AI failed to generate an optimized resume");
  }

  return optimizedText;
};

export const generateRoadmap = async (prompt: string): Promise<any> => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Roadmap Generator"
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-nano-30b-a3b:free",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are an expert developer and career advisor. Given a topic, generate a structured roadmap of skills or concepts to learn. Only return a STRICT JSON object. No markdown wrappers, no explanations."
        },
        {
          role: "user",
          content: `
Topic: ${prompt}

You are a senior developer, career coach, and curriculum designer.

Generate a HIGH-QUALITY, PRACTICAL, and INDUSTRY-READY learning roadmap.

The roadmap MUST:
- Be structured from beginner → intermediate → advanced
- Focus on REAL SKILLS used in jobs (not theory only)
- Include HANDS-ON PROJECTS at key stages
- Include BEST FREE RESOURCES (YouTube, docs, GitHub, courses)
- Avoid generic or vague steps
- Each step should feel actionable and useful

Return STRICT JSON in this exact schema:

{
  "title": "Clear and specific roadmap title",
  "description": "Short but powerful overview explaining what user will achieve",
  "level": "Beginner | Intermediate | Advanced",
  "estimatedTime": "e.g. 3-6 months",
  "nodes": [
    {
      "id": "1",
      "label": "Topic Name",
      "type": "topic",
      "level": "Beginner | Intermediate | Advanced",
      "description": "Clear explanation of what to learn and WHY it matters",
      "skills": ["specific skill 1", "specific skill 2"],
      "projects": [
        "Real-world project idea 1",
        "Real-world project idea 2"
      ],
      "resources": [
        {
          "title": "Resource Name",
          "type": "youtube | docs | article | course",
          "url": "https://example.com"
        }
      ],
      "outcome": "What user will be able to do after completing this step"
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

STRICT RULES:
- Generate 10–18 nodes
- Follow a clear progression path
- Every node MUST include skills, projects, and resources
- Resources must be REAL and high-quality (no fake links)
- Projects must be practical and portfolio-worthy
- No generic phrases like "learn basics" — be specific
- Output ONLY valid JSON (no markdown, no explanation)
`
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
    throw new Error("AI returned an empty response for Roadmap");
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content.trim();
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Invalid JSON from OpenRouter:", content);
    throw new Error("AI returned invalid JSON format. Please try again.");
  }
};
