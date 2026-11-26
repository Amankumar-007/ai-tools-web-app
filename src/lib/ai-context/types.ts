/**
 * Shared types for the per-user context store and the model router.
 *
 * The core idea: everything the AI needs to know about a conversation (the
 * documents, the images, the user's standing instructions) lives in the
 * context store as plain, model-independent data. Every request is rebuilt from
 * that store, so whichever model answers — or takes over after a failure —
 * sees exactly the same context.
 */

/** What the user is trying to do. Drives automatic model selection. */
export type TaskType =
  | 'vision'
  | 'code'
  | 'reasoning'
  | 'document'
  | 'writing'
  | 'quick'
  | 'general';

/** Sentinel model id meaning "pick the best model for this task". */
export const AUTO_MODEL = 'tomato/auto';

/** A document whose text was extracted in the browser (PDF, DOCX, text, code…). */
export type ContextDocument = {
  /** Stable id of the stored item. */
  id: string;
  name: string;
  /** Excerpt (or the whole text) selected for this request. */
  excerpt: string;
  /** Length of the full stored text, in characters. */
  totalChars: number;
  pages?: number;
  /** True when `excerpt` is only part of the document. */
  partial: boolean;
};

/** An image the user shared (upload, pasted screenshot, or a scanned PDF page). */
export type ContextImage = {
  id: string;
  name: string;
  /**
   * Model-independent description / transcription of the image. Lets models
   * that cannot see pictures still know what the user shared.
   */
  description?: string;
  /** True for images attached in the message being sent now. */
  attachedNow: boolean;
  /**
   * Pixels for this request, as a `data:image/…` or `https:` URL. Only set when a
   * vision model has to look at the image itself (new image, or one that has no
   * description yet).
   */
  url?: string;
};

/** The context sent with every chat request. */
export type ChatContext = {
  /** The user's standing instructions ("custom instructions"). */
  memory?: string;
  documents: ContextDocument[];
  images: ContextImage[];
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** Limits shared by the client (to stay under them) and the server (to enforce them). */
export const LIMITS = {
  maxTurns: 30,
  turnChars: 12_000,
  lastTurnChars: 30_000,
  maxDocuments: 20,
  docExcerptChars: 80_000,
  docsTotalChars: 140_000,
  maxImages: 16,
  maxPixelImages: 8,
  /** Bytes of image data (as data URLs) the browser sends in one request. */
  pixelBudgetBytes: 3_200_000,
  descriptionChars: 8_000,
  memoryChars: 2_000,
  /** Request body ceiling; Vercel rejects bodies above 4.5 MB. */
  maxBodyBytes: 4_200_000,
  /** Characters of document text sent to the model per request (client-side budget). */
  docBudgetChars: 60_000,
} as const;
