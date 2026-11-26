import { PDFDocument, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { contactItems, languageList, lines, period, skillGroups, type ContactItem, type ResumeData, type ResumeStyle, type TemplateId } from './model';

/**
 * Draws a resume as a real, text-selectable PDF (so job-portal parsers can read it) with six designs.
 * One small layout engine does the work: a "flow" is a column with a cursor that starts a new page when full, and every
 * template is just a set of numbers and a few drawing choices. Built-in PDF fonts are used (no download), so only Western
 * letters can be drawn: other characters are replaced and reported, and the Word export carries them instead.
 */

export const A4 = { w: 595.28, h: 841.89 };
export interface RenderResult { bytes: Uint8Array; pages: number; replaced: boolean }

const INK = '#1F2328'; const GREY = '#5B6470'; const LIGHT = '#D5DAE0';

const hexToRgb = (hex: string) => { const n = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#1E3A5F'; return rgb(parseInt(n.slice(1, 3), 16) / 255, parseInt(n.slice(3, 5), 16) / 255, parseInt(n.slice(5, 7), 16) / 255); };
const mixHex = (a: string, b: string, t: number) => { const p = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16); const c = (i: number) => Math.round(p(a, i) * (1 - t) + p(b, i) * t).toString(16).padStart(2, '0'); return `#${c(1)}${c(3)}${c(5)}`; };

/** WinAnsi (what the built-in fonts can draw): ASCII, Latin-1 and a few typographic marks. Everything else becomes "?". */
function makeSafe(): { safe: (s: string) => string; didReplace: () => boolean } {
  let replaced = false;
  const safe = (s: string) => s.normalize('NFC').split('\u2028').join(' ').split('\u2029').join(' ').replace(/₹/g, 'Rs.').replace(/[\u200b-\u200f\u2060\ufeff]/g, '').replace(/[\r\t]/g, ' ').replace(/[\u2010\u2011\u2212]/g, '-')
    .replace(/[^\n\x20-\x7e\u00a0-\u00ff\u2022\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u20ac\u2122]/g, () => { replaced = true; return '?'; });
  return { safe, didReplace: () => replaced };
}

interface Spec {
  layout: 'single' | 'sidebar';
  header: 'left' | 'center' | 'banner';
  heading: 'ruled' | 'accent-rule' | 'bar' | 'light' | 'center-rule';
  nameSize: number; nameColor: 'ink' | 'accent' | 'white'; nameBold: boolean; sidebarW: number;
}

const SPECS: Record<TemplateId, Spec> = {
  classic: { layout: 'single', header: 'center', heading: 'ruled', nameSize: 24, nameColor: 'ink', nameBold: true, sidebarW: 0 },
  modern: { layout: 'single', header: 'left', heading: 'accent-rule', nameSize: 26, nameColor: 'accent', nameBold: true, sidebarW: 0 },
  banner: { layout: 'single', header: 'banner', heading: 'bar', nameSize: 27, nameColor: 'white', nameBold: true, sidebarW: 0 },
  sidebar: { layout: 'sidebar', header: 'left', heading: 'accent-rule', nameSize: 24, nameColor: 'accent', nameBold: true, sidebarW: 176 },
  minimal: { layout: 'single', header: 'left', heading: 'light', nameSize: 27, nameColor: 'ink', nameBold: false, sidebarW: 0 },
  executive: { layout: 'single', header: 'center', heading: 'center-rule', nameSize: 27, nameColor: 'ink', nameBold: true, sidebarW: 0 },
};

const SIZES = {
  compact: { base: 9.3, gap: 9, entry: 5, margin: 38 },
  normal: { base: 10.2, gap: 13, entry: 7, margin: 46 },
  roomy: { base: 10.8, gap: 17, entry: 9, margin: 54 },
};
const LH = 1.34;

export async function renderResumePdf(input: ResumeData, style: ResumeStyle): Promise<RenderResult> {
  const spec = SPECS[style.template] ?? SPECS.modern;
  const sz = SIZES[style.size] ?? SIZES.normal;
  const accent = style.accent; const accentRgb = hexToRgb(accent);
  const { safe, didReplace } = makeSafe();
  const one = (s: string) => safe(s).replace(/\s+/g, ' ').trim();

  const pdf = await PDFDocument.create();
  const [fr, fb, fi] = style.font === 'serif' ? [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic] : [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaOblique];
  const F = { r: await pdf.embedFont(fr), b: await pdf.embedFont(fb), i: await pdf.embedFont(fi) };

  const W = A4.w, H = A4.h;
  const marginBottom = 40, marginTop = 40;
  const pages: PDFPage[] = [];
  const links: Array<{ page: number; x: number; yTop: number; w: number; h: number; uri: string }> = [];
  let bandH = 0;

  const sidebar = spec.layout === 'sidebar';
  const sideW = spec.sidebarW;
  const sidePad = 20;

  const newPage = () => {
    const p = pdf.addPage([W, H]); pages.push(p);
    if (sidebar) p.drawRectangle({ x: 0, y: 0, width: sideW, height: H, color: accentRgb });
    if (spec.header === 'banner' && pages.length === 1) p.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: accentRgb });
  };

  class Flow {
    page = -1; y = 0;
    constructor(readonly x: number, readonly w: number, readonly top: number) {}
    get bottom() { return H - marginBottom; }
    next() { this.page++; while (pages.length <= this.page) newPage(); this.y = this.page === 0 && spec.header === 'banner' && this.top < bandH + 22 ? bandH + 22 : this.top; }
    ensure(h: number) { if (this.page < 0 || this.y + h > this.bottom + 0.01) this.next(); }
    remaining() { return this.page < 0 ? Infinity : this.bottom - this.y; }
  }

  const draw = (flow: Flow, text: string, x: number, yTop: number, size: number, font: PDFFont, color: string) => {
    if (!text) return;
    pages[flow.page].drawText(text, { x, y: H - (yTop + (size * LH) / 2 + size * 0.33), size, font, color: hexToRgb(color) });
  };
  const rule = (flow: Flow, x: number, x2: number, yTop: number, color: string, thickness = 0.7) => {
    pages[flow.page].drawLine({ start: { x, y: H - yTop }, end: { x: x2, y: H - yTop }, thickness, color: hexToRgb(color) });
  };
  const link = (flow: Flow, x: number, yTop: number, w: number, h: number, uri: string | null) => { if (uri) links.push({ page: flow.page, x, yTop, w, h, uri }); };

  function wrapText(text: string, font: PDFFont, size: number, width: number, firstOffset = 0): string[] {
    const out: string[] = []; const words = text.split(/\s+/).filter(Boolean);
    let cur = ''; let avail = width - firstOffset;
    const fits = (s: string, a: number) => font.widthOfTextAtSize(s, size) <= a;
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (fits(test, avail)) { cur = test; continue; }
      if (cur) { out.push(cur); cur = ''; avail = width; }
      let w = word;
      while (!fits(w, avail) && w.length > 1) { let k = w.length - 1; while (k > 1 && !fits(w.slice(0, k), avail)) k--; out.push(w.slice(0, k)); w = w.slice(k); avail = width; }
      cur = w;
    }
    if (cur || out.length === 0) out.push(cur);
    return out;
  }

  const base = sz.base;
  const lineH = (size: number) => size * LH;

  /** A paragraph in one font. */
  function para(flow: Flow, text: string, o: { font?: PDFFont; size?: number; color?: string; indent?: number; align?: 'left' | 'center'; after?: number; uri?: string | null } = {}) {
    const font = o.font ?? F.r, size = o.size ?? base, indent = o.indent ?? 0;
    const t = one(text); if (!t) return;
    const ls = wrapText(t, font, size, flow.w - indent);
    for (const l of ls) {
      flow.ensure(lineH(size));
      const lw = font.widthOfTextAtSize(l, size);
      const x = o.align === 'center' ? flow.x + (flow.w - lw) / 2 : flow.x + indent;
      draw(flow, l, x, flow.y, size, font, o.color ?? INK);
      link(flow, x, flow.y, lw, lineH(size), o.uri ?? null);
      flow.y += lineH(size);
    }
    flow.y += o.after ?? 0;
  }

  /** A bold label followed by normal text that wraps under the label's line. */
  function labelled(flow: Flow, label: string, text: string, o: { size?: number; color?: string; labelColor?: string } = {}) {
    const size = o.size ?? base; const l = one(label) + ' '; const body = one(text);
    const lw = F.b.widthOfTextAtSize(l, size);
    const ls = wrapText(body, F.r, size, flow.w, lw);
    ls.forEach((line, i) => {
      flow.ensure(lineH(size));
      if (i === 0) { draw(flow, l, flow.x, flow.y, size, F.b, o.labelColor ?? o.color ?? INK); draw(flow, line, flow.x + lw, flow.y, size, F.r, o.color ?? INK); }
      else draw(flow, line, flow.x, flow.y, size, F.r, o.color ?? INK);
      flow.y += lineH(size);
    });
  }

  function bullet(flow: Flow, text: string, o: { size?: number; color?: string } = {}) {
    const size = o.size ?? base; const indent = 11;
    const ls = wrapText(one(text), F.r, size, flow.w - indent);
    ls.forEach((line, i) => {
      flow.ensure(lineH(size));
      if (i === 0) draw(flow, '•', flow.x + 1.5, flow.y, size, F.r, o.color ?? INK);
      draw(flow, line, flow.x + indent, flow.y, size, F.r, o.color ?? INK);
      flow.y += lineH(size);
    });
  }

  const bulletHeight = (flow: Flow, text: string, size = base) => wrapText(one(text), F.r, size, flow.w - 11).length * lineH(size);

  /** Section heading in the template's style. Kept with the content that follows (needs room for a couple of lines). */
  function heading(flow: Flow, label: string, o: { onDark?: boolean; first?: boolean } = {}) {
    const text = one(label).toUpperCase();
    const size = spec.heading === 'light' ? base - 0.8 : base + 0.9;
    const gapBefore = o.first ? 0 : sz.gap;
    const total = gapBefore + lineH(size) + 8 + lineH(base) * 2;
    flow.ensure(total);
    if (flow.y > flow.top + 0.5) flow.y += gapBefore;
    const color = o.onDark ? '#FFFFFF' : spec.heading === 'ruled' || spec.heading === 'center-rule' ? INK : spec.heading === 'light' ? GREY : accent;
    const y = flow.y; const lh = lineH(size);
    if (spec.heading === 'center-rule') {
      const tw = F.b.widthOfTextAtSize(text, size); const x = flow.x + (flow.w - tw) / 2; const mid = y + lh / 2;
      draw(flow, text, x, y, size, F.b, color);
      rule(flow, flow.x, x - 8, mid, GREY, 0.6); rule(flow, x + tw + 8, flow.x + flow.w, mid, GREY, 0.6);
      flow.y += lh + 5; return;
    }
    if (spec.heading === 'bar' && !o.onDark) {
      pages[flow.page].drawRectangle({ x: flow.x, y: H - (y + lh - 2), width: 3.2, height: lh - 3, color: accentRgb });
      draw(flow, text, flow.x + 9, y, size, F.b, color); flow.y += lh + 4; return;
    }
    draw(flow, text, flow.x, y, size, F.b, color);
    flow.y += lh;
    if (o.onDark) rule(flow, flow.x, flow.x + flow.w, flow.y + 1, mixHex(accent, '#FFFFFF', 0.45), 0.6);
    else if (spec.heading === 'ruled') rule(flow, flow.x, flow.x + flow.w, flow.y + 1, INK, 0.7);
    else if (spec.heading === 'accent-rule') rule(flow, flow.x, flow.x + flow.w, flow.y + 1, accent, 1);
    flow.y += spec.heading === 'light' ? 4 : 6;
  }

  interface Entry { left: string; right: string; sub: string; bullets: string[]; link?: string | null }
  function entry(flow: Flow, e: Entry) {
    const size = base;
    const rightText = one(e.right); const rw = rightText ? F.r.widthOfTextAtSize(rightText, size - 0.4) : 0;
    const leftLines = wrapText(one(e.left), F.b, size + 0.4, flow.w - (rw ? rw + 12 : 0));
    const subLines = e.sub ? wrapText(one(e.sub), F.i, size, flow.w) : [];
    const head = (leftLines.length + subLines.length) * lineH(size + 0.4);
    const bulletsH = e.bullets.reduce((s, b) => s + bulletHeight(flow, b), 0);
    const total = head + bulletsH;
    const firstBullet = e.bullets[0] ? bulletHeight(flow, e.bullets[0]) : 0;
    if (flow.page >= 0 && flow.y + total > flow.bottom) {
      // Keep a short entry together; for a long one at least keep its title with its first bullet.
      const room = flow.bottom - flow.top;
      if (total <= room * 0.55 || flow.y + head + firstBullet > flow.bottom) flow.next();
    }
    leftLines.forEach((l, i) => {
      flow.ensure(lineH(size + 0.4));
      draw(flow, l, flow.x, flow.y, size + 0.4, F.b, INK);
      if (i === 0 && rightText) draw(flow, rightText, flow.x + flow.w - rw, flow.y, size - 0.4, F.r, GREY);
      flow.y += lineH(size + 0.4);
    });
    subLines.forEach((l) => { flow.ensure(lineH(size)); draw(flow, l, flow.x, flow.y, size, F.i, GREY); flow.y += lineH(size); });
    for (const b of e.bullets) bullet(flow, b);
    flow.y += sz.entry;
  }

  // ── content blocks (shared by every template) ──────────────────────
  const d = input;
  const exp = d.experience.filter((e) => e.role.trim() || e.company.trim());
  const edu = d.education.filter((e) => e.degree.trim() || e.school.trim());
  const proj = d.projects.filter((p) => p.name.trim());
  const groups = skillGroups(d.skills); const certs = lines(d.certifications); const langs = languageList(d.languages);

  const summaryBlock = (f: Flow, first: boolean) => { if (!d.summary.trim()) return false; heading(f, 'Summary', { first }); para(f, d.summary, { after: 2 }); return true; };
  const experienceBlock = (f: Flow, first: boolean) => {
    if (!exp.length) return false; heading(f, 'Experience', { first });
    for (const e of exp) entry(f, { left: [e.role, e.company].filter((s) => s.trim()).join(', ') || e.company, right: period(e), sub: e.location.trim(), bullets: lines(e.bullets) });
    return true;
  };
  const projectsBlock = (f: Flow, first: boolean) => {
    if (!proj.length) return false; heading(f, 'Projects', { first });
    for (const p of proj) entry(f, { left: p.name, right: '', sub: p.link.trim() ? p.link.trim().replace(/^https?:\/\/(www\.)?/i, '') : '', bullets: lines(p.bullets) });
    return true;
  };
  const educationBlock = (f: Flow, first: boolean) => {
    if (!edu.length) return false; heading(f, 'Education', { first });
    for (const e of edu) entry(f, { left: e.degree || e.school, right: e.year.trim(), sub: [e.degree.trim() ? e.school.trim() : '', e.location.trim(), e.grade.trim()].filter(Boolean).join(' · '), bullets: [] });
    return true;
  };
  const skillsBlock = (f: Flow, first: boolean, onDark = false) => {
    if (!groups.length) return false; heading(f, 'Skills', { first, onDark });
    const col = onDark ? '#FFFFFF' : INK;
    for (const g of groups) {
      if (onDark) {
        if (g.label) para(f, g.label, { font: F.b, color: '#FFFFFF', size: base - 0.3 });
        para(f, g.items.join(', '), { color: '#FFFFFF', size: base - 0.3, after: 3 });
      } else if (g.label) labelled(f, `${g.label}:`, g.items.join(', '), { color: col });
      else para(f, g.items.join('  •  '), { color: col });
    }
    f.y += 2; return true;
  };
  const certsBlock = (f: Flow, first: boolean, onDark = false) => {
    if (!certs.length) return false; heading(f, 'Certifications', { first, onDark });
    for (const c of certs) { if (onDark) para(f, c, { color: '#FFFFFF', size: base - 0.3, after: 2 }); else bullet(f, c); }
    return true;
  };
  const languagesBlock = (f: Flow, first: boolean, onDark = false) => {
    if (!langs.length) return false; heading(f, 'Languages', { first, onDark });
    if (onDark) for (const l of langs) para(f, l, { color: '#FFFFFF', size: base - 0.3, after: 1 });
    else para(f, langs.join('  •  '), { color: INK });
    return true;
  };

  // ── header ─────────────────────────────────────────────────────────
  const name = one(d.name) || 'Your Name';
  const title = one(d.title);
  const contacts = contactItems(d).map((c): ContactItem => ({ text: one(c.text), href: c.href }));
  const nameFont = spec.nameBold ? F.b : F.r;
  const nameColor = spec.nameColor === 'white' ? '#FFFFFF' : spec.nameColor === 'accent' ? accent : INK;
  const sep = '  |  ';

  /** Greedy-fits contact items into lines of the given width, so each item stays whole and clickable. */
  function contactLines(width: number, size: number, separator: string): ContactItem[][] {
    const out: ContactItem[][] = []; let cur: ContactItem[] = []; let w = 0;
    const sw = F.r.widthOfTextAtSize(separator, size);
    for (const c of contacts) {
      const cw = F.r.widthOfTextAtSize(c.text, size);
      if (cur.length && w + sw + cw > width) { out.push(cur); cur = []; w = 0; }
      w += (cur.length ? sw : 0) + cw; cur.push(c);
    }
    if (cur.length) out.push(cur);
    return out;
  }
  function drawContactLines(flow: Flow, cl: ContactItem[][], size: number, color: string, separator: string, align: 'left' | 'center') {
    const sw = F.r.widthOfTextAtSize(separator, size);
    for (const line of cl) {
      flow.ensure(lineH(size));
      const total = line.reduce((s, c, i) => s + F.r.widthOfTextAtSize(c.text, size) + (i ? sw : 0), 0);
      let x = align === 'center' ? flow.x + (flow.w - total) / 2 : flow.x;
      line.forEach((c, i) => {
        if (i) { draw(flow, separator, x, flow.y, size, F.r, color === '#FFFFFF' ? '#FFFFFF' : LIGHT); x += sw; }
        const cw = F.r.widthOfTextAtSize(c.text, size);
        draw(flow, c.text, x, flow.y, size, F.r, color); link(flow, x, flow.y, cw, lineH(size), c.href); x += cw;
      });
      flow.y += lineH(size);
    }
  }

  const mainX = sidebar ? sideW + 24 : sz.margin;
  const mainW = sidebar ? W - sideW - 24 - 34 : W - sz.margin * 2;
  const main = new Flow(mainX, mainW, marginTop);

  if (spec.header === 'banner') {
    const cl = contactLines(mainW, base - 0.2, sep);
    bandH = 24 + lineH(spec.nameSize) + (title ? lineH(base + 3) : 0) + 6 + cl.length * lineH(base - 0.2) + 20;
  }

  main.ensure(1);
  {
    const nameLines = wrapText(name, nameFont, spec.nameSize, mainW);
    const align = spec.header === 'center' ? 'center' : 'left';
    if (spec.header === 'banner') main.y = 24;
    for (const l of nameLines) {
      main.ensure(lineH(spec.nameSize));
      const x = align === 'center' ? main.x + (main.w - nameFont.widthOfTextAtSize(l, spec.nameSize)) / 2 : main.x;
      draw(main, l, x, main.y, spec.nameSize, nameFont, nameColor); main.y += lineH(spec.nameSize);
    }
    if (title) para(main, title, { font: spec.header === 'center' ? F.i : F.r, size: base + (spec.header === 'banner' ? 3 : 2), color: spec.header === 'banner' ? '#FFFFFF' : GREY, align });
    if (spec.header === 'banner') { main.y += 6; drawContactLines(main, contactLines(mainW, base - 0.2, sep), base - 0.2, '#FFFFFF', sep, 'left'); main.y = bandH + 18; }
    else if (!sidebar) { main.y += 4; drawContactLines(main, contactLines(mainW, base - 0.2, sep), base - 0.2, GREY, sep, align); if (spec.header === 'center') { main.y += 3; rule(main, main.x, main.x + main.w, main.y, spec.heading === 'ruled' ? INK : GREY, spec.heading === 'ruled' ? 0.9 : 0.6); main.y += 7; } else main.y += 3; }
    else main.y += 8;
  }

  // ── body ───────────────────────────────────────────────────────────
  if (sidebar) {
    summaryBlock(main, true);
    const seq = style.educationFirst ? [educationBlock, experienceBlock, projectsBlock] : [experienceBlock, projectsBlock, educationBlock];
    for (const block of seq) block(main, false);
    const side = new Flow(sidePad, sideW - sidePad * 2, 44);
    side.ensure(1);
    if (contacts.length) {
      heading(side, 'Contact', { first: true, onDark: true });
      for (const c of contacts) para(side, c.text, { color: '#FFFFFF', size: base - 0.4, after: 3, uri: c.href });
    }
    skillsBlock(side, !contacts.length, true); languagesBlock(side, false, true); certsBlock(side, false, true);
  } else {
    const order = style.educationFirst ? [summaryBlock, educationBlock, experienceBlock, projectsBlock, skillsBlock, certsBlock, languagesBlock] : [summaryBlock, experienceBlock, projectsBlock, educationBlock, skillsBlock, certsBlock, languagesBlock];
    for (const block of order) block(main, false);
  }

  // Clickable links (email, phone, web addresses).
  for (const l of links) {
    const page = pages[l.page];
    const ref = pdf.context.register(pdf.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [l.x, H - (l.yTop + l.h), l.x + l.w, H - l.yTop], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(l.uri) } }));
    page.node.addAnnot(ref);
  }

  const person = one(d.name) || 'Resume';
  pdf.setTitle(`${person} - Resume`); pdf.setAuthor(person); pdf.setCreator('TomatoAI Resume Builder'); pdf.setProducer('TomatoAI Resume Builder'); pdf.setSubject('Resume');
  const bytes = await pdf.save();
  return { bytes, pages: pages.length, replaced: didReplace() };
}
