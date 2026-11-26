/**
 * Turns a file the user picked into something the context store can hold
 * (browser only): text for documents, a downscaled JPEG for images, and page
 * images for scanned PDFs that have no text layer.
 */

export type ImageData = { blob: Blob; width: number; height: number };

export type ProcessedFile =
  | { kind: 'image'; name: string; mime: string; size: number; image: ImageData }
  | {
      kind: 'document';
      name: string;
      mime: string;
      size: number;
      text: string;
      pages?: number;
      truncated: boolean;
      /** No text layer: `pageImages` holds the first pages for a vision model to read. */
      scanned: boolean;
      pageImages: ImageData[];
    };

export type FileKind = 'image' | 'pdf' | 'docx' | 'text';

/** What each menu entry opens. */
export const ACCEPT = {
  image: 'image/*',
  pdf: 'application/pdf,.pdf',
  document: '.docx,.txt,.md,.markdown',
  data: '.csv,.tsv,.json,.xml,.yaml,.yml,.html,.css,.scss,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.sql,.sh,.log,.ini,.toml,.svg',
} as const;

const TEXT_EXTENSIONS = new Set(
  'txt md markdown csv tsv json xml yaml yml html htm css scss js jsx ts tsx py java c cpp h cs go rs rb php sql sh log ini toml svg env cfg conf'.split(' ')
);

export const MAX_FILES_PER_MESSAGE = 5;
const MAX_BYTES: Record<FileKind, number> = {
  image: 25 * 1024 * 1024,
  pdf: 30 * 1024 * 1024,
  docx: 15 * 1024 * 1024,
  text: 5 * 1024 * 1024,
};
/** Characters of text kept per document. */
export const MAX_DOC_CHARS = 500_000;
const MAX_PDF_PAGES = 400;
const MAX_SCANNED_PAGES = 4;
/** Below this many non-space characters per page we treat a PDF as scanned. */
const MIN_CHARS_PER_PAGE = 40;

const IMAGE_MAX_SIDE = 1280;
const PAGE_MAX_SIDE = 1100;

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}

export function classifyFile(file: File): FileKind | null {
  const ext = extensionOf(file.name);
  if (file.type === 'image/svg+xml' || ext === 'svg') return 'text';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (file.type.startsWith('text/') || TEXT_EXTENSIONS.has(ext) || file.type === 'application/json') return 'text';
  return null;
}

function unsupportedMessage(file: File): string {
  const ext = extensionOf(file.name);
  if (ext === 'doc') return `${file.name}: old .doc files aren't supported. Save it as .docx or PDF and try again.`;
  if (['xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return `${file.name}: Excel and PowerPoint files aren't supported yet. Export as PDF or CSV.`;
  return `${file.name}: this file type isn't supported. Try an image, PDF, Word document, or a text, CSV or code file.`;
}

function mb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), 'image/jpeg', quality);
  });
}

function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function processImage(file: File): Promise<ImageData> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`${file.name}: your browser can't open this image format. Try PNG, JPEG or WebP.`);
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, IMAGE_MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process the image.');
    // JPEG has no transparency: paint white first so transparent PNGs don't turn black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    return { blob: await canvasToBlob(canvas, 0.82), width, height };
  } finally {
    bitmap.close();
  }
}

