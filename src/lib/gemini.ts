// lib/gemini.ts

export async function optimizeTextWithGemini(userInput: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are a content optimizer. The user will give you raw or boring text. Return:
1. Improved version of the text.
2. A short explanation of what was improved.
3. One tip to make such content better in future.

Input: ${userInput}
`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Couldn't optimize.";
}
