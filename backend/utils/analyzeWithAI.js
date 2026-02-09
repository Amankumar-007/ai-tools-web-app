import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const analyzeResume = async (resumeText) => {
  const prompt = `
Analyze the following resume.

1. Give a resume score out of 100.
2. List weak points.
3. Give clear improvement suggestions.

Resume:
${resumeText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};
