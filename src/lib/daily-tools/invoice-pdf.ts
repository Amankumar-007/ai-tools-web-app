import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { rupeesInWords } from './calc/format';
import { calculateInvoice, type InvoiceItem, type InvoiceTotals, type Supply } from './invoice';

/** Builds the invoice PDF in the browser (nothing is uploaded). Uses the built-in Helvetica font. */

export interface Party { name: string; address: string; gstin: string; state: string; phone: string; email: string }
export interface InvoiceData {
  title: string; number: string; date: string; dueDate: string; placeOfSupply: string;
  seller: Party; buyer: Party; items: InvoiceItem[]; supply: Supply; roundOff: boolean;
  notes: string; bank: string; upiId: string; currencyLabel: string;
}

/**
 * The built-in PDF font only covers Western characters. Map the common look-alikes (rupee sign, curly quotes, dashes,
 * bullets) and replace everything else with "?", reporting that it happened so the UI can warn instead of failing.
 */
export function pdfSafe(text: string): { text: string; replaced: boolean } {
  let replaced = false;
  const out = text
    .replace(/₹/g, 'Rs.').replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"').replace(/[–—−]/g, '-').replace(/[•·●]/g, '-').replace(/…/g, '...').replace(/[   ]/g, ' ')
    .replace(/[\r\t]/g, ' ')
    .replace(/[^\n\x20-\x7e¡-ÿ]/g, () => { replaced = true; return '?'; });
  return { text: out, replaced };
}