function cleanText(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

function capText(text: string): { text: string; truncated: boolean } {
  return text.length > MAX_DOC_CHARS ? { text: text.slice(0, MAX_DOC_CHARS), truncated: true } : { text, truncated: false };
}

async function processText(file: File): Promise<{ text: string; truncated: boolean }> {
  const buffer = await file.arrayBuffer();
  const head = new Uint8Array(buffer.slice(0, 8192));
  if (head.includes(0)) throw new Error(`${file.name}: this looks like a binary file, not text.`);
  const text = cleanText(new TextDecoder('utf-8').decode(buffer));
  if (!text) throw new Error(`${file.name}: the file is empty.`);
  return capText(text);
}

async function processDocx(file: File): Promise<{ text: string; truncated: boolean }> {
  const mammoth = await import('mammoth');
  const extractRawText = (mammoth as any).extractRawText ?? (mammoth as any).default?.extractRawText;
  if (typeof extractRawText !== 'function') throw new Error('Word documents could not be loaded. Please try again.');
  let value: string;
  try {
    ({ value } = await extractRawText({ arrayBuffer: await file.arrayBuffer() }));
  } catch {
    throw new Error(`${file.name}: could not read this Word document. Is it a valid .docx file?`);
  }
  const text = cleanText(value);
  if (!text) throw new Error(`${file.name}: no readable text was found in this document.`);
  return capText(text);
}

async function renderPdfPage(page: any, maxSide: number): Promise<ImageData> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, maxSide / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not render the PDF page.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return { blob: await canvasToBlob(canvas, 0.72), width: canvas.width, height: canvas.height };
}

async function processPdf(file: File): Promise<{ text: string; pages: number; truncated: boolean; scanned: boolean; pageImages: ImageData[] }> {
  const { initializePDFjs } = await import('@/services/pdfService');
  const pdfjs = await initializePDFjs();

  let pdf: any;
  try {
    pdf = await pdfjs.getDocument({ data: await file.arrayBuffer(), disableFontFace: true }).promise;
  } catch (error: any) {
    if (error?.name === 'PasswordException') throw new Error(`${file.name}: this PDF is password-protected.`);
    throw new Error(`${file.name}: could not open this PDF. It may be damaged.`);
  }

  try {
    const pageCount: number = pdf.numPages;
    const readable = Math.min(pageCount, MAX_PDF_PAGES);
    const parts: string[] = [];
    let visibleChars = 0;
    for (let number = 1; number <= readable; number += 1) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      let text = '';
      for (const item of content.items as any[]) {
        if (typeof item.str !== 'string') continue;
        text += item.str + (item.hasEOL ? '\n' : ' ');
      }
      text = text.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
      visibleChars += text.replace(/\s/g, '').length;
      parts.push(`--- Page ${number} ---\n${text}`);
      page.cleanup();
    }

    const scanned = visibleChars / readable < MIN_CHARS_PER_PAGE;
    if (scanned) {
      const pageImages: ImageData[] = [];
      for (let number = 1; number <= Math.min(readable, MAX_SCANNED_PAGES); number += 1) {
        pageImages.push(await renderPdfPage(await pdf.getPage(number), PAGE_MAX_SIDE));
      }
      return { text: '', pages: pageCount, truncated: pageCount > MAX_SCANNED_PAGES, scanned: true, pageImages };
    }

    const capped = capText(cleanText(parts.join('\n\n')));
    return { text: capped.text, pages: pageCount, truncated: capped.truncated || pageCount > readable, scanned: false, pageImages: [] };
  } finally {
    void pdf.destroy?.();
  }
}

/** Validate and read one file. Throws an Error whose message is safe to show the user. */
export async function processFile(file: File): Promise<ProcessedFile> {
  const kind = classifyFile(file);
  if (!kind) throw new Error(unsupportedMessage(file));
  if (file.size === 0) throw new Error(`${file.name}: the file is empty.`);
  if (file.size > MAX_BYTES[kind]) throw new Error(`${file.name}: files of this type must be under ${mb(MAX_BYTES[kind])}.`);

  const base = { name: file.name || 'file', mime: file.type || 'application/octet-stream', size: file.size };
  if (kind === 'image') return { kind: 'image', ...base, image: await processImage(file) };
  if (kind === 'pdf') {
    const pdf = await processPdf(file);
    return { kind: 'document', ...base, ...pdf };
  }
  const result = kind === 'docx' ? await processDocx(file) : await processText(file);
  return { kind: 'document', ...base, ...result, scanned: false, pageImages: [] };
}
