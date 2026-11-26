/**
 * Browser-side glue between the context store and the chat endpoint:
 *  - `commitAttachments` saves what the user just attached into the store.
 *  - `buildChatContext` assembles the context for one request from the store.
 *  - `ensureImageDescriptions` fills in model-independent descriptions.
 */

import { authFetch } from '@/lib/auth-fetch';
import { mentionsImage } from './heuristics';
import type { ProcessedFile } from './file-processing';
import { selectExcerpts } from './retrieval';
import {
  blobToDataUrl,
  listConversationItems,
  putItems,
  setImageDescription,
  type StoredDocument,
  type StoredImage,
  type StoredItem,
} from './store';
import { LIMITS, type ChatContext, type ContextImage } from './types';

export type MessageAttachment = {
  /** Id of the stored document or image. */
  id: string;
  kind: 'image' | 'document';
  name: string;
  mime: string;
  size: number;
  /** Document had no text; its pages were stored as images. */
  scanned?: boolean;
};

function newId(): string {
  return `ctx_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Save freshly processed files into the user's store, scoped to one conversation. */
export async function commitAttachments(
  uid: string,
  convoId: string,
  files: ProcessedFile[]
): Promise<{ attachments: MessageAttachment[]; newItemIds: Set<string> }> {
  const now = Date.now();
  const items: StoredItem[] = [];
  const attachments: MessageAttachment[] = [];
  const newItemIds = new Set<string>();
  let tick = 0;

  for (const file of files) {
    const base = { uid, convoId, name: file.name, mime: file.mime, size: file.size };
    if (file.kind === 'image') {
      const item: StoredImage = {
        ...base, id: newId(), createdAt: now + tick++, kind: 'image', source: 'upload',
        blob: file.image.blob, width: file.image.width, height: file.image.height,
      };
      items.push(item);
      newItemIds.add(item.id);
      attachments.push({ id: item.id, kind: 'image', name: file.name, mime: file.mime, size: file.size });
      continue;
    }

    const doc: StoredDocument = {
      ...base, id: newId(), createdAt: now + tick++, kind: 'document',
      text: file.text, pages: file.pages, truncated: file.truncated, scanned: file.scanned,
    };
    items.push(doc);
    newItemIds.add(doc.id);
    attachments.push({ id: doc.id, kind: 'document', name: file.name, mime: file.mime, size: file.size, scanned: file.scanned || undefined });

    file.pageImages.forEach((page, index) => {
      const image: StoredImage = {
        ...base, id: newId(), createdAt: now + tick++, kind: 'image', source: 'pdf-page',
        name: `${file.name} (page ${index + 1})`, mime: 'image/jpeg', size: page.blob.size,
        blob: page.blob, width: page.width, height: page.height,
      };
      items.push(image);
      newItemIds.add(image.id);
    });
  }

  await putItems(items);
  return { attachments, newItemIds };
}

/** Images from older messages that were uploaded to Cloudinary instead of the store. */
export type LegacyImage = { id: string; name: string; url: string };

export async function buildChatContext(opts: {
  uid: string;
  convoId: string;
  /** Used to pick relevant document passages: the current question plus the previous one, for follow-ups. */
  query: string;
  /** Only the message being sent now: decides whether images need to be looked at again. */
  question: string;
  memory: string;
  /** Items attached in the message being sent. */
  newItemIds: Set<string>;
  legacyImages?: LegacyImage[];
}): Promise<ChatContext> {
  const items = await listConversationItems(opts.uid, opts.convoId);
  const docs = items.filter((item): item is StoredDocument => item.kind === 'document');
  const stored = items.filter((item): item is StoredImage => item.kind === 'image');

  const documents = selectExcerpts(
    docs.map((doc) => ({ id: doc.id, name: doc.name, text: doc.text, pages: doc.pages })),
    opts.query,
    LIMITS.docBudgetChars
  );

  // Oldest → newest; legacy (remote URL) images came from earlier messages.
  const all: Array<{ image: ContextImage; blob?: Blob; remoteUrl?: string }> = [
    ...(opts.legacyImages ?? []).map((legacy) => ({
      image: { id: legacy.id, name: legacy.name, attachedNow: false } as ContextImage,
      remoteUrl: legacy.url,
    })),
    ...stored.map((item) => ({
      image: { id: item.id, name: item.name, description: item.description, attachedNow: opts.newItemIds.has(item.id) } as ContextImage,
      blob: item.blob,
    })),
  ].slice(-LIMITS.maxImages);

  // Which images does a vision model need to actually look at?
  //  - ones attached now, and ones we have no description for yet
  //  - the latest couple when the question is about "the image"/"the screenshot"
  const aboutImage = mentionsImage(opts.question);
  const latestTwo = new Set(all.slice(-2).map((entry) => entry.image.id));
  const wantsPixels = all.filter(
    ({ image }) => image.attachedNow || !image.description || (aboutImage && latestTwo.has(image.id))
  );
  // Newest first, within the count and byte budgets.
  const byRecency = [...wantsPixels].reverse();
  const withPixels = new Map<string, string>();
  let bytes = 0;
  for (const entry of byRecency) {
    if (withPixels.size >= LIMITS.maxPixelImages) break;
    const url = entry.remoteUrl ?? (entry.blob ? await blobToDataUrl(entry.blob) : undefined);
    if (!url) continue;
    if (!entry.remoteUrl && bytes + url.length > LIMITS.pixelBudgetBytes) continue;
    if (!entry.remoteUrl) bytes += url.length;
    withPixels.set(entry.image.id, url);
  }

  return {
    memory: opts.memory.trim().slice(0, LIMITS.memoryChars) || undefined,
    documents,
    images: all.map(({ image }) => ({ ...image, url: withPixels.get(image.id) })),
  };
}

const describing = new Set<string>();

/**
 * Ask a vision model once to describe each image that has no description yet, and
 * keep the text in the store. Best effort and silent: when it fails (signed out,
 * rate limited) the next request simply sends the pixels again.
 */
export async function ensureImageDescriptions(uid: string, convoId: string): Promise<void> {
  // The describe endpoint requires a signed-in user.
  if (uid === 'anon') return;
  const items = await listConversationItems(uid, convoId);
  const pending = items.filter((item): item is StoredImage => item.kind === 'image' && !item.description && !describing.has(item.id));
  for (const image of pending) {
    describing.add(image.id);
    try {
      const response = await authFetch('/api/context/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: await blobToDataUrl(image.blob), mode: image.source === 'pdf-page' ? 'ocr' : 'describe' }),
      });
      if (!response.ok) continue;
      const { description } = (await response.json()) as { description?: string };
      if (typeof description === 'string' && description.trim()) await setImageDescription(uid, image.id, description.trim());
    } catch {
      // Ignore: retried on a later turn.
    } finally {
      describing.delete(image.id);
    }
  }
}