const money = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let cur = '';
    for (const word of para.split(' ')) {
      const test = cur ? `${cur} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width) { cur = test; continue; }
      if (cur) lines.push(cur);
      // A single very long word: break it by characters.
      let w = word;
      while (font.widthOfTextAtSize(w, size) > width && w.length > 1) { let k = w.length - 1; while (k > 1 && font.widthOfTextAtSize(w.slice(0, k), size) > width) k--; lines.push(w.slice(0, k)); w = w.slice(k); }
      cur = w;
    }
    lines.push(cur);
  }
  return lines;
}

export async function buildInvoicePdf(data: InvoiceData, qrPng?: Uint8Array): Promise<{ bytes: Uint8Array; totals: InvoiceTotals; replaced: boolean }> {
  const totals = calculateInvoice(data.items, data.supply, data.roundOff);
  let replaced = false;
  const S = (t: string) => { const r = pdfSafe(t); replaced ||= r.replaced; return r.text; };

  const doc = await PDFDocument.create();
  doc.setTitle(S(`${data.title} ${data.number}`)); doc.setCreator('TomatoAI Invoice Generator'); doc.setProducer('TomatoAI');
  const reg = await doc.embedFont(StandardFonts.Helvetica); const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 30, usable = W - 2 * M;
  const ink = rgb(0.1, 0.1, 0.12), muted = rgb(0.4, 0.4, 0.45), line = rgb(0.8, 0.8, 0.84), accent = rgb(0.93, 0.4, 0.1), tint = rgb(0.96, 0.96, 0.97);

  let page: PDFPage = doc.addPage([W, H]);
  let y = H - M;
  const text = (t: string, x: number, yy: number, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; align?: 'left' | 'right' | 'center'; width?: number } = {}) => {
    const size = o.size ?? 9; const font = o.font ?? reg; const s = S(t);
    const w = font.widthOfTextAtSize(s, size);
    const px = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    page.drawText(s, { x: px, y: yy, size, font, color: o.color ?? ink });
  };
  const para = (t: string, x: number, width: number, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}): number => {
    const size = o.size ?? 9; const font = o.font ?? reg; const lines = wrap(S(t), font, size, width);
    for (const l of lines) { page.drawText(l, { x, y, size, font, color: o.color ?? ink }); y -= size + (o.gap ?? 3); }
    return lines.length;
  };

  // ── header
  text(data.title.toUpperCase(), W - M, y - 14, { size: 20, font: bold, color: accent, align: 'right' });
  const top = y;
  text(data.seller.name || 'Your business', M, y - 12, { size: 14, font: bold });
  y -= 28;
  if (data.seller.address) para(data.seller.address, M, 250, { color: muted });
  if (data.seller.gstin) { text(`GSTIN: ${data.seller.gstin.toUpperCase()}`, M, y - 9, { size: 9, font: bold }); y -= 14; }
  const contact = [data.seller.phone, data.seller.email].filter(Boolean).join('  |  ');
  if (contact) { text(contact, M, y - 9, { color: muted }); y -= 14; }
  // meta block (right)
  let my = top - 36; const mx = W - M;
  for (const [k, v] of [['Invoice no.', data.number], ['Date', data.date], ...(data.dueDate ? [['Due date', data.dueDate]] : []), ...(data.placeOfSupply ? [['Place of supply', data.placeOfSupply]] : [])] as Array<[string, string]>) {
    text(k, mx - 160, my, { color: muted }); text(v, mx, my, { font: bold, align: 'right' }); my -= 14;
  }
  y = Math.min(y, my) - 12;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: line });
  y -= 16;

  // ── bill to
  text('BILL TO', M, y, { size: 8, font: bold, color: muted }); y -= 14;
  text(data.buyer.name || 'Customer', M, y, { size: 11, font: bold }); y -= 14;
  if (data.buyer.address) para(data.buyer.address, M, 300, { color: muted });
  if (data.buyer.gstin) { text(`GSTIN: ${data.buyer.gstin.toUpperCase()}`, M, y, { font: bold }); y -= 13; }
  const bc = [data.buyer.phone, data.buyer.email].filter(Boolean).join('  |  '); if (bc) { text(bc, M, y, { color: muted }); y -= 13; }
  y -= 10;

  // ── items table
  const showGst = data.supply !== 'none';
  const cols = showGst
    ? [['#', 20, 'left'], ['Description', 165, 'left'], ['HSN/SAC', 50, 'left'], ['Qty', 36, 'right'], ['Rate', 56, 'right'], ['GST %', 34, 'right'], ['Taxable', 66, 'right'], ['GST', 52, 'right'], ['Total', 56, 'right']] as const
    : [['#', 22, 'left'], ['Description', 245, 'left'], ['HSN/SAC', 56, 'left'], ['Qty', 44, 'right'], ['Rate', 80, 'right'], ['Total', 88, 'right']] as const;
  const colX: number[] = []; let acc = M; for (const c of cols) { colX.push(acc); acc += c[1]; }
  const drawHeader = () => {
    page.drawRectangle({ x: M, y: y - 16, width: usable, height: 18, color: tint });
    cols.forEach((c, i) => text(c[0], c[2] === 'right' ? colX[i] + c[1] - 4 : colX[i] + 4, y - 11, { size: 8, font: bold, color: muted, align: c[2] === 'right' ? 'right' : 'left' }));
    y -= 22;
  };
  drawHeader();
  data.items.forEach((it, idx) => {
    const t = totals.lines[idx];
    const descLines = wrap(S(it.description), reg, 8.5, cols[1][1] - 8);
    const rowH = Math.max(14, descLines.length * 11 + 4);
    if (y - rowH < 160) { page = doc.addPage([W, H]); y = H - M; drawHeader(); }
    const cells = showGst
      ? [String(idx + 1), '', it.hsn || '-', String(it.qty), money(it.rate), String(it.gstRate), money(t.taxable), money(t.gst), money(t.total)]
      : [String(idx + 1), '', it.hsn || '-', String(it.qty), money(it.rate), money(t.total)];
    cols.forEach((c, i) => { if (i === 1) return; text(cells[i], c[2] === 'right' ? colX[i] + c[1] - 4 : colX[i] + 4, y - 9, { size: 8.5, align: c[2] === 'right' ? 'right' : 'left' }); });
    descLines.forEach((l, k) => page.drawText(l, { x: colX[1] + 4, y: y - 9 - k * 11, size: 8.5, font: reg, color: ink }));
    if (it.discountPct > 0) text(`${it.discountPct}% discount applied`, colX[1] + 4, y - 9 - descLines.length * 11, { size: 7, color: muted });
    y -= rowH + (it.discountPct > 0 ? 9 : 0);
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: W - M, y: y + 2 }, thickness: 0.4, color: line });
  });
  y -= 14;

  // ── totals (right) and tax summary (left)
  if (y < 230) { page = doc.addPage([W, H]); y = H - M; }
  const boxX = W - M - 230; let ty = y;
  const row = (label: string, value: string, strong = false) => { text(label, boxX, ty, { font: strong ? bold : reg, size: strong ? 11 : 9, color: strong ? ink : muted }); text(value, W - M, ty, { font: strong ? bold : reg, size: strong ? 11 : 9, align: 'right' }); ty -= strong ? 18 : 14; };
  row('Subtotal', money(totals.subtotal));
  if (totals.discount > 0) row('Discount', `- ${money(totals.discount)}`);
  if (showGst) { row('Taxable value', money(totals.taxable)); if (data.supply === 'intra') { row('CGST', money(totals.cgst)); row('SGST', money(totals.sgst)); } else row('IGST', money(totals.igst)); }
  if (totals.roundOff !== 0) row('Round off', `${totals.roundOff > 0 ? '+' : '-'} ${money(Math.abs(totals.roundOff))}`);
  page.drawLine({ start: { x: boxX, y: ty + 10 }, end: { x: W - M, y: ty + 10 }, thickness: 0.8, color: ink });
  ty -= 4; row(`Total (${data.currencyLabel})`, money(totals.grand), true);

  let ly = y;
  if (showGst && totals.taxRows.length) {
    page.drawText(S('Tax summary'), { x: M, y: ly, size: 8, font: bold, color: muted }); ly -= 13;
    const heads = data.supply === 'intra' ? ['Rate', 'Taxable', 'CGST', 'SGST'] : ['Rate', 'Taxable', 'IGST'];
    heads.forEach((h, i) => text(h, M + i * 62, ly, { size: 8, font: bold, color: muted })); ly -= 12;
    for (const r of totals.taxRows) {
      const vals = data.supply === 'intra' ? [`${r.rate}%`, money(r.taxable), money(r.cgst), money(r.sgst)] : [`${r.rate}%`, money(r.taxable), money(r.igst)];
      vals.forEach((v, i) => text(v, M + i * 62, ly, { size: 8 })); ly -= 11;
    }
  }
  y = Math.min(ly, ty) - 10;

  // ── amount in words
  const words = (() => { try { return rupeesInWords(totals.grand); } catch { return ''; } })();
  if (words) { text('AMOUNT IN WORDS', M, y, { size: 8, font: bold, color: muted }); y -= 12; para(words, M, usable - 150, { size: 9.5, font: bold }); y -= 4; }

  // ── payment and notes
  const blockTop = y - 4;
  if (qrPng && y > 120) {
    const img = await doc.embedPng(qrPng); const q = 86;
    page.drawImage(img, { x: W - M - q, y: blockTop - q, width: q, height: q });
    text('Scan to pay (UPI)', W - M - q / 2, blockTop - q - 11, { size: 8, color: muted, align: 'center' });
  }
  const textWidth = qrPng ? usable - 110 : usable;
  if (data.bank.trim()) { text('PAYMENT DETAILS', M, y, { size: 8, font: bold, color: muted }); y -= 12; para(data.bank, M, textWidth, { size: 8.5 }); y -= 4; }
  if (data.upiId.trim()) { text(`UPI: ${data.upiId.trim()}`, M, y, { size: 8.5, font: bold }); y -= 14; }
  if (data.notes.trim()) { text('NOTES / TERMS', M, y, { size: 8, font: bold, color: muted }); y -= 12; para(data.notes, M, textWidth, { size: 8.5, color: muted }); }

  // ── footers
  doc.getPages().forEach((p, i, all) => {
    p.drawText(S(`Computer-generated invoice. ${all.length > 1 ? `Page ${i + 1} of ${all.length}. ` : ''}Made with TomatoAI`), { x: M, y: 16, size: 7, font: reg, color: muted });
  });
  return { bytes: await doc.save(), totals, replaced };
}
