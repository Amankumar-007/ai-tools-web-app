/**
 * Turns the raw text pieces pdf.js reports for a page into readable structure: lines, paragraphs, headings, lists
 * and table-like cells. Pure functions (no pdf.js, no DOM) so they are tested against real generated PDFs in Node.
 *
 * pdf.js gives positioned fragments; a PDF has no real notion of "paragraph" or "heading", so this is a careful
 * heuristic: font size relative to the body text decides headings, vertical gaps decide paragraph breaks, and wide
 * horizontal gaps decide table cells. It works well on text PDFs (reports, articles, invoices, simple tables) and is
 * honest about its limits (scans have no text; complex layouts may need cleanup).
 */

export interface TextItem { str: string; x: number; y: number; width: number; fontSize: number }
export interface Cell { x: number; text: string }
export interface Line { y: number; x: number; fontSize: number; text: string; cells: Cell[] }
export interface Block { type: 'heading' | 'paragraph' | 'list' | 'table'; level?: 1 | 2 | 3; text: string; /** Table rows (type "table" only): the first row is usually the header. */ rows?: string[][] }
export interface PageLayout { pageNumber: number; width: number; height: number; lines: Line[]; blocks: Block[]; chars: number }

/** The shape of one pdf.js text item (only what we read). */
export interface PdfJsItem { str?: unknown; transform?: unknown; width?: unknown }

export function itemsFromTextContent(items: PdfJsItem[]): TextItem[] {
  const out: TextItem[] = [];
  for (const it of items) {
    if (typeof it.str !== 'string' || !Array.isArray(it.transform) || it.transform.length < 6) continue;
    const t = it.transform as number[];
    const fontSize = Math.hypot(t[0], t[1]) || Math.abs(t[3]) || 0;
    if (!Number.isFinite(t[4]) || !Number.isFinite(t[5])) continue;
    out.push({ str: it.str, x: t[4], y: t[5], width: typeof it.width === 'number' && Number.isFinite(it.width) ? it.width : it.str.length * fontSize * 0.5, fontSize });
  }
  return out;
}

const normalizeSpaces = (s: string) => s.replace(/[  -   　]/g, ' ').replace(/[ \t]+/g, ' ').trim();

/** Join the pieces of one line, adding a space only where there is a real visual gap. */
function joinPieces(pieces: TextItem[]): string {
  let text = '';
  let prevEnd = Number.NaN;
  for (const p of pieces) {
    if (p.str === '') continue;
    const gap = p.x - prevEnd;
    const needsSpace = Number.isFinite(prevEnd) && gap > p.fontSize * 0.18 && !/\s$/.test(text) && !/^\s/.test(p.str);
    text += (needsSpace ? ' ' : '') + p.str;
    prevEnd = p.x + p.width;
  }
  return normalizeSpaces(text);
}

/** Split a line into cells wherever there is a wide horizontal gap (>= minGap points): the basis for tables. */
function splitCells(pieces: TextItem[], minGap: number): Cell[] {
  const cells: Cell[] = [];
  let group: TextItem[] = [];
  let prevEnd = Number.NaN;
  const flush = () => { if (group.length) { const text = joinPieces(group); if (text) cells.push({ x: group[0].x, text }); group = []; } };
  for (const p of pieces) {
    if (p.str.trim() === '') continue; // blank items can be as wide as the whole gap: measure between real text only
    if (Number.isFinite(prevEnd) && p.x - prevEnd >= Math.max(minGap, p.fontSize * 1.6)) flush();
    group.push(p);
    prevEnd = p.x + p.width;
  }
  flush();
  return cells;
}

