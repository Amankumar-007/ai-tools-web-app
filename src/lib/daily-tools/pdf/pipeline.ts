/**
 * Browser-only PDF reading and rendering (pdf.js). Everything runs on the visitor's device: the file is never uploaded.
 * The pure layout/writer logic lives in layout.ts and writers.ts (tested in Node); this file is the thin glue to pdf.js.
 */

import { finishLayout, layoutPage, looksScanned, type PageLayout } from './layout';

/* eslint-disable @typescript-eslint/no-explicit-any */
let lib: any = null;

async function pdfjs(): Promise<any> {
  if (lib) return lib;
  const mod: any = await import('pdfjs-dist/legacy/build/pdf');
  lib = mod?.default ?? mod;
  if (typeof window !== 'undefined') lib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
  return lib;
}

export interface OpenedPdf { doc: any; pageCount: number; size: number; name: string }

export const PDF_LIMITS = { maxBytes: 100 * 1024 * 1024, maxPages: 1500, maxImagePages: 120 } as const;

export class PdfError extends Error {
  constructor(readonly code: 'password' | 'invalid' | 'too_many_pages' | 'failed', message: string) { super(message); this.name = 'PdfError'; }
}

export async function openPdf(file: File): Promise<OpenedPdf> {
  const pdf = await pdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  // A real PDF starts with %PDF within its first kilobyte. Check before handing a random file to the parser.
  const head = new TextDecoder('latin1').decode(data.subarray(0, 1024));
  if (!head.includes('%PDF-')) throw new PdfError('invalid', `"${file.name}" is not a PDF file.`);
  try {
    const doc = await pdf.getDocument({ data, isEvalSupported: false, verbosity: 0 }).promise;
    if (doc.numPages > PDF_LIMITS.maxPages) { await doc.destroy?.(); throw new PdfError('too_many_pages', `This PDF has ${doc.numPages} pages. The limit is ${PDF_LIMITS.maxPages}.`); }
    return { doc, pageCount: doc.numPages, size: file.size, name: file.name };
  } catch (e) {
    if (e instanceof PdfError) throw e;
    const name = (e as { name?: string })?.name;
    if (name === 'PasswordException') throw new PdfError('password', 'This PDF is password-protected. Remove the password first (open it, then print or save it as a new PDF), and try again.');
    if (name === 'InvalidPDFException' || name === 'MissingPDFException' || name === 'FormatError') throw new PdfError('invalid', 'This file could not be read as a PDF. It may be damaged.');
    throw new PdfError('failed', 'Could not open this PDF. Please try another file.');
  }
}

export async function extractLayout(opened: OpenedPdf, pages: number[], opts: { stripHeaders: boolean }, onProgress?: (done: number, total: number) => void): Promise<{ pages: PageLayout[]; scanned: boolean }> {
  const raw: ReturnType<typeof layoutPage>[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = await opened.doc.getPage(pages[i]);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    raw.push(layoutPage(pages[i], viewport.width, viewport.height, content.items));
    page.cleanup?.();
    onProgress?.(i + 1, pages.length);
    if (i % 4 === 3) await new Promise((r) => setTimeout(r, 0)); // let the page breathe on big files
  }
  const { pages: laid } = finishLayout(raw, opts);
  return { pages: laid, scanned: looksScanned(laid) };
}

export interface RenderOptions { scale: number; type: 'image/png' | 'image/jpeg'; quality: number }

/** Renders one page to an image. Scale 1 = 72 dpi; the scale is lowered automatically if the page would be enormous. */
export async function renderPage(opened: OpenedPdf, pageNumber: number, o: RenderOptions): Promise<{ blob: Blob; width: number; height: number }> {
  const page = await opened.doc.getPage(pageNumber);
  let scale = o.scale;
  const base = page.getViewport({ scale: 1 });
  const maxPixels = 36_000_000;
  if (base.width * base.height * scale * scale > maxPixels) scale = Math.sqrt(maxPixels / (base.width * base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width)); canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PdfError('failed', 'Your browser could not create an image surface.');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); // PDFs are transparent; JPEG would turn that black
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new PdfError('failed', 'Could not create the image.'))), o.type, o.quality));
  page.cleanup?.();
  const out = { blob, width: canvas.width, height: canvas.height };
  canvas.width = 0; canvas.height = 0; // free the pixels immediately
  return out;
}

export async function closePdf(opened: OpenedPdf | null): Promise<void> {
  try { await opened?.doc?.destroy?.(); } catch { /* already gone */ }
}
