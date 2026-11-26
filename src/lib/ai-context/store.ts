/**
 * Per-user context store (browser only).
 *
 * Holds everything the user shared in each conversation — extracted document
 * text, images and their descriptions — in IndexedDB, keyed by user id. It is
 * model-independent: chat requests are rebuilt from it each time, which is what
 * lets the model change mid-conversation without losing context.
 *
 * Uses IndexedDB (not localStorage) because images and long documents would
 * blow past localStorage's ~5 MB limit. Falls back to memory if IndexedDB is
 * unavailable (some private modes), so the app keeps working for that session.
 */

type Base = {
  id: string;
  /** Owner: the Supabase user id, or "anon". */
  uid: string;
  convoId: string;
  name: string;
  mime: string;
  size: number;
  createdAt: number;
};

export type StoredDocument = Base & {
  kind: 'document';
  text: string;
  pages?: number;
  /** The original had more text than we keep. */
  truncated: boolean;
  /** The PDF had no text layer; its pages are stored as images instead. */
  scanned: boolean;
};

export type StoredImage = Base & {
  kind: 'image';
  blob: Blob;
  width: number;
  height: number;
  /** Text description / transcription, filled in after the first answer. */
  description?: string;
  source: 'upload' | 'pdf-page' | 'generated';
};

export type StoredItem = StoredDocument | StoredImage;

const DB_NAME = 'tomato-ai-context';
const STORE = 'items';

let dbPromise: Promise<IDBDatabase | null> | null = null;
const memory = new Map<string, StoredItem>();
let useMemory = false;

function openDb(): Promise<IDBDatabase | null> {
  if (useMemory || typeof indexedDB === 'undefined') {
    useMemory = true;
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('byConvo', ['uid', 'convoId']);
          store.createIndex('byUid', 'uid');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => { useMemory = true; resolve(null); };
        request.onblocked = () => { useMemory = true; resolve(null); };
      } catch {
        useMemory = true;
        resolve(null);
      }
    });
  }
  return dbPromise;
}

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function finished(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

export async function putItems(items: StoredItem[]): Promise<void> {
  if (items.length === 0) return;
  const db = await openDb();
  if (db) {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      for (const item of items) tx.objectStore(STORE).put(item);
      await finished(tx);
      return;
    } catch (error) {
      // e.g. quota exceeded, or Blobs unsupported: keep this session working in memory.
      console.warn('Context store write failed, keeping items in memory:', error);
      useMemory = true;
    }
  }
  for (const item of items) memory.set(item.id, item);
}

export async function getItem(uid: string, id: string): Promise<StoredItem | undefined> {
  const db = await openDb();
  if (db) {
    try {
      const item = (await done(db.transaction(STORE).objectStore(STORE).get(id))) as StoredItem | undefined;
      if (item && item.uid === uid) return item;
    } catch (error) {
      console.warn('Context store read failed:', error);
    }
  }
  const fallback = memory.get(id);
  return fallback && fallback.uid === uid ? fallback : undefined;
}

export async function listConversationItems(uid: string, convoId: string): Promise<StoredItem[]> {
  const found = new Map<string, StoredItem>();
  const db = await openDb();
  if (db) {
    try {
      const rows = (await done(
        db.transaction(STORE).objectStore(STORE).index('byConvo').getAll(IDBKeyRange.only([uid, convoId]))
      )) as StoredItem[];
      for (const row of rows) found.set(row.id, row);
    } catch (error) {
      console.warn('Context store read failed:', error);
    }
  }
  for (const item of memory.values()) if (item.uid === uid && item.convoId === convoId) found.set(item.id, item);
  return [...found.values()].sort((a, b) => a.createdAt - b.createdAt);
}

export async function setImageDescription(uid: string, id: string, description: string): Promise<void> {
  const item = await getItem(uid, id);
  if (!item || item.kind !== 'image') return;
  await putItems([{ ...item, description }]);
}

async function deleteWhere(match: (item: StoredItem) => boolean, range?: { index: 'byConvo' | 'byUid'; key: IDBValidKey }): Promise<void> {
  for (const [id, item] of memory) if (match(item)) memory.delete(id);
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const request = range ? store.index(range.index).openCursor(IDBKeyRange.only(range.key)) : store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (match(cursor.value as StoredItem)) cursor.delete();
      cursor.continue();
    };
    await finished(tx);
  } catch (error) {
    console.warn('Context store delete failed:', error);
  }
}

export function deleteConversationItems(uid: string, convoId: string): Promise<void> {
  return deleteWhere((item) => item.uid === uid && item.convoId === convoId, { index: 'byConvo', key: [uid, convoId] });
}

export function deleteUserItems(uid: string): Promise<void> {
  return deleteWhere((item) => item.uid === uid, { index: 'byUid', key: uid });
}

/** Re-home anonymous items to a user after they sign in. */
export async function moveUserItems(fromUid: string, toUid: string): Promise<void> {
  if (fromUid === toUid) return;
  const moved: StoredItem[] = [];
  for (const item of memory.values()) if (item.uid === fromUid) moved.push({ ...item, uid: toUid });
  const db = await openDb();
  if (db) {
    try {
      const rows = (await done(db.transaction(STORE).objectStore(STORE).index('byUid').getAll(IDBKeyRange.only(fromUid)))) as StoredItem[];
      moved.push(...rows.map((row) => ({ ...row, uid: toUid })));
    } catch (error) {
      console.warn('Context store migration failed:', error);
    }
  }
  await putItems(moved);
}

/** Convert a stored image to a `data:` URL for sending to a model. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the image.'));
    reader.readAsDataURL(blob);
  });
}
