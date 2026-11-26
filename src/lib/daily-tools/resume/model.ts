/**
 * The resume's data and design settings. Pure data helpers: no DOM, no PDF code, so every rule here is unit-tested in Node.
 */

export interface ExperienceItem { id: string; role: string; company: string; location: string; start: string; end: string; current: boolean; bullets: string }
export interface EducationItem { id: string; degree: string; school: string; location: string; year: string; grade: string }
export interface ProjectItem { id: string; name: string; link: string; bullets: string }

export interface ResumeData {
  name: string; title: string; email: string; phone: string; location: string; linkedin: string; website: string;
  summary: string;
  experience: ExperienceItem[]; education: EducationItem[]; projects: ProjectItem[];
  /** One group per line. "Category: a, b, c" makes a labelled group; otherwise a comma-separated list. */
  skills: string;
  /** One per line. */
  certifications: string;
  /** Comma-separated. */
  languages: string;
}

export type TemplateId = 'classic' | 'modern' | 'banner' | 'sidebar' | 'minimal' | 'executive';
export type FontChoice = 'sans' | 'serif';
export type SizeChoice = 'compact' | 'normal' | 'roomy';

export interface ResumeStyle { template: TemplateId; accent: string; font: FontChoice; size: SizeChoice; educationFirst: boolean }

/** Dark enough that white text on them is readable (checked in tests): used for banners and the sidebar. */
export const ACCENTS: Array<{ name: string; hex: string }> = [
  { name: 'Navy', hex: '#1E3A5F' }, { name: 'Blue', hex: '#1D4ED8' }, { name: 'Teal', hex: '#0F766E' }, { name: 'Forest', hex: '#166534' },
  { name: 'Burgundy', hex: '#9F1239' }, { name: 'Purple', hex: '#6D28D9' }, { name: 'Rust', hex: '#B45309' }, { name: 'Slate', hex: '#334155' },
];

export const TEMPLATES: Array<{ id: TemplateId; label: string; blurb: string; font: FontChoice; atsNote?: string }> = [
  { id: 'classic', label: 'Classic', blurb: 'Centred name, ruled headings. Traditional and safe for any employer.', font: 'serif' },
  { id: 'modern', label: 'Modern', blurb: 'Accent-colour name and headings on a clean single column.', font: 'sans' },
  { id: 'banner', label: 'Banner', blurb: 'Bold colour header with your name and contact details.', font: 'sans' },
  { id: 'sidebar', label: 'Sidebar', blurb: 'Two columns: contact, skills and languages on the side.', font: 'sans', atsNote: 'Two-column layouts are read less reliably by some job-portal parsers. Use a single-column design for online applications.' },
  { id: 'minimal', label: 'Minimal', blurb: 'Quiet and airy, lots of white space. Lets the content speak.', font: 'sans' },
  { id: 'executive', label: 'Executive', blurb: 'Serif, centred, dignified. For senior and managerial roles.', font: 'serif' },
];

export const DEFAULT_STYLE: ResumeStyle = { template: 'modern', accent: '#1E3A5F', font: 'sans', size: 'normal', educationFirst: false };

let counter = 0;
export const newId = () => `r${Date.now().toString(36)}${(counter++).toString(36)}`;

export const emptyExperience = (): ExperienceItem => ({ id: newId(), role: '', company: '', location: '', start: '', end: '', current: false, bullets: '' });
export const emptyEducation = (): EducationItem => ({ id: newId(), degree: '', school: '', location: '', year: '', grade: '' });
export const emptyProject = (): ProjectItem => ({ id: newId(), name: '', link: '', bullets: '' });

export function emptyResume(): ResumeData {
  return { name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '', experience: [emptyExperience()], education: [emptyEducation()], projects: [], skills: '', certifications: '', languages: '' };
}

