import { AnalysisResult } from "../types/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const analyzeResume = async (
  resumeText: string,
  jobDescription?: string
): Promise<AnalysisResult> => {
  const jdPrompt = jobDescription
    ? `Analyze the following resume text AGAINST this Job Description:
       Job Description:
       ${jobDescription}
       
       Provide specific feedback on how well the resume matches the JD.`
    : `Analyze the following resume text and return a general evaluation.`;

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
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical recruiter and ATS expert. You ONLY respond with valid JSON. No explanations."
        },
        {
          role: "user",
          content: `
${jdPrompt}

Return a STRICT JSON response matching this schema:

{
  "score": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": {
    "issue": string,
    "location": string, 
    "suggestion": string,
    "impact": "High" | "Medium" | "Low"
  }[],
  "missingKeywords": string[],
  "improvementTips": string[],
  "atsCompatibility": number,
  "grammarAndStyleScore": number,
  "experienceRelevanceScore": number,
  "suggestedRoles": string[],
  "layoutSuggestions": string[],
  "grammarIssues": {
    "issue": string,
    "location": string,
    "originalText": string,
    "correctedText": string,
    "explanation": string
  }[],
  "ats100Checklist": string[]
}

Notes:
- 'location' should specify where in the resume the issue exists (e.g. 'Project Section', 'Contact Info').
- 'missingKeywords' should list specific skills or terms from the Job Description that are absent in the resume.
- 'improvementTips' should suggest specific additions to improve the overall ATS score.
- 'layoutSuggestions' must be ATS-friendly formatting guidance (sections, fonts, dates, bullets, links, file type).
- 'grammarIssues' should list the most important grammar/style problems with exact before/after rewrites.
- 'ats100Checklist' must be tailored to THIS resume text (and the JD when provided).
  Each checklist item must reference a concrete resume section (e.g. 'Skills', 'Experience', 'Projects', 'Education')
  and describe exactly what to change/add/remove. Avoid generic advice.

Resume Text:
${resumeText}
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
    // Reasoning models like DeepSeek often include <think> tags or markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content.trim();

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Invalid JSON from OpenRouter:", content);
    throw new Error("AI returned invalid JSON format. Please try again.");
  }
};

export const optimizeResume = async (
  resumeText: string,
  jobDescription: string
): Promise<string> => {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Resume Intelligence"
    },
    body: JSON.stringify({
      model: "tngtech/deepseek-r1t2-chimera:free", // Use a stronger model for text generation if available
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

