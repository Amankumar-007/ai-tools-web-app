// src/lib/openrouter.ts

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export type OpenRouterRole = 'system' | 'user' | 'assistant';

export interface ORMessagePartText {
  type: 'text';
  text: string;
}

export interface ORMessagePartImageUrl {
  type: 'image_url';
  image_url: { url: string };
}

export type ORMessageContent = ORMessagePartText | ORMessagePartImageUrl;

export interface ORMessage {
  role: OpenRouterRole;
  content: ORMessageContent[] | string; // OpenRouter accepts both structured and plain string
}

export interface ORChatCompletionRequest {
  model: string;
  messages: ORMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ORChoice {
  index: number;
  message: { role: OpenRouterRole; content: string };
}

export interface ORChatCompletionResponse {
  id: string;
  choices: ORChoice[];
}

function getHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');
  const referer = process.env.NEXT_PUBLIC_SITE_URL || '';
  const title = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Tools App';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (referer) headers['HTTP-Referer'] = referer;
  if (title) headers['X-Title'] = title;
  return headers;
}

export async function openrouterChat(req: ORChatCompletionRequest): Promise<ORChatCompletionResponse> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter error: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

// Vision helper with google/gemini-2.5-flash-image-preview:free
// Note: gemini-2.5-flash-image-preview is a vision model (analysis), not text-to-image.
export async function analyzeImageWithOpenRouter(imageUrl: string, question: string) {
  const response = await openrouterChat({
    model: 'google/gemini-2.5-flash-image-preview:free',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: question },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  const text = response?.choices?.[0]?.message?.content || '';
  return text;
}

// Image generation lives in src/lib/ai/image-gen.ts (Recraft through the Images API).
