/**
 * Reads a JSON request body without ever buffering more than `maxBytes`.
 * `Content-Length` can be missing or wrong (chunked uploads), so the limit is enforced
 * on the bytes actually received, and the stream is cancelled as soon as it is exceeded.
 */

export type BodyResult<T> = { ok: true; data: T } | { ok: false; status: 400 | 413; error: string };

export async function readJsonLimited<T = unknown>(req: Request, maxBytes: number): Promise<BodyResult<T>> {
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413, error: 'Request is too large.' };
  if (!req.body) return { ok: false, status: 400, error: 'A JSON body is required.' };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413, error: 'Request is too large.' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: 'The request body could not be read.' };
  }

  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    return { ok: true, data: JSON.parse(new TextDecoder().decode(bytes)) as T };
  } catch {
    return { ok: false, status: 400, error: 'The request body is not valid JSON.' };
  }
}