export function sampleResume(): ResumeData {
  return {
    name: 'Priya Sharma', title: 'Digital Marketing Manager', email: 'priya.sharma@example.com', phone: '+91 98765 43210', location: 'Pune, Maharashtra', linkedin: 'linkedin.com/in/priyasharma', website: '',
    summary: 'Digital marketer with 6 years of experience growing D2C brands through SEO, paid media and email. Led campaigns that doubled organic traffic and cut cost per lead by 31%. Comfortable owning a budget, a team and a number.',
    experience: [
      { id: newId(), role: 'Digital Marketing Manager', company: 'Bloom Naturals', location: 'Pune', start: 'Jun 2021', end: '', current: true, bullets: 'Grew organic traffic from 40,000 to 95,000 monthly visits in 14 months with a content and technical SEO plan.\nManaged a Rs. 18 lakh quarterly paid budget across Google and Meta; lowered cost per lead by 31%.\nLed a team of 4 (designer, copywriter, two executives) and introduced a weekly reporting rhythm.' },
      { id: newId(), role: 'Marketing Executive', company: 'Kite Retail', location: 'Mumbai', start: 'Jul 2018', end: 'May 2021', current: false, bullets: 'Ran email campaigns to a 60,000-person list with a 27% average open rate.\nLaunched the brand\'s Instagram channel and reached 25,000 followers in 10 months.' },
    ],
    education: [{ id: newId(), degree: 'MBA, Marketing', school: 'Symbiosis Institute of Business Management', location: 'Pune', year: '2018', grade: 'CGPA 8.2' }, { id: newId(), degree: 'B.Com', school: 'Fergusson College', location: 'Pune', year: '2016', grade: '78%' }],
    projects: [{ id: newId(), name: 'Local Seller Growth Toolkit', link: '', bullets: 'Built a free toolkit of 12 templates used by 800+ small sellers.' }],
    skills: 'Marketing: SEO, Google Ads, Meta Ads, Email marketing, Content strategy\nTools: Google Analytics 4, Search Console, HubSpot, Canva, Excel',
    certifications: 'Google Analytics Certification, 2023\nHubSpot Inbound Marketing, 2022',
    languages: 'English, Hindi, Marathi',
  };
}

// ── text helpers ─────────────────────────────────────────────────────

/** Splits a multi-line box into clean items: trims, drops blank lines and any bullet characters the user typed. */
export function lines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.replace(/^\s*(?:[•◦▪●·‣⁃*–—-]|\d{1,2}[.)])\s+/, '').trim()).filter(Boolean);
}

/** "Jan 2022 – Present" style period; empty parts are skipped. */
export function period(e: Pick<ExperienceItem, 'start' | 'end' | 'current'>): string {
  const start = e.start.trim(); const end = e.current ? 'Present' : e.end.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export interface SkillGroup { label: string | null; items: string[] }

/** "Tools: Excel, Canva" -> labelled group; plain lines or commas -> unlabelled items. */
export function skillGroups(text: string): SkillGroup[] {
  const groups: SkillGroup[] = [];
  const loose: string[] = [];
  for (const line of lines(text)) {
    const m = /^([^:,]{1,32}):\s*(.+)$/.exec(line);
    const split = (s: string) => s.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
    if (m) groups.push({ label: m[1].trim(), items: split(m[2]) });
    else loose.push(...split(line));
  }
  return loose.length ? [{ label: null, items: loose }, ...groups] : groups;
}

export const languageList = (text: string): string[] => text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

/** Makes a pasted address clickable: adds https:// when missing. Returns null when it cannot be a web address. */
export function webUrl(value: string): string | null {
  const v = value.trim();
  if (!v || /\s/.test(v)) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.') ? u.toString() : null;
  } catch { return null; }
}
export const mailUrl = (v: string): string | null => (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v.trim()) ? `mailto:${v.trim()}` : null);
export const telUrl = (v: string): string | null => { const d = v.replace(/[^\d+]/g, ''); return d.replace(/\D/g, '').length >= 7 ? `tel:${d}` : null; };

/** Keeps a link's visible text short: no https://, no trailing slash. */
export const shortUrl = (v: string): string => v.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '');

export interface ContactItem { text: string; href: string | null }
export function contactItems(d: ResumeData): ContactItem[] {
  const out: ContactItem[] = [];
  if (d.email.trim()) out.push({ text: d.email.trim(), href: mailUrl(d.email) });
  if (d.phone.trim()) out.push({ text: d.phone.trim(), href: telUrl(d.phone) });
  if (d.location.trim()) out.push({ text: d.location.trim(), href: null });
  if (d.linkedin.trim()) out.push({ text: shortUrl(d.linkedin), href: webUrl(d.linkedin) });
  if (d.website.trim()) out.push({ text: shortUrl(d.website), href: webUrl(d.website) });
  return out;
}