export function buildLines(items: TextItem[]): Line[] {
  const real = items.filter((i) => i.str.trim() !== '' || i.width > 0);
  // Top of the page first (larger y first), then left to right.
  const sorted = [...real].sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: TextItem[][] = [];
  for (const item of sorted) {
    const last = groups[groups.length - 1];
    const ref = last?.[0];
    if (last && ref && Math.abs(ref.y - item.y) <= Math.max(2, Math.min(ref.fontSize, item.fontSize || ref.fontSize) * 0.45)) last.push(item);
    else groups.push([item]);
  }
  const lines: Line[] = [];
  for (const g of groups) {
    const pieces = [...g].sort((a, b) => a.x - b.x);
    const text = joinPieces(pieces);
    if (!text) continue;
    // Dominant size = size of the piece carrying the most characters.
    const sizeWeight = new Map<number, number>();
    for (const p of pieces) { const k = Math.round(p.fontSize * 10) / 10; sizeWeight.set(k, (sizeWeight.get(k) ?? 0) + p.str.length); }
    const fontSize = [...sizeWeight].sort((a, b) => b[1] - a[1])[0][0];
    lines.push({ y: pieces[0].y, x: pieces[0].x, fontSize, text, cells: splitCells(pieces, 14) });
  }
  return lines;
}

/** Where table columns start on a page: x positions of cells in rows that have 2+ cells, clustered. */
export function columnStarts(lines: Line[], tolerance = 9): number[] {
  const starts: number[] = [];
  for (const l of lines) if (l.cells.length >= 2) for (const c of l.cells) starts.push(c.x);
  starts.sort((a, b) => a - b);
  const clusters: number[] = [];
  for (const x of starts) {
    const last = clusters[clusters.length - 1];
    if (last === undefined || x - last > tolerance) clusters.push(x); else clusters[clusters.length - 1] = (last + x) / 2;
  }
  return clusters;
}

/** Put each line's cells into consistent columns. A line with fewer than two cells becomes a single cell. */
export function rowsFromLines(lines: Line[], starts: number[], tolerance = 9): string[][] {
  return lines.map((l) => {
    if (l.cells.length < 2 || starts.length === 0) return [l.text];
    const row: string[] = [];
    for (const c of l.cells) {
      let col = 0;
      for (let i = 0; i < starts.length; i++) if (c.x >= starts[i] - tolerance) col = i;
      row[col] = row[col] ? `${row[col]} ${c.text}` : c.text;
    }
    return Array.from(row, (v) => v ?? '');
  });
}

export const LIST_MARKER = /^(?:[•◦▪●·‣⁃*–—-]|\d{1,3}[.)]|[a-zA-Z][.)]|\(\d{1,3}\))\s+/;

/** Median font size weighted by characters = the "body" size of the document. */
export function bodyFontSize(pages: Array<{ lines: Line[] }>): number {
  const weights = new Map<number, number>();
  for (const p of pages) for (const l of p.lines) { const k = Math.round(l.fontSize * 2) / 2; weights.set(k, (weights.get(k) ?? 0) + l.text.length); }
  const sorted = [...weights].sort((a, b) => a[0] - b[0]);
  const total = sorted.reduce((s, [, w]) => s + w, 0);
  let acc = 0;
  for (const [size, w] of sorted) { acc += w; if (acc >= total / 2) return size; }
  return 12;
}

