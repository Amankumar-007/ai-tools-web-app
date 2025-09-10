// app/api/chatgpt/route.ts (Next.js App Router)
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature } = await req.json();

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

    // Kick off OpenRouter streaming request
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        ...(process.env.OPENROUTER_SITE_URL
          ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
          : {}),
        ...(process.env.OPENROUTER_SITE_NAME
          ? { "X-Title": process.env.OPENROUTER_SITE_NAME }
          : {}),
      },
      body: JSON.stringify({
        model :"deepseek/deepseek-chat-v3-0324:free",
        messages,
        temperature: temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!orRes.ok || !orRes.body) {
      const text = await orRes.text().catch(() => "");
      return new Response(
        JSON.stringify({
          error: `OpenRouter error: ${orRes.status} ${orRes.statusText} ${text}`,
        }),
        { status: 502 }
      );
    }

    // Bridge SSE -> client stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const reader = orRes.body!.getReader();
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
          } catch {}
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

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Content-Encoding": "identity",
      },
    });
  } catch (err) {
    console.error("/api/chatgpt stream error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error." }),
      { status: 500 }
    );
  }
}
