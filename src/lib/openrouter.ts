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

// --- Images API ---
export interface ORImageGenOptions {
  prompt: string;
  size?: string; // e.g. "1024x1024"
  model?: string; // default to a reasonable OpenRouter image model
}

export interface ORImageGenResult {
  imageBase64: string;
  mimeType: string;
}

export async function generateImageWithOpenRouter(options: ORImageGenOptions): Promise<ORImageGenResult> {
  const envModel = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image-preview:free';
  const { prompt, size = '1024x1024', model = envModel } = options;
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const referer = process.env.NEXT_PUBLIC_SITE_URL || '';
  const title = process.env.NEXT_PUBLIC_SITE_NAME || 'tomatoTool App';

  const res = await fetch(`${OPENROUTER_BASE}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(referer ? { 'HTTP-Referer': referer } : {}),
      ...(title ? { 'X-Title': title } : {}),
    },
    body: JSON.stringify({ model, prompt, size }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter Images error: ${res.status} ${res.statusText} ${text}`);
  }

  const data: any = await res.json();
  // Try to extract base64 image data from common shapes
  // Shape A (OpenAI-like): { data: [{ b64_json: string }] }
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) {
    return { imageBase64: b64, mimeType: 'image/png' };
  }

  // Shape B: { data: [{ url: string }] } -> fetch and convert to base64
  const url = data?.data?.[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error(`Failed to fetch image URL: ${imgRes.status}`);
    const arrayBuf = await imgRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString('base64');
    // Try to infer mime type from headers, fallback to image/png
    const ct = imgRes.headers.get('content-type') || 'image/png';
    return { imageBase64: base64, mimeType: ct };
  }

  throw new Error('Unexpected OpenRouter Images response format');
}