/** Group lines into headings, paragraphs and list items. */
export function buildBlocks(lines: Line[], body: number): Block[] {
  const blocks: Block[] = [];
  let current: { type: 'paragraph' | 'list'; text: string; lastY: number; fontSize: number } | null = null;
  const close = () => { if (current) { blocks.push({ type: current.type, text: current.text.trim() }); current = null; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ratio = body > 0 ? line.fontSize / body : 1;
    // A larger font wins over a leading number: "1. Introduction" in big type is a heading, not a list item.
    const isHeading = ratio >= 1.25 && line.text.length <= 140 && !/[.,;:]$/.test(line.text) && line.cells.length < 3;
    if (isHeading) {
      close();
      const level: 1 | 2 | 3 = ratio >= 1.8 ? 1 : ratio >= 1.4 ? 2 : 3;
      const last = blocks[blocks.length - 1];
      // A heading that wrapped onto two lines is one heading.
      if (last && last.type === 'heading' && last.level === level && i > 0 && Math.abs(lines[i - 1].y - line.y) <= line.fontSize * 1.6) last.text += ` ${line.text}`;
      else blocks.push({ type: 'heading', level, text: line.text });
      continue;
    }
    // Two or more consecutive rows with several cells each form a table.
    if (line.cells.length >= 2) {
      let j = i;
      while (j + 1 < lines.length && lines[j + 1].cells.length >= 2 && lines[j].y - lines[j + 1].y <= Math.max(lines[j].fontSize, lines[j + 1].fontSize) * 2.8 && lines[j].y - lines[j + 1].y > 0) j++;
      if (j > i) {
        close();
        const tableLines = lines.slice(i, j + 1);
        const rows = rowsFromLines(tableLines, columnStarts(tableLines));
        blocks.push({ type: 'table', rows, text: rows.map((r) => r.join('\t')).join('\n') });
        i = j;
        continue;
      }
    }
    const startsList = LIST_MARKER.test(line.text);
    const gap = current ? current.lastY - line.y : Infinity;
    const continues = current && !startsList && gap <= Math.max(line.fontSize, current.fontSize) * 1.65 && gap > 0 && Math.abs(line.fontSize - current.fontSize) <= 1.5;
    if (current && continues) {
      // Re-join words that were hyphenated at the end of the previous line.
      current.text = /[A-Za-z]-$/.test(current.text) && /^[a-z]/.test(line.text) ? current.text.slice(0, -1) + line.text : `${current.text} ${line.text}`;
      current.lastY = line.y;
    } else {
      close();
      current = { type: startsList ? 'list' : 'paragraph', text: line.text, lastY: line.y, fontSize: line.fontSize };
    }
  }
  close();
  return blocks;
}

/** Layout of one page (blocks are built later, once the document's body size is known). */
export function layoutPage(pageNumber: number, width: number, height: number, items: PdfJsItem[]): { pageNumber: number; width: number; height: number; lines: Line[]; chars: number } {
  const lines = buildLines(itemsFromTextContent(items));
  return { pageNumber, width, height, lines, chars: lines.reduce((s, l) => s + l.text.length, 0) };
}

/**
 * Remove running headers/footers and page numbers: a line near the top or bottom edge whose text (digits ignored)
 * repeats on at least half of the pages (three or more pages). Standalone page numbers go too.
 */
export function stripRepeatingLines(pages: Array<{ pageNumber: number; height: number; lines: Line[] }>): void {
  if (pages.length < 3) return;
  const key = (l: Line) => l.text.replace(/\d+/g, '#').toLowerCase();
  const inMargin = (l: Line, h: number) => l.y > h * 0.92 || l.y < h * 0.08;
  const counts = new Map<string, number>();
  for (const p of pages) for (const k of new Set(p.lines.filter((l) => inMargin(l, p.height)).map(key))) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const p of pages) p.lines = p.lines.filter((l) => !(inMargin(l, p.height) && ((counts.get(key(l)) ?? 0) >= Math.ceil(pages.length / 2) || /^(page\s+)?\d{1,4}(\s*(of|\/)\s*\d{1,4})?$/i.test(l.text.trim()))));
}

export function finishLayout(pages: Array<{ pageNumber: number; width: number; height: number; lines: Line[]; chars: number }>, options: { stripHeaders: boolean }): { pages: PageLayout[]; body: number } {
  if (options.stripHeaders) stripRepeatingLines(pages);
  const body = bodyFontSize(pages);
  return {
    body,
    pages: pages.map((p) => ({ ...p, chars: p.lines.reduce((s, l) => s + l.text.length, 0), blocks: buildBlocks(p.lines, body) })),
  };
}

/** True when the document has so little text that it is almost certainly a scan or an image-only PDF. */
export function looksScanned(pages: Array<{ chars: number }>): boolean {
  if (pages.length === 0) return false;
  return pages.reduce((s, p) => s + p.chars, 0) / pages.length < 25;
}
