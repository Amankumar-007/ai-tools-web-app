/**
 * Validation of the chat request body. The endpoint is public (anonymous users
 * get a first message), so every field is checked and bounded here.
 */

import {
  AUTO_MODEL,
  LIMITS,
  type ChatContext,
  type ChatTurn,
  type ContextDocument,
  type ContextImage,
} from './types';

export type ParsedChatRequest = {
  turns: ChatTurn[];
  context: ChatContext;
  model: string;
  temperature: number;
};

const MODEL_ID = /^[A-Za-z0-9._\-:/]{1,100}$/;
const IMAGE_URL = /^(?:data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+|https:\/\/[^\s]+)$/;

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function parseTurns(raw: unknown): ChatTurn[] | string {
  if (!Array.isArray(raw)) return 'Add a message before sending.';
  const turns: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as any).role;
    const content = (item as any).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    if (!content.trim()) continue;
    turns.push({ role, content });
  }
  const recent = turns.slice(-LIMITS.maxTurns);
  const last = recent[recent.length - 1];
  if (!last || last.role !== 'user') return 'Add a message before sending.';
  return recent.map((turn, index) => ({
    role: turn.role,
    content: turn.content.slice(0, index === recent.length - 1 ? LIMITS.lastTurnChars : LIMITS.turnChars),
  }));
}

function parseContext(raw: unknown): ChatContext {
  const input = raw && typeof raw === 'object' ? (raw as any) : {};

  const documents: ContextDocument[] = [];
  let docChars = 0;
  for (const item of Array.isArray(input.documents) ? input.documents.slice(0, LIMITS.maxDocuments) : []) {
    if (!item || typeof item !== 'object') continue;
    const excerpt = str(item.excerpt, LIMITS.docExcerptChars);
    if (!excerpt.trim()) continue;
    if (docChars + excerpt.length > LIMITS.docsTotalChars) break;
    docChars += excerpt.length;
    documents.push({
      id: str(item.id, 80),
      name: str(item.name, 120) || 'document',
      excerpt,
      totalChars: Number.isFinite(item.totalChars) ? Math.max(0, Math.floor(item.totalChars)) : excerpt.length,
      pages: Number.isFinite(item.pages) ? Math.max(1, Math.floor(item.pages)) : undefined,
      partial: Boolean(item.partial),
    });
  }

  const images: ContextImage[] = [];
  let pixelImages = 0;
  const rawImages: any[] = Array.isArray(input.images) ? input.images.slice(-LIMITS.maxImages) : [];
  for (const item of rawImages) {
    if (!item || typeof item !== 'object') continue;
    const url = typeof item.url === 'string' && IMAGE_URL.test(item.url) ? item.url : undefined;
    images.push({
      id: str(item.id, 80),
      name: str(item.name, 120) || 'image',
      description: str(item.description, LIMITS.descriptionChars).trim() || undefined,
      attachedNow: Boolean(item.attachedNow),
      url,
    });
  }
  // Keep pixels for at most `maxPixelImages`, preferring the newest.
  for (let i = images.length - 1; i >= 0; i -= 1) {
    if (!images[i].url) continue;
    if (pixelImages < LIMITS.maxPixelImages) pixelImages += 1;
    else images[i] = { ...images[i], url: undefined };
  }

  return { memory: str(input.memory, LIMITS.memoryChars).trim() || undefined, documents, images };
}

export function parseChatRequest(body: unknown): ParsedChatRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Add a message before sending.' };
  const input = body as any;

  const turns = parseTurns(input.messages);
  if (typeof turns === 'string') return { error: turns };

  const model = typeof input.model === 'string' && MODEL_ID.test(input.model.trim()) ? input.model.trim() : AUTO_MODEL;
  const temperature =
    typeof input.temperature === 'number' && Number.isFinite(input.temperature)
      ? Math.min(2, Math.max(0, input.temperature))
      : 0.6;

  return { turns, context: parseContext(input.context), model, temperature };
}
