import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_MESSAGE_LENGTH = 10000;

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ reply: 'Invalid or too-long message.' }),
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Gemini 2.5 "thinks" by default and the thinking eats the output budget, truncating short answers; these helpers want direct output.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { thinkingConfig: { thinkingBudget: 0 } } });

    const prompt = history
      .map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`)
      .join("\n") + `\nUser: ${message}\nBot:`;

    const result = await model.generateContent(prompt);

    return new Response(
      JSON.stringify({ reply: result.response.text() }),
      { status: 200 }
    );
  } catch (error) {
    console.error('chat API error:', error);
    return new Response(
      JSON.stringify({ reply: 'Something went wrong. Please try again.' }),
      { status: 500 }
    );
  }
}
