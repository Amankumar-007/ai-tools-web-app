/**
 * Text heuristics shared by the browser (deciding what to send) and the server
 * (deciding which model should answer). Pure functions, no I/O.
 */

import type { TaskType } from './types';

/** The message refers to a picture the user shared ("in this image", "the screenshot"…). */
const IMAGE_REFERENCE =
  /\b(image|images|photo|photos|picture|pictures|pic|screenshot|screen shot|diagram|chart|graph|logo|figure|scan|scanned|handwriting|handwritten|this page|that page|this slide|ocr)\b/i;

export function mentionsImage(text: string): boolean {
  return IMAGE_REFERENCE.test(text);
}

const CODE_FENCE = /```/;
const CODE_FILE = /\.(?:js|jsx|ts|tsx|py|java|c|cpp|cs|go|rs|rb|php|sql|sh|swift|kt|html|css|scss|json|ya?ml)\b/i;
const CODE_WORDS =
  /\b(?:code|coding|debug|debugging|bug|bugs|stack ?trace|exception|compile[dr]?|refactor|regex|typescript|javascript|python|java|golang|rust|sql|react|next\.?js|node\.?js|function|functions|syntax|unit tests?|algorithm|endpoint|docker|npm|css|html|snippet|api|git|variable|loop|array|database|schema)\b|c\+\+|c#/i;
const CODE_EXTENSIONS = /\.(?:js|jsx|ts|tsx|py|java|c|cpp|cs|go|rs|rb|php|sql|sh|swift|kt)$/i;

const REASONING =
  /\b(?:step[- ]by[- ]step|prove|proof|derive|derivation|solve|calculate|compute|equation|probability|theorem|logic|logical|puzzle|riddle|reasoning|trade-?offs?|pros and cons|compare|comparison|analy[sz]e|analysis|evaluate|strategy|optimi[sz]e|why (?:does|do|is|are|did)|how many|estimate|math|maths|mathematical|integral|derivative)\b/i;
const MATH_EXPRESSION = /\d\s*[+\-*/^=×÷]\s*\d/;

const WRITING =
  /\b(?:translate|translation|rewrite|rephrase|paraphrase|proofread|grammar|edit this|improve (?:this|my)|email|cover letter|essay|blog|caption|tweet|linkedin|story|poem|tone|summari[sz]e|summary|draft)\b/i;

export type TaskSignals = {
  /** Text of the message being answered. */
  text: string;
  /** True when at least one image will be sent as pixels with this request. */
  hasPixelImages: boolean;
  /** Names of documents attached to the conversation. */
  documentNames: string[];
};

/**
 * Decide what the user is trying to do. Precedence is deliberate:
 * seeing an image beats everything (only some models can), then code, then
 * "answer from my documents", then reasoning / writing, then short chit-chat.
 */
export function detectTask({ text, hasPixelImages, documentNames }: TaskSignals): TaskType {
  const t = text || '';
  if (hasPixelImages) return 'vision';

  const asksForCode =
    CODE_FENCE.test(t) || CODE_FILE.test(t) || CODE_WORDS.test(t) || documentNames.some((name) => CODE_EXTENSIONS.test(name));
  if (asksForCode) return 'code';

  if (documentNames.length > 0) return 'document';

  if (REASONING.test(t) || MATH_EXPRESSION.test(t) || (t.length > 600 && t.includes('?'))) return 'reasoning';
  if (WRITING.test(t)) return 'writing';
  if (t.trim().length <= 60) return 'quick';
  return 'general';
}

// ---- Asking for a picture to be created ("generate an image of ...") ----

export type ImageAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3';

const IMAGE_NOUN =
  '(?:image|picture|photo|photograph|illustration|logo|poster|wallpaper|artwork|drawing|painting|icon|banner|thumbnail|sticker|avatar|portrait|sketch|cartoon|mockup)';
// "make an image gallery component" is a coding request, not a picture request.
const NOT_A_PICTURE =
  '(?!\\s+(?:converter|component|gallery|slider|upload|uploader|processing|compressor|optimi[sz]er|resiz\\w*|tag|element|file|format|url|path|hook|loader|library|carousel|viewer|crop\\w*|editor|dataset|classifier|recognition|pipeline|sizes?|dimensions|guide|tips|ideas|resolution)\\b)';
const POLITE = "(?:(?:please|pls|can you|could you|would you|will you|i want you to|i need you to|i want|i need|i'd like|i\u2019d like)\\s+)*";
const MAKE_PICTURE = new RegExp(
  `^${POLITE}(?:generate|create|make|draw|design|paint|produce|render|show me|give me)\\s+(?:me\\s+)?(?:(?:an?|the|some|one)\\s+)?(?<desc>(?:[\\w:'-]+\\s+){0,3}?)${IMAGE_NOUN}s?\\b${NOT_A_PICTURE}`,
  'i'
);
const WANT_PICTURE = new RegExp(
  `^(?:i want|i need|i'd like|i\u2019d like)\\s+(?:an?|the|some|one)\\s+(?<desc>(?:[\\w:'-]+\\s+){0,3}?)${IMAGE_NOUN}s?\\b${NOT_A_PICTURE}`,
  'i'
);
const DRAW_SOMETHING = new RegExp(
  `^${POLITE}(?:draw|paint|sketch|imagine)\\s+(?:me\\s+)?(?:an?|the)\\s+(?!(?:table|diagram|chart|graph|flowchart|schema|conclusion|comparison|timeline)\\b)\\S`,
  'i'
);

/** Pick a canvas shape from what the request is for ("phone wallpaper" is tall, "banner" is wide). */
export function pickAspectRatio(text: string): ImageAspectRatio {
  const explicit = text.match(/\b(16:9|9:16|4:3|3:4|3:2|2:3|1:1)\b/);
  if (explicit) return explicit[1] as ImageAspectRatio;
  if (/\b(?:story|stories|reel|reels|shorts|tiktok|phone wallpaper|mobile wallpaper|vertical)\b/i.test(text)) return '9:16';
  if (/\b(?:poster|flyer|book cover|portrait orientation)\b/i.test(text)) return '2:3';
  if (/\b(?:youtube thumbnail|banner|cover photo|desktop wallpaper|wallpaper|landscape|widescreen|header image|presentation|slide)\b/i.test(text)) return '16:9';
  return '1:1';
}

/**
 * Does this message ask for a picture to be created? Deliberately conservative: coding requests
 * ("write a function that returns an image") and anything with code in it go to the normal chat model.
 */
export function detectImageRequest(text: string): { prompt: string; aspectRatio: ImageAspectRatio } | null {
  const t = (text || '').trim();
  if (t.length < 8 || t.length > 2000) return null;
  if (CODE_FENCE.test(t)) return null;
  if (!DRAW_SOMETHING.test(t)) {
    const head = t.match(MAKE_PICTURE) || t.match(WANT_PICTURE);
    if (!head) return null;
    // "Generate an image of" with nothing described asks for nothing: let the chat model ask what is wanted.
    const described = (head.groups?.desc || '') + t.slice(head[0].length).replace(/^\s*(?:of|for|showing|with|about)\b/i, '');
    if (described.replace(/[^\p{L}\p{N}]/gu, '').length < 3) return null;
  }
  return { prompt: t, aspectRatio: pickAspectRatio(t) };
}
