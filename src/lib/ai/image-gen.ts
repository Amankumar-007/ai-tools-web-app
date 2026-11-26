import 'server-only';

/**
 * Text-to-image through OpenRouter's Images API (`POST /api/v1/images`).
 *
 * Default model: Recraft V4.1 Flash V2 (free variant). Generation only: no image inputs or styles.
 * Set OPENROUTER_IMAGE_MODEL to change it. The free variant is retired on 2026-11-28; from then on use the paid
 * id `recraft/recraft-v4.1-flash-v2` (paid endpoints stay available).
 */

export const DEFAULT_IMAGE_MODEL = 'recraft/recraft-v4.1-flash-v2:free';

/** Ratios offered to callers; OpenRouter clamps to what the model supports. */
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export function parseAspectRatio(value: unknown): AspectRatio {
  return (ASPECT_RATIOS as readonly string[]).includes(String(value)) ? (value as AspectRatio) : '1:1';
}

export type GeneratedImage = { imageBase64: string; mimeType: string; model: string };

/** Failure with a safe message for the user and the upstream status for the caller. */
export class ImageGenError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const TIMEOUT_MS = 90_000;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_MIME = /^image\/(png|jpeg|webp|gif|svg\+xml)$/;

function imageModel(): string {
  const configured = (process.env.OPENROUTER_IMAGE_MODEL || '').trim();
  return /^[A-Za-z0-9._\-:/]{1,100}$/.test(configured) ? configured : DEFAULT_IMAGE_MODEL;
}

export async function generateImage(options: { prompt: string; aspectRatio?: AspectRatio; signal?: AbortSignal }): Promise<GeneratedImage> {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  if (!apiKey) throw new ImageGenError('Image generation is not configured.', 503);
  const base = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
  const model = imageModel();

  let res: Response;
  try {
    res = await fetch(`${base}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'TomatoAI',
      },
      // b64_json is the default; asking for it explicitly keeps us independent of expiring URLs.
      body: JSON.stringify({ model, prompt: options.prompt, aspect_ratio: options.aspectRatio ?? '1:1', response_format: 'b64_json' }),
      signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ImageGenError('The image service did not respond. Please try again.', 503);
  }

  if (!res.ok) {
    await res.body?.cancel().catch(() => {});
    console.warn(`Image provider rejected ${model}: ${res.status}`);
    if (res.status === 429) throw new ImageGenError('Image generation is busy right now. Please wait a moment and try again.', 429);
    if (res.status === 400) throw new ImageGenError('That request could not be turned into an image. Try describing it differently.', 422);
    if (res.status === 401 || res.status === 402 || res.status === 403) throw new ImageGenError('The image service needs attention. Please try again later.', 503);
    throw new ImageGenError('Image generation is unavailable right now. Please try again in a moment.', 503);
  }

  const data = (await res.json().catch(() => null)) as { data?: Array<{ b64_json?: unknown; media_type?: unknown; url?: unknown }> } | null;
  const item = data?.data?.[0];
  let base64: string | undefined = typeof item?.b64_json === 'string' ? item.b64_json : undefined;
  let mimeType: string = typeof item?.media_type === 'string' ? item.media_type : 'image/png';

  // Some providers answer with a (24 h) signed URL instead; fetch it now so the image is ours to keep.
  if (!base64 && typeof item?.url === 'string' && /^https:\/\//.test(item.url)) {
    const file = await fetch(item.url, { signal: AbortSignal.timeout(30_000) }).catch(() => null);
    if (file?.ok) {
      const bytes = Buffer.from(await file.arrayBuffer());
      base64 = bytes.toString('base64');
      mimeType = (file.headers.get('content-type') || mimeType).split(';')[0].trim();
    }
  }

  if (!base64 || !IMAGE_MIME.test(mimeType) || base64.length > MAX_IMAGE_BYTES * 1.4) {
    throw new ImageGenError('The image service returned no picture. Please try again.', 503);
  }
  return { imageBase64: base64, mimeType, model };
}
