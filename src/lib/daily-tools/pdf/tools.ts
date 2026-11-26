import { PDFDocument, degrees } from 'pdf-lib';

/** PDF editing with pdf-lib: merge, split, extract/reorder, rotate, delete, images to PDF. Pure over bytes, so Node can test it. */

export type RangeResult = { ok: true; pages: number[] } | { ok: false; error: string };

/**
 * "1-3, 5, 8-" -> [1,2,3,5,8,9,...]. Order is kept (so "3,1,2" reorders). Also: "odd", "even", "last", "all".
 * Pages are 1-based. Returns a clear error for anything out of range or unreadable.
 */
export function parsePageRanges(spec: string, pageCount: number, opts: { allowRepeat?: boolean } = {}): RangeResult {
  const text = spec.trim().toLowerCase();
  if (!text) return { ok: false, error: 'Enter the pages you want, for example 1-3, 5, 8-.' };
  if (text.length > 200) return { ok: false, error: 'That page list is too long.' };
  const pages: number[] = [];
  for (const raw of text.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    if (part === 'all') { for (let i = 1; i <= pageCount; i++) pages.push(i); continue; }
    if (part === 'odd') { for (let i = 1; i <= pageCount; i += 2) pages.push(i); continue; }
    if (part === 'even') { for (let i = 2; i <= pageCount; i += 2) pages.push(i); continue; }
    if (part === 'last') { pages.push(pageCount); continue; }
    const m = /^(\d+)?\s*-\s*(\d+)?$/.exec(part);
    if (m && (m[1] || m[2])) {
      const from = m[1] ? Number(m[1]) : 1;
      const to = m[2] ? Number(m[2]) : pageCount;
      if (from < 1 || to > pageCount) return { ok: false, error: `Pages must be between 1 and ${pageCount}. "${part}" is out of range.` };
      if (from > to) return { ok: false, error: `"${part}" counts backwards. Write it as ${to}-${from}.` };
      for (let i = from; i <= to; i++) pages.push(i);
      continue;
    }
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > pageCount) return { ok: false, error: `Page ${n} does not exist: this PDF has ${pageCount} page${pageCount === 1 ? '' : 's'}.` };
      pages.push(n);
      continue;
    }
    return { ok: false, error: `Could not read "${part}". Use numbers and ranges like 1-3, 5, 8-.` };
  }
  if (pages.length === 0) return { ok: false, error: 'No pages selected.' };
  const unique = opts.allowRepeat ? pages : [...new Set(pages)];
  return { ok: true, pages: unique };
}

export const LIMITS = { maxFiles: 30, maxPages: 2000 } as const;

async function load(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { ignoreEncryption: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (/encrypt/i.test(msg)) throw new Error('This PDF is password-protected. Remove the password first, then try again.');
    throw new Error('This file could not be read as a PDF. It may be damaged.');
  }
}

export async function pageCountOf(bytes: Uint8Array): Promise<number> {
  return (await load(bytes)).getPageCount();
}

export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error('Add at least two PDFs to merge.');
  if (files.length > LIMITS.maxFiles) throw new Error(`You can merge up to ${LIMITS.maxFiles} files at a time.`);
  const out = await PDFDocument.create();
  let total = 0;
  for (const bytes of files) {
    const doc = await load(bytes);
    total += doc.getPageCount();
    if (total > LIMITS.maxPages) throw new Error(`That is more than ${LIMITS.maxPages} pages in total.`);
    const copied = await out.copyPages(doc, doc.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  return out.save();
}

/** New PDF with the given 1-based pages, in the given order. */
export async function extractPages(bytes: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const doc = await load(bytes);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(doc, pages.map((p) => p - 1));
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

/** Split into several PDFs: one per range group (e.g. "1-3, 4-6") or one per page / every N pages. */
export async function splitEvery(bytes: Uint8Array, size: number): Promise<Uint8Array[]> {
  const doc = await load(bytes);
  const count = doc.getPageCount();
  if (!Number.isInteger(size) || size < 1) throw new Error('Pages per file must be at least 1.');
  const parts: Uint8Array[] = [];
  for (let start = 0; start < count; start += size) {
    const pages = Array.from({ length: Math.min(size, count - start) }, (_, i) => start + i + 1);
    parts.push(await extractPages(bytes, pages));
  }
  return parts;
}

export async function deletePages(bytes: Uint8Array, remove: number[]): Promise<Uint8Array> {
  const doc = await load(bytes);
  const drop = new Set(remove);
  const keep = doc.getPageIndices().filter((i) => !drop.has(i + 1)).map((i) => i + 1);
  if (keep.length === 0) throw new Error('That would delete every page.');
  return extractPages(bytes, keep);
}

/** Rotate the given pages (or all when `pages` is null) by a multiple of 90 degrees, clockwise. */
export async function rotatePages(bytes: Uint8Array, pages: number[] | null, angle: 90 | 180 | 270): Promise<Uint8Array> {
  const doc = await load(bytes);
  const target = new Set(pages ?? doc.getPageIndices().map((i) => i + 1));
  doc.getPages().forEach((page, i) => { if (target.has(i + 1)) page.setRotation(degrees((page.getRotation().angle + angle) % 360)); });
  return doc.save();
}

export interface ImageInput { bytes: Uint8Array; type: 'png' | 'jpg' }
export interface ImagesToPdfOptions { pageSize: 'a4' | 'letter' | 'fit'; margin: number; orientation: 'auto' | 'portrait' | 'landscape' }

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] } as const;

/** One image per page, scaled to fit inside the margins (never stretched). `fit` makes the page the size of the image. */
export async function imagesToPdf(images: ImageInput[], options: ImagesToPdfOptions): Promise<Uint8Array> {
  if (images.length === 0) throw new Error('Add at least one image.');
  const out = await PDFDocument.create();
  for (const img of images) {
    const embedded = img.type === 'png' ? await out.embedPng(img.bytes) : await out.embedJpg(img.bytes);
    const { width: iw, height: ih } = embedded;
    let pw: number; let ph: number;
    if (options.pageSize === 'fit') { pw = iw; ph = ih; }
    else {
      [pw, ph] = SIZES[options.pageSize];
      const landscape = options.orientation === 'landscape' || (options.orientation === 'auto' && iw > ih);
      if (landscape) [pw, ph] = [ph, pw];
    }
    const margin = options.pageSize === 'fit' ? 0 : Math.max(0, Math.min(options.margin, Math.min(pw, ph) / 3));
    const scale = Math.min((pw - 2 * margin) / iw, (ph - 2 * margin) / ih);
    const w = iw * scale; const h = ih * scale;
    const page = out.addPage([pw, ph]);
    page.drawImage(embedded, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  }
  return out.save();
}
