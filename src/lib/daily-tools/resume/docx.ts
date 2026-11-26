import JSZip from 'jszip';
import { languageList, lines, period, skillGroups, contactItems, type ResumeData, type ResumeStyle } from './model';

/**
 * The resume as an editable Word file. Always a clean single column (headings, real bullet lists, right-aligned dates),
 * in the chosen accent colour and font: that is what people edit in Word and what job portals read best. Unlike the PDF it
 * can hold any script (Hindi, Tamil...) because Word brings its own fonts.
 */

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function xmlSafe(text: string): string {
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '').replace(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g, '');
}
const esc = (s: string) => xmlSafe(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hex = (c: string) => c.replace('#', '').toUpperCase();

const SIZES = { compact: { body: 20, after: 40, gap: 160 }, normal: { body: 21, after: 50, gap: 220 }, roomy: { body: 22, after: 70, gap: 280 } } as const;

interface RunOpts { bold?: boolean; italic?: boolean; color?: string; size?: number; caps?: boolean }
const run = (text: string, o: RunOpts = {}) => `<w:r><w:rPr>${o.bold ? '<w:b/>' : ''}${o.italic ? '<w:i/>' : ''}${o.caps ? '<w:caps/>' : ''}${o.color ? `<w:color w:val="${hex(o.color)}"/>` : ''}${o.size ? `<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>` : ''}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
const tabRun = '<w:r><w:tab/></w:r>';

export async function buildResumeDocx(d: ResumeData, style: ResumeStyle): Promise<Uint8Array> {
  const sz = SIZES[style.size] ?? SIZES.normal;
  const accent = style.accent;
  const center = style.template === 'classic' || style.template === 'executive';
  const font = style.font === 'serif' ? 'Cambria' : 'Calibri';
  const margin = style.size === 'compact' ? 850 : style.size === 'roomy' ? 1250 : 1050;
  const textWidth = 11906 - margin * 2;
  const nameColor = style.template === 'classic' || style.template === 'minimal' || style.template === 'executive' ? '1F2328' : accent;
  const body: string[] = [];

  const p = (inner: string, o: { jc?: 'center' | 'left'; before?: number; after?: number; tabRight?: boolean; style?: string; keepNext?: boolean; numbered?: boolean; bottomRule?: string } = {}) =>
    `<w:p><w:pPr>${o.style ? `<w:pStyle w:val="${o.style}"/>` : ''}${o.keepNext ? '<w:keepNext/>' : ''}${o.numbered ? '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>' : ''}${o.bottomRule ? `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${hex(o.bottomRule)}"/></w:pBdr>` : ''}${o.tabRight ? `<w:tabs><w:tab w:val="right" w:pos="${textWidth}"/></w:tabs>` : ''}<w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? sz.after}"/>${o.jc ? `<w:jc w:val="${o.jc}"/>` : ''}</w:pPr>${inner}</w:p>`;
  const align = center ? ('center' as const) : undefined;

  const name = d.name.trim() || 'Your Name';
  body.push(p(run(name, { bold: style.template !== 'minimal', color: nameColor, size: 52 }), { jc: align, after: 20 }));
  if (d.title.trim()) body.push(p(run(d.title.trim(), { color: '5B6470', size: sz.body + 4, italic: center }), { jc: align, after: 40 }));
  const contacts = contactItems(d).map((c) => c.text);
  if (contacts.length) body.push(p(run(contacts.join('  |  '), { color: '5B6470', size: sz.body - 2 }), { jc: align, after: 60 }));

  const heading = (label: string) => body.push(p(run(label, { bold: true, color: style.template === 'classic' || style.template === 'executive' ? '1F2328' : accent, size: sz.body + 2, caps: true }), { style: 'Heading1', before: sz.gap, after: 80, keepNext: true, bottomRule: style.template === 'minimal' ? undefined : style.template === 'classic' || style.template === 'executive' ? '1F2328' : accent }));
  const bullets = (text: string) => { for (const b of lines(text)) body.push(p(run(b, { size: sz.body }), { style: 'ListParagraph', numbered: true, after: 30 })); };
  const entryHead = (left: string, right: string, sub: string) => {
    body.push(p(run(left, { bold: true, size: sz.body + 1 }) + (right ? tabRun + run(right, { color: '5B6470', size: sz.body - 1 }) : ''), { tabRight: true, before: 90, after: 10, keepNext: true }));
    if (sub) body.push(p(run(sub, { italic: true, color: '5B6470', size: sz.body }), { after: 30, keepNext: true }));
  };

  const exp = d.experience.filter((e) => e.role.trim() || e.company.trim());
  const edu = d.education.filter((e) => e.degree.trim() || e.school.trim());
  const proj = d.projects.filter((x) => x.name.trim());
  const groups = skillGroups(d.skills); const certs = lines(d.certifications); const langs = languageList(d.languages);

  const sections: Record<string, () => void> = {
    summary: () => { if (!d.summary.trim()) return; heading('Summary'); body.push(p(run(d.summary.trim().replace(/\s*\n\s*/g, ' '), { size: sz.body }))); },
    experience: () => { if (!exp.length) return; heading('Experience'); for (const e of exp) { entryHead([e.role, e.company].filter((s) => s.trim()).join(', ') || e.company, period(e), e.location.trim()); bullets(e.bullets); } },
    projects: () => { if (!proj.length) return; heading('Projects'); for (const x of proj) { entryHead(x.name, '', x.link.trim().replace(/^https?:\/\/(www\.)?/i, '')); bullets(x.bullets); } },
    education: () => { if (!edu.length) return; heading('Education'); for (const e of edu) entryHead(e.degree || e.school, e.year.trim(), [e.degree.trim() ? e.school.trim() : '', e.location.trim(), e.grade.trim()].filter(Boolean).join(' · ')); },
    skills: () => { if (!groups.length) return; heading('Skills'); for (const g of groups) body.push(p((g.label ? run(`${g.label}: `, { bold: true, size: sz.body }) : '') + run(g.items.join(g.label ? ', ' : '  •  '), { size: sz.body }))); },
    certifications: () => { if (!certs.length) return; heading('Certifications'); for (const c of certs) body.push(p(run(c, { size: sz.body }), { style: 'ListParagraph', numbered: true, after: 30 })); },
    languages: () => { if (!langs.length) return; heading('Languages'); body.push(p(run(langs.join('  •  '), { size: sz.body }))); },
  };
  const order = style.educationFirst ? ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'languages'] : ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'languages'];
  for (const key of order) sections[key]();

  const zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`);
  zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(name)} - Resume</dc:title><dc:creator>${esc(name)}</dc:creator></cp:coreProperties>`);
  zip.file('word/numbering.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="${W_NS}"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="220"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`);
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W_NS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}" w:eastAsia="${font}"/><w:sz w:val="${sz.body}"/><w:szCs w:val="${sz.body}"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="${sz.after}" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:ind w:left="360"/></w:pPr></w:style></w:styles>`);
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W_NS}"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}
