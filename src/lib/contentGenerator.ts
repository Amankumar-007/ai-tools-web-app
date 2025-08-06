export async function generateContentWithGemini(topic: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an expert content creator with a knack for engaging and informative writing. Given a topic, produce a well-structured response with the following components:

1. **Title**: A concise, catchy, and SEO-friendly title (10-15 words) that grabs attention.
2. **Article**: A 200-300 word article that is engaging, informative, and well-organized. Use:
   - An introduction that hooks the reader.
   - 2-3 short paragraphs with clear ideas and smooth transitions.
   - A conclusion that summarizes the key takeaway or includes a call to action.
   - A professional yet approachable tone.
3. **Actionable Tips**: A list of 3 practical, specific, and actionable tips or key points related to the topic. Format as a numbered list with bolded titles for each tip.

**Format the output in markdown** with clear section headers (e.g., ## Title, ## Article, ## Actionable Tips). Ensure the content is original, avoids fluff, and is tailored to the topic.

Topic: ${topic}
`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content generated. Please try a different topic or check the API response.");
    }

    return content;
  } catch (error) {
    console.error("Error generating content:", error);
    return `
## Error
An error occurred while generating content. Please ensure the topic is valid and the API key is correct.
`;
  }
}