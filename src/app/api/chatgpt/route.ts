import type { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, model, temperature } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY is not set on the server." }),
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Request body must include non-empty 'messages' array." }),
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        ...(process.env.OPENROUTER_SITE_URL
          ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
          : {}),
        ...(process.env.OPENROUTER_SITE_NAME
          ? { "X-Title": process.env.OPENROUTER_SITE_NAME }
          : {}),
      },
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: messages,
      temperature: temperature ?? 0.7,
      max_tokens: 4096,
    });

    const reply = completion?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (err: unknown) {
    console.error("/api/chatgpt error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error.",  }),
      { status: 500 }
    );
  }
}
