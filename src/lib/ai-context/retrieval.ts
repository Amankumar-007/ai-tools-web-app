/**
 * Picks which parts of the user's documents to send with a request.
 *
 * Short documents go in whole. When the total is over budget, each document
 * gets a fair share and we keep its opening plus the passages that best match
 * the question (or an even spread when the question gives nothing to match, such
 * as "summarize this"). Kept passages stay in reading order.
 */

import type { ContextDocument } from './types';

export type SourceDocument = { id: string; name: string; text: string; pages?: number };

const CHUNK_TARGET = 1_800;
const MIN_SHARE = 4_000;
const GAP_MARKER = '\n[…]\n';

const STOP_WORDS = new Set(
  ('the and for are but not you your with this that have from what when where which who whom how why was were been ' +
    'will would could should can does did has had its into about than then them they their there these those over ' +
    'some any all out our also just like make please tell show give need want explain describe summarize summary ' +
    'document file pdf attached above below page pages section')
    .split(' ')
);

function terms(text: string): string[] {
  const out: string[] = [];
  for (const match of text.toLowerCase().matchAll(/[\p{L}\p{N}]{3,}/gu)) {
    if (!STOP_WORDS.has(match[0])) out.push(match[0]);
  }
  return out;
}

/** Split into chunks of about CHUNK_TARGET characters, preferring paragraph / line breaks. */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + CHUNK_TARGET);
    if (end < text.length) {
      const window = text.slice(start + CHUNK_TARGET * 0.6, end);
      const para = window.lastIndexOf('\n\n');
      const line = window.lastIndexOf('\n');
      const sentence = window.lastIndexOf('. ');
      const cut = para >= 0 ? para + 2 : line >= 0 ? line + 1 : sentence >= 0 ? sentence + 2 : -1;
      if (cut >= 0) end = start + Math.floor(CHUNK_TARGET * 0.6) + cut;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

/** Split `budget` across documents: short ones keep their full length, the rest share what is left. */
function allocate(lengths: number[], budget: number): number[] {
  const shares = lengths.map(() => 0);
  let remaining = budget;
  let open = lengths.map((_, i) => i);
  while (open.length > 0) {
    const fair = Math.max(MIN_SHARE, Math.floor(remaining / open.length));
    const fits = open.filter((i) => lengths[i] <= fair);
    if (fits.length === 0) {
      for (const i of open) shares[i] = fair;
      break;
    }
    for (const i of fits) {
      shares[i] = lengths[i];
      remaining -= lengths[i];
    }
    open = open.filter((i) => !fits.includes(i));
  }
  return shares;
}

function pickPassages(text: string, allowance: number, queryTerms: string[]): string {
  const chunks = chunkText(text);
  const chosen = new Set<number>([0]);
  let used = chunks[0].length;

  // Document frequency per term, so rare words count for more.
  const chunkTerms = chunks.map((chunk) => terms(chunk));
  const df = new Map<string, number>();
  for (const list of chunkTerms) for (const term of new Set(list)) df.set(term, (df.get(term) ?? 0) + 1);

  const wanted = [...new Set(queryTerms)];
  const scores = chunkTerms.map((list) => {
    if (wanted.length === 0) return 0;
    const counts = new Map<string, number>();
    for (const term of list) counts.set(term, (counts.get(term) ?? 0) + 1);
    let score = 0;
    for (const term of wanted) {
      const tf = counts.get(term);
      if (tf) score += (1 + Math.log(tf)) * Math.log(1 + chunks.length / (df.get(term) ?? 1));
    }
    return score;
  });

  const hasMatch = scores.some((score) => score > 0);
  let order: number[];
  if (hasMatch) {
    order = chunks.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b);
  } else {
    // Nothing to match (e.g. "summarize this"): sample evenly across the document.
    const rest = chunks.length - 1;
    const slots = Math.max(1, Math.floor((allowance - used) / CHUNK_TARGET));
    const spread = Array.from({ length: Math.min(slots, rest) }, (_, j) => 1 + Math.floor(((j + 0.5) * rest) / Math.min(slots, rest)));
    order = [...spread, ...Array.from({ length: rest }, (_, k) => k + 1)];
  }

  for (const index of order) {
    if (chosen.has(index) || (hasMatch && scores[index] <= 0)) continue;
    if (used + chunks[index].length > allowance) continue;
    chosen.add(index);
    used += chunks[index].length;
  }

  const sorted = [...chosen].sort((a, b) => a - b);
  let out = '';
  sorted.forEach((index, i) => {
    out += (i > 0 && index !== sorted[i - 1] + 1 ? GAP_MARKER : '') + chunks[index];
  });
  return out;
}

export function selectExcerpts(docs: SourceDocument[], query: string, budget: number): ContextDocument[] {
  const usable = docs.filter((doc) => doc.text.trim().length > 0);
  if (usable.length === 0) return [];

  const shares = allocate(usable.map((doc) => doc.text.length), budget);
  const queryTerms = terms(query);

  return usable.map((doc, i) => {
    const full = shares[i] >= doc.text.length;
    return {
      id: doc.id,
      name: doc.name,
      excerpt: full ? doc.text : pickPassages(doc.text, shares[i], queryTerms),
      totalChars: doc.text.length,
      pages: doc.pages,
      partial: !full,
    };
  });
}
