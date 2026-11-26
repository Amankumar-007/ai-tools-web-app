/**
 * Compares a resume with a job description: which important words from the job post does the resume already contain,
 * and which are missing? This is plain text matching (what many job portals and recruiters do first), not a score from
 * any real hiring system, and the UI says so.
 */

const STOP = new Set(`a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its just me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their theirs them then there these they this those through to too under until up us very was we were what when where which while who whom why will with would you your yours
able ability abilities across additional along already always among another anyone apply applicants applicant around aware based best better beyond bring candidate candidates choose click close come company companies concerned considered contribute core currently day days deliver description desired details developing different directly diverse drive due effective either employer employees employee end ensure environment equal equivalent especially etc even every excellent exciting experience experienced experiences expected fast field find first following form full functions future get give globally goals good great grow growing growth help high highly hiring ideal important including include includes individual industry information interested involved job jobs join keep key know knowledge large lead leading learn level like likely little long looking made make makes making manage many may meet member members might mission must need needs new next offer one open opportunity opportunities organization other others overall part passion passionate people perform performance perks person plus position positions possible preferred prior proven provide provides providing qualifications qualified range ready really related relevant reports required requirements requires responsibilities responsibility responsible results role roles salary seek seeking select senior set several should similar skill skills solid some someone something start started strong successful support take taking talent team teams tell their things think time today together top toward track true try understanding use used using various want ways well whether within without work worked working works world would year years your`.split(/\s+/));

export interface Keyword { term: string; count: number; found: boolean }
export interface MatchResult { keywords: Keyword[]; found: Keyword[]; missing: Keyword[]; percent: number; jobWords: number; resumeWords: number }

const TOKEN = /[a-z0-9][a-z0-9+#./&-]*[a-z0-9+#]|[a-z0-9]/g;

function tokens(text: string): string[] {
  return (text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(TOKEN) ?? []).map((t) => t.replace(/^[.&-]+|[.&-]+$/g, '')).filter(Boolean);
}

/** Light stemming so "managed", "managing" and "management" are not three different words. */
export function stem(word: string): string {
  let w = word;
  if (w.length > 6 && /(ement|ation)s?$/.test(w)) w = w.replace(/(ement|ation)s?$/, '');
  else if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.length > 3 && w.endsWith('es') && /(ch|sh|x|s|z)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  return w.length > 3 && w.endsWith('e') ? w.slice(0, -1) : w;
}

const isKeywordToken = (t: string) => !STOP.has(t) && !/^\d+([.,]\d+)?$/.test(t) && (t.length >= 3 || /^[a-z]{1,2}[+#]*$/.test(t) && /[+#]|^(c|r|go|ai|ml|bi|qa|ux|ui|hr|seo|sql)$/.test(t));

/**
 * Words written in capitals or with a capital in the middle of a sentence (SQL, HubSpot, Meta, Python) are very likely
 * skills, tools or products, even when the job post mentions them only once.
 */
function emphasised(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.matchAll(/[A-Za-z][A-Za-z0-9+#./-]*/g)) {
    const word = m[0]; const i = m.index ?? 0;
    const allCaps = word.length >= 2 && word === word.toUpperCase() && /[A-Z]{2}/.test(word);
    const inner = /^[A-Z]/.test(word) && /[a-z]/.test(word) && /[^.!?:\n•*\-–]\s+$/.test(text.slice(Math.max(0, i - 3), i)) && i > 2;
    const camel = /^[a-z]+[A-Z]/.test(word) || /^[A-Z][a-z]+[A-Z]/.test(word);
    if (allCaps || inner || camel) out.add(word.toLowerCase().replace(/^[.&-]+|[.&-]+$/g, ''));
  }
  return out;
}

export function extractKeywords(jobText: string, limit = 30): Array<{ term: string; count: number }> {
  const toks = tokens(jobText);
  const emph = emphasised(jobText);
  const uni = new Map<string, number>(); const bi = new Map<string, number>();
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (isKeywordToken(t)) uni.set(t, (uni.get(t) ?? 0) + 1);
    const n = toks[i + 1];
    if (n && isKeywordToken(t) && isKeywordToken(n) && t !== n) bi.set(`${t} ${n}`, (bi.get(`${t} ${n}`) ?? 0) + 1);
  }
  const picked: Array<{ term: string; count: number }> = [];
  const phrases = [...bi.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const covered = new Map<string, number>();
  for (const [term, c] of phrases.slice(0, 10)) { picked.push({ term, count: c }); for (const w of term.split(' ')) covered.set(w, Math.max(covered.get(w) ?? 0, c)); }
  const words = [...uni.entries()]
    .filter(([w, c]) => c >= 2 || w.length >= 5 || /[+#]/.test(w) || emph.has(w))
    .sort((a, b) => b[1] - a[1] || Number(emph.has(b[0])) - Number(emph.has(a[0])) || a[0].localeCompare(b[0]));
  for (const [term, c] of words) {
    if (picked.length >= limit) break;
    // A word that only ever appears inside an already-picked phrase adds nothing.
    if ((covered.get(term) ?? 0) >= c && c < 4) continue;
    picked.push({ term, count: c });
  }
  return picked.slice(0, limit);
}

export function matchKeywords(resumeText: string, jobText: string, limit = 30): MatchResult {
  const resumeToks = tokens(resumeText);
  const stems = new Set(resumeToks.map(stem));
  const joined = ` ${resumeToks.map(stem).join(' ')} `;
  const keywords: Keyword[] = extractKeywords(jobText, limit).map(({ term, count }) => {
    const parts = term.split(' ').map(stem);
    const found = parts.length === 1 ? stems.has(parts[0]) : joined.includes(` ${parts.join(' ')} `);
    return { term, count, found };
  });
  const found = keywords.filter((k) => k.found); const missing = keywords.filter((k) => !k.found);
  const total = keywords.reduce((s, k) => s + k.count, 0);
  const have = found.reduce((s, k) => s + k.count, 0);
  return { keywords, found, missing, percent: total ? Math.round((have / total) * 100) : 0, jobWords: tokens(jobText).length, resumeWords: resumeToks.length };
}
