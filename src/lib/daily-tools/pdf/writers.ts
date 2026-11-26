import JSZip from 'jszip';
import { columnStarts, rowsFromLines, type Block, type Cell, type Line, type PageLayout } from './layout';

/**
 * Writers that turn a laid-out PDF into other formats. Everything here is pure (no DOM), so the output is checked
 * in Node: Word files are read back with mammoth, spreadsheets with SheetJS.
 */

// ── shared helpers ───────────────────────────────────────────────────

/** XML 1.0 forbids most control characters and lone surrogates; PDFs contain them sometimes. */
export function xmlSafe(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
    .replace(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g, '');
}
export const escapeXml = (text: string) => xmlSafe(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LIST_STRIP = /^(?:[•◦▪●·‣⁃*–—-]|\d{1,3}[.)]|[a-zA-Z][.)]|\(\d{1,3}\))\s+/;

// ── plain text ───────────────────────────────────────────────────────

export function toText(pages: PageLayout[], opts: { pageMarkers: boolean }): string {
  return pages
    .map((p) => {
      const body = p.blocks.map((b) => (b.type === 'table' ? (b.rows ?? []).map((r) => r.join('\t')).join('\n') : b.text)).join('\n\n');
      return opts.pageMarkers ? `--- Page ${p.pageNumber} ---\n\n${body}` : body;
    })
    .filter((s) => s.trim() !== '')
    .join('\n\n')
    .trim() + '\n';
}

// ── Markdown ─────────────────────────────────────────────────────────

