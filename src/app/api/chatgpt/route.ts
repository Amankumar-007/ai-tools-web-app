// app/api/chatgpt/route.ts (Next.js App Router)
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature, model } = await req.json();

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

    // --- Helper for OpenRouter Call ---
    const callOpenRouter = async (modelToUse: string) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          ...(process.env.OPENROUTER_SITE_URL ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL } : {}),
          ...(process.env.OPENROUTER_SITE_NAME ? { "X-Title": process.env.OPENROUTER_SITE_NAME } : {}),
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: temperature ?? 0.7,
          max_tokens: 81920,
          stream: true,
        }),
      });
      return res;
    };

    // --- Helper for OpenAI Direct Call ---
    const callOpenAI = async (modelToUse: string) => {
      if (!process.env.OPENAI_API_KEY) return null;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: temperature ?? 0.7,
          stream: true,
        }),
      });
      return res;
    };

    let response: Response | null = null;
    let usedFallback = false;
    let fallbackModelName = "";

    // 1. Try Primary Model (OpenRouter)
    try {
      response = await callOpenRouter(model || "tngtech/deepseek-r1t2-chimera:free");
      if (!response.ok) {
        console.warn(`Primary model failed: ${response.status} ${response.statusText}`);
        response = null; // Mark as failed to trigger fallback
      }
    } catch (e) {
      console.error("Primary model error:", e);
      response = null;
    }

    // 2. Try Fallback 1: Gemini via OpenRouter
    if (!response) {
      console.log("Switching to Fallback 1: google/gemini-2.0-flash-exp:free (OpenRouter)");
      try {
        response = await callOpenRouter("google/gemini-2.0-flash-exp:free");
        if (response.ok) {
          usedFallback = true;
          fallbackModelName = "Gemini 2.0 Flash (Fallback)";
        } else {
          console.warn(`Fallback 1 failed: ${response.status} ${response.statusText}`);
          response = null;
        }
      } catch (e) {
        console.error("Fallback 1 error:", e);
        response = null;
      }
    }

    // 3. Try Fallback 2: Nemotron via OpenRouter
    if (!response) {
      console.log("Switching to Fallback 2: nvidia/nemotron-3-nano-30b-a3b:free (OpenRouter)");
      try {
        response = await callOpenRouter("nvidia/nemotron-3-nano-30b-a3b:free");
        if (response.ok) {
          usedFallback = true;
          fallbackModelName = "Nemotron 3 Nano (Fallback)";
        } else {
          console.warn(`Fallback 2 failed: ${response.status} ${response.statusText}`);
          response = null;
        }
      } catch (e) {
        console.error("Fallback 2 error:", e);
        response = null;
      }
    }

    // 4. Try Fallback 3: Llama 3.3 via OpenRouter
    if (!response) {
      console.log("Switching to Fallback 3: meta-llama/llama-3.3-70b-instruct:free (OpenRouter)");
      try {
        response = await callOpenRouter("meta-llama/llama-3.3-70b-instruct:free");
        if (response.ok) {
          usedFallback = true;
          fallbackModelName = "Llama 3.3 70B (Fallback)";
        } else {
          console.warn(`Fallback 3 failed: ${response.status} ${response.statusText}`);
          response = null;
        }
      } catch (e) {
        console.error("Fallback 3 error:", e);
        response = null;
      }
    }

    // 5. Try Fallback 4: Qwen 3 via OpenRouter
    if (!response) {
      console.log("Switching to Fallback 4: qwen/qwen3-4b:free (OpenRouter)");
      try {
        response = await callOpenRouter("qwen/qwen3-4b:free");
        if (response.ok) {
          usedFallback = true;
          fallbackModelName = "Qwen 3 4B (Fallback)";
        } else {
          console.warn(`Fallback 4 failed: ${response.status} ${response.statusText}`);
          response = null;
        }
      } catch (e) {
        console.error("Fallback 4 error:", e);
        response = null;
      }
    }

    // 6. Try Fallback 5: GPT-4o-mini via OpenAI Direct
    if (!response) {
      console.log("Switching to Fallback 5: gpt-4o-mini (OpenAI Direct)");
      try {
        const openaiRes = await callOpenAI("gpt-4o-mini");
        if (openaiRes && openaiRes.ok) {
          response = openaiRes;
          usedFallback = true;
          fallbackModelName = "GPT-4o Mini (Fallback)";
        } else {
          if (openaiRes) console.warn(`Fallback 5 failed: ${openaiRes.status} ${openaiRes.statusText}`);
          response = null;
        }
      } catch (e) {
        console.error("Fallback 5 error:", e);
        response = null;
      }
    }

    // If all failed, return error
    if (!response) {
      return new Response(
        JSON.stringify({ error: "All models failed to respond. Please try again later." }),
        { status: 503 }
      );
    }

    // Check if body is null (shouldn't happen if ok is true, but for safety)
    if (!response.body) {
      return new Response(
        JSON.stringify({ error: "Upstream response has no body." }),
        { status: 502 }
      );
    }

    // Bridge SSE -> client stream
    const originalBody = response.body;
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const reader = originalBody.getReader();
        let buffer = "";

        function pushChunk(text: string) {
          controller.enqueue(encoder.encode(text));
        }

        function parseAndForward(lines: string[]) {
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (!trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }

            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                pushChunk(delta); // send raw text chunk to client
              }
            } catch {
              // ignore non-JSON lines
            }
          }
        }

        function onStreamDone() {
          try {
            controller.close();
          } catch { }
        }

        function feed({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<void> | void {
          if (done) return onStreamDone();
          buffer += new TextDecoder().decode(value, { stream: true });

          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop() ?? "";
          parseAndForward(parts);

          return reader.read().then(feed).catch(onStreamDone);
        }

        reader.read().then(feed).catch(onStreamDone);
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/plain; charset=utf-8");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    headers.set("Content-Encoding", "identity");

    if (usedFallback) {
      headers.set("X-Fallback-Model", fallbackModelName);
    }

    return new Response(stream, {
      status: 200,
      headers: headers,
    });
  } catch (err) {
    console.error("/api/chatgpt stream error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}
{/*
const text = `${movie.title}. ${movie.description}. Genres: ${movie.genres.join(", ")}`;

const embedding = await getEmbedding(text);

movie.embedding = embedding;
await movie.save();*/
}