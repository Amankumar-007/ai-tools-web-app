import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function aiFeedback(text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert resume reviewer."
      },
      {
        role: "user",
        content: `
Analyze this resume and:
1. List key improvements
2. Suggest missing sections
3. Rewrite one weak bullet professionally

Resume:
${text}
`
      }
    ]
  });

  return completion.choices[0].message.content;
}