const mdEscape = (t: string) => t.replace(/\\/g, '\\\\').replace(/([*_`])/g, '\\$1').replace(/^([#>])/g, '\\$1');

export function toMarkdown(pages: PageLayout[], opts: { pageMarkers: boolean }): string {
  const out: string[] = [];
  for (const p of pages) {
    if (opts.pageMarkers && p.blocks.length) out.push(`<!-- Page ${p.pageNumber} -->`);
    let inList = false;
    for (const b of p.blocks) {
      if (b.type === 'list') {
        out.push(`${inList ? '' : ''}- ${mdEscape(b.text.replace(LIST_STRIP, ''))}`);
        inList = true;
        continue;
      }
      if (inList) { out.push(''); inList = false; }
      if (b.type === 'table' && b.rows?.length) {
        const width = Math.max(...b.rows.map((r) => r.length));
        const cell = (v: string | undefined) => mdEscape(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const row = (r: string[]) => `| ${Array.from({ length: width }, (_, k) => cell(r[k])).join(' | ')} |`;
        out.push(row(b.rows[0]), `| ${Array(width).fill('---').join(' | ')} |`, ...b.rows.slice(1).map(row), '');
        continue;
      }
      out.push(b.type === 'heading' ? `${'#'.repeat(b.level ?? 2)} ${mdEscape(b.text)}\n` : `${mdEscape(b.text)}\n`);
    }
    if (inList) out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ── HTML ─────────────────────────────────────────────────────────────

export function toHtml(pages: PageLayout[], title: string): string {
  const parts: string[] = [];
  for (const p of pages) {
    let listOpen = false;
    for (const b of p.blocks) {
      if (b.type === 'list') { if (!listOpen) { parts.push('<ul>'); listOpen = true; } parts.push(`  <li>${escapeHtml(b.text.replace(LIST_STRIP, ''))}</li>`); continue; }
      if (listOpen) { parts.push('</ul>'); listOpen = false; }
      if (b.type === 'table' && b.rows?.length) {
        const width = Math.max(...b.rows.map((r) => r.length));
        const tr = (r: string[], tag: string) => `<tr>${Array.from({ length: width }, (_, k) => `<${tag}>${escapeHtml(r[k] ?? '')}</${tag}>`).join('')}</tr>`;
        parts.push('<table>', `<thead>${tr(b.rows[0], 'th')}</thead>`, `<tbody>${b.rows.slice(1).map((r) => tr(r, 'td')).join('')}</tbody>`, '</table>');
        continue;
      }
      parts.push(b.type === 'heading' ? `<h${b.level ?? 2}>${escapeHtml(b.text)}</h${b.level ?? 2}>` : `<p>${escapeHtml(b.text)}</p>`);
    }
    if (listOpen) parts.push('</ul>');
  }
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${escapeHtml(title)}</title>\n<style>body{font-family:system-ui,sans-serif;line-height:1.6;max-width:760px;margin:2rem auto;padding:0 1rem;color:#1f2937}h1,h2,h3{line-height:1.25}table{border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #d1d5db;padding:.4rem .7rem;text-align:left}th{background:#f3f4f6}</style>\n</head>\n<body>\n${parts.join('\n')}\n</body>\n</html>\n`;
}

// ── Word (.docx) ─────────────────────────────────────────────────────

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function docxTable(rows: string[][]): string {
  const width = Math.max(...rows.map((r) => r.length));
  const col = Math.floor(9000 / width);
  const border = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((k) => `<w:${k} w:val="single" w:sz="4" w:space="0" w:color="999999"/>`).join('');
  const tr = (r: string[], header: boolean) => `<w:tr>${Array.from({ length: width }, (_, k) => `<w:tc><w:tcPr><w:tcW w:w="${col}" w:type="dxa"/>${header ? '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>' : ''}</w:tcPr><w:p><w:r>${header ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${escapeXml(r[k] ?? '')}</w:t></w:r></w:p></w:tc>`).join('')}</w:tr>`;
  // A paragraph must follow a table, so Word has somewhere to put the cursor.
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${border}</w:tblBorders></w:tblPr><w:tblGrid>${Array.from({ length: width }, () => `<w:gridCol w:w="${col}"/>`).join('')}</w:tblGrid>${rows.map((r, i) => tr(r, i === 0)).join('')}</w:tbl><w:p/>`;
}

function docxParagraph(b: Block): string {
  if (b.type === 'table' && b.rows?.length) return docxTable(b.rows);
  const text = escapeXml(b.type === 'list' ? b.text.replace(LIST_STRIP, '') : b.text);
  const run = `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>`;
  if (b.type === 'heading') return `<w:p><w:pPr><w:pStyle w:val="Heading${b.level ?? 2}"/></w:pPr>${run}</w:p>`;
  if (b.type === 'list') return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${run}</w:p>`;
  return `<w:p>${run}</w:p>`;
}

export async function toDocx(pages: PageLayout[], opts: { title: string; pageBreaks: boolean }): Promise<Uint8Array> {
  const body: string[] = [];
  const nonEmpty = pages.filter((p) => p.blocks.length > 0);
  nonEmpty.forEach((p, i) => {
    for (const b of p.blocks) body.push(docxParagraph(b));
    if (opts.pageBreaks && i < nonEmpty.length - 1) body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  });
  if (body.length === 0) body.push('<w:p/>');

  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`);
  zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(opts.title)}</dc:title><dc:creator>TomatoAI PDF Converter</dc:creator></cp:coreProperties>`);
  zip.file('word/numbering.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="${W_NS}"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`);
  const heading = (n: number, size: number) => `<w:style w:type="paragraph" w:styleId="Heading${n}"><w:name w:val="heading ${n}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/><w:outlineLvl w:val="${n - 1}"/></w:pPr><w:rPr><w:b/><w:sz w:val="${size}"/></w:rPr></w:style>`;
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W_NS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>${heading(1, 40)}${heading(2, 32)}${heading(3, 26)}<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/><w:ind w:left="720"/></w:pPr></w:style></w:styles>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W_NS}"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

// ── Excel (.xlsx) ────────────────────────────────────────────────────

/** Column letters: 0 -> A, 25 -> Z, 26 -> AA. */
export function columnName(index: number): string {
  let n = index + 1; let name = '';
  while (n > 0) { const r = (n - 1) % 26; name = String.fromCharCode(65 + r) + name; n = Math.floor((n - 1) / 26); }
  return name;
}

const NUMBER = /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;

/** "1,234.50" -> 1234.5 ; "007" stays text (leading zeros matter for IDs); "12%" stays text. */
export function parseCellNumber(text: string): number | null {
  const t = text.replace(/^(?:₹|Rs\.?|INR|\$|€|£)\s*/i, '').trim();
  if (!NUMBER.test(t)) return null;
  if (/^-?0\d/.test(t.replace(/,/g, '')) && !/^-?0\.\d/.test(t)) return null;
  const n = Number(t.replace(/,/g, ''));
  return Number.isFinite(n) && Math.abs(n) < 1e15 ? n : null;
}

export function rowsForPage(lines: Line[]): string[][] {
  return rowsFromLines(lines, columnStarts(lines));
}

function sheetXml(rows: string[][]): string {
  const out: string[] = [];
  rows.forEach((row, r) => {
    const cells: string[] = [];
    row.forEach((value, c) => {
      if (!value) return;
      const ref = `${columnName(c)}${r + 1}`;
      const n = parseCellNumber(value);
      cells.push(n !== null ? `<c r="${ref}"><v>${n}</v></c>` : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`);
    });
    if (cells.length) out.push(`<row r="${r + 1}">${cells.join('')}</row>`);
  });
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${out.join('')}</sheetData></worksheet>`;
}

export const MAX_SHEETS = 60;

/** One worksheet per page (up to 60), or everything in a single sheet. Best for simple tables: see the page notes. */
export async function toXlsx(pages: PageLayout[], opts: { singleSheet: boolean }): Promise<Uint8Array> {
  const withText = pages.filter((p) => p.lines.length > 0);
  const sheets: Array<{ name: string; rows: string[][] }> = opts.singleSheet
    ? [{ name: 'All pages', rows: withText.flatMap((p, i) => [...(i > 0 ? [[`--- Page ${p.pageNumber} ---`]] : []), ...rowsForPage(p.lines)]) }]
    : withText.slice(0, MAX_SHEETS).map((p) => ({ name: `Page ${p.pageNumber}`, rows: rowsForPage(p.lines) }));
  if (sheets.length === 0) sheets.push({ name: 'Sheet1', rows: [[]] });

  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${escapeXml(s.name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`);
  sheets.forEach((s, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows)));
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

/** CSV for one page's table-like rows (RFC 4180 quoting; formula-leading cells are neutralised for spreadsheet safety). */
export function toCsv(rows: string[][]): string {
  const cell = (v: string) => { const safe = /^[=+\-@\t\r]/.test(v) && parseCellNumber(v) === null ? `'${v}` : v; return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe; };
  return rows.map((r) => r.map((v) => cell(v ?? '')).join(',')).join('\r\n') + '\r\n';
}

export type { Block, Cell };