export const hasContent = (d: ResumeData): boolean => d.name.trim() !== '';

/** Gentle, honest checks shown beside the preview. Never blocks a download. */
export function resumeTips(d: ResumeData, pages: number): string[] {
  const tips: string[] = [];
  if (!d.email.trim() && !d.phone.trim()) tips.push('Add an email or phone number so recruiters can reach you.');
  else if (d.email.trim() && !mailUrl(d.email)) tips.push('The email address does not look complete.');
  if (!d.summary.trim()) tips.push('A two-line summary at the top helps a recruiter decide in seconds.');
  else if (d.summary.trim().length > 600) tips.push('Your summary is long. Aim for 2 to 4 lines.');
  const bullets = d.experience.flatMap((e) => lines(e.bullets));
  if (d.experience.some((e) => e.role.trim() || e.company.trim()) && bullets.length === 0) tips.push('Add bullet points under your jobs: what you did and what changed because of it.');
  const withNumber = bullets.filter((b) => /\d/.test(b)).length;
  if (bullets.length >= 3 && withNumber / bullets.length < 0.3) tips.push('Few bullets contain numbers. Add results such as %, rupees, team size or time saved.');
  if (bullets.some((b) => b.length > 240)) tips.push('Some bullets are very long. One or two lines each reads best.');
  if (!d.skills.trim()) tips.push('Add a skills section: recruiters and job portals search for these words.');
  if (pages > 2) tips.push(`Your resume runs to ${pages} pages. Most recruiters prefer one page (up to 10 years of experience) or two. Try the Compact size or trim older roles.`);
  return tips;
}

// ── persistence (browser) ────────────────────────────────────────────

const STR = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, max) : '');

/** Rebuilds a resume from untrusted JSON (localStorage, a shared file): every field is typed and length-capped. */
export function normalizeResume(raw: unknown): ResumeData {
  const base = emptyResume();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const o = raw as Record<string, unknown>;
  const arr = (v: unknown, max: number): Array<Record<string, unknown>> => (Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)).slice(0, max) : []);
  return {
    name: STR(o.name, 80), title: STR(o.title, 100), email: STR(o.email, 120), phone: STR(o.phone, 40), location: STR(o.location, 80), linkedin: STR(o.linkedin, 200), website: STR(o.website, 200),
    summary: STR(o.summary, 1500),
    experience: arr(o.experience, 12).map((e) => ({ id: newId(), role: STR(e.role, 100), company: STR(e.company, 100), location: STR(e.location, 80), start: STR(e.start, 30), end: STR(e.end, 30), current: e.current === true, bullets: STR(e.bullets, 3000) })),
    education: arr(o.education, 8).map((e) => ({ id: newId(), degree: STR(e.degree, 120), school: STR(e.school, 120), location: STR(e.location, 80), year: STR(e.year, 30), grade: STR(e.grade, 40) })),
    projects: arr(o.projects, 8).map((e) => ({ id: newId(), name: STR(e.name, 100), link: STR(e.link, 200), bullets: STR(e.bullets, 1500) })),
    skills: STR(o.skills, 1500), certifications: STR(o.certifications, 1500), languages: STR(o.languages, 300),
  };
}

const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
export function normalizeStyle(raw: unknown): ResumeStyle {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const template = TEMPLATE_IDS.includes(o.template as TemplateId) ? (o.template as TemplateId) : DEFAULT_STYLE.template;
  const accent = typeof o.accent === 'string' && ACCENTS.some((a) => a.hex === o.accent) ? o.accent : DEFAULT_STYLE.accent;
  return {
    template, accent,
    font: o.font === 'serif' || o.font === 'sans' ? o.font : TEMPLATES.find((t) => t.id === template)!.font,
    size: o.size === 'compact' || o.size === 'roomy' || o.size === 'normal' ? o.size : 'normal',
    educationFirst: o.educationFirst === true,
  };
}

/** File name for downloads: "Priya-Sharma-Resume.pdf". */
export function resumeFileName(d: ResumeData, ext: string): string {
  const base = d.name.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '') || 'My';
  return `${base}-Resume.${ext}`;
}
