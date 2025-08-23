import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = history
      .map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`)
      .join("\n") + `\nUser: ${message}\nBot:`;

    const result = await model.generateContent(prompt);

    return new Response(
      JSON.stringify({ reply: result.response.text() }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ reply: "Error reaching Gemini AI." }), { status: 500 });
  }
}
