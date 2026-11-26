/** Text utilities. Pure functions; nothing here touches the network. */

export const MAX_TEXT = 500_000;

export interface TextStats {
  words: number; characters: number; charactersNoSpaces: number; sentences: number; paragraphs: number; lines: number;
  uniqueWords: number; readingMinutes: number; speakingMinutes: number;
}

// Combining marks (Hindi vowel signs, accents) belong to the word they sit in.
const wordsOf = (text: string) => text.match(/[\p{L}\p{N}\p{M}]+(?:['’\-][\p{L}\p{N}\p{M}]+)*/gu) ?? [];

export function textStats(text: string): TextStats {
  const words = wordsOf(text);
  const sentences = text.split(/[.!?।]+(?:\s|$)/u).filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  return {
    words: words.length,
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/g, '')].length,
    sentences,
    paragraphs,
    lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
    uniqueWords: new Set(words.map((w) => w.toLowerCase())).size,
    readingMinutes: words.length / 200,
    speakingMinutes: words.length / 130,
  };
}

/** "under a minute", "3 min 20 sec" */
export function formatMinutes(minutes: number): string {
  const total = Math.round(minutes * 60);
  if (total < 1) return '0 sec';
  if (total < 60) return `${total} sec`;
  const m = Math.floor(total / 60); const s = total % 60;
  return s && m < 10 ? `${m} min ${s} sec` : `${m} min`;
}

const STOP = new Set('the a an and or but if then else of to in on at by for with from as is are was were be been being it its this that these those i you he she we they them his her our your their not no do does did have has had will would can could should may might must so than too very just into about over after before up down out off again there here what which who whom when where why how all any both each few more most other some such only own same also'.split(' '));

export function topKeywords(text: string, limit = 10): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();
  for (const w of wordsOf(text.toLowerCase())) if (w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([word, count]) => ({ word, count }));
}

// ── Case conversion ───────────────────────────────────────────────────

const splitWords = (text: string) => text.split(/[^\p{L}\p{N}\p{M}]+/u).filter(Boolean);
const cap = (w: string) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w);

export const CASES = {
  upper: (t: string) => t.toUpperCase(),
  lower: (t: string) => t.toLowerCase(),
  title: (t: string) => t.toLowerCase().replace(/(^|[\s(\["“-])(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase()),
  sentence: (t: string) => t.toLowerCase().replace(/(^\s*|[.!?।]\s+|\n\s*)(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase()),
  camel: (t: string) => splitWords(t).map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join(''),
  pascal: (t: string) => splitWords(t).map(cap).join(''),
  snake: (t: string) => splitWords(t).map((w) => w.toLowerCase()).join('_'),
  kebab: (t: string) => splitWords(t).map((w) => w.toLowerCase()).join('-'),
  constant: (t: string) => splitWords(t).map((w) => w.toUpperCase()).join('_'),
} as const;
export type CaseId = keyof typeof CASES;

export function slugify(text: string): string {
  return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── Line clean-up ─────────────────────────────────────────────────────

const lines = (t: string) => t.split(/\r\n|\r|\n/);

export const CLEANUPS = {
  trim: (t: string) => lines(t).map((l) => l.trim()).join('\n'),
  collapseSpaces: (t: string) => lines(t).map((l) => l.replace(/[ \t]{2,}/g, ' ')).join('\n'),
  removeBlankLines: (t: string) => lines(t).filter((l) => l.trim() !== '').join('\n'),
  removeDuplicateLines: (t: string) => { const seen = new Set<string>(); return lines(t).filter((l) => (seen.has(l) ? false : (seen.add(l), true))).join('\n'); },
  sortAZ: (t: string) => lines(t).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })).join('\n'),
  sortZA: (t: string) => lines(t).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })).join('\n'),
  reverseLines: (t: string) => lines(t).reverse().join('\n'),
  numberLines: (t: string) => lines(t).map((l, i) => `${i + 1}. ${l}`).join('\n'),
} as const;
export type CleanupId = keyof typeof CLEANUPS;

// ── Find and replace ──────────────────────────────────────────────────

export interface ReplaceOptions { regex: boolean; caseSensitive: boolean }
export interface ReplaceResult { result: string; count: number; error?: string }

/** Rejects patterns that can freeze a tab through catastrophic backtracking, like (a+)+ . */
const RISKY_REGEX = /\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/;

export function findReplace(text: string, find: string, replacement: string, options: ReplaceOptions): ReplaceResult {
  if (!find) return { result: text, count: 0 };
  if (find.length > 200) return { result: text, count: 0, error: 'The search text is too long.' };
  try {
    if (options.regex && RISKY_REGEX.test(find)) return { result: text, count: 0, error: 'That pattern could freeze your browser (nested repeats). Simplify it.' };
    const source = options.regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(source, options.caseSensitive ? 'gu' : 'giu');
    let count = 0;
    // A function replacer keeps "$&"-style sequences in the replacement literal unless regex mode is on.
    const result = text.replace(re, (...args) => { count++; return options.regex ? expandReplacement(replacement, args) : replacement; });
    return { result, count };
  } catch (e) {
    return { result: text, count: 0, error: e instanceof SyntaxError ? 'That is not a valid pattern.' : 'Could not run that replacement.' };
  }
}

/** Supports $1..$9 and $& in regex mode, like String.replace. */
function expandReplacement(template: string, args: unknown[]): string {
  const match = String(args[0]);
  const groupCount = args.findIndex((a) => typeof a === 'number') - 1;
  return template.replace(/\$(\d|&|\$)/g, (_, token: string) => {
    if (token === '$') return '$';
    if (token === '&') return match;
    const i = Number(token);
    return i >= 1 && i <= groupCount ? String(args[i] ?? '') : `$${token}`;
  });
}
