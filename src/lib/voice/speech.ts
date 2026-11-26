/**
 * Pure helpers for voice input (speech to text) and read-aloud (text to speech). No DOM, no browser APIs, so every rule
 * here is unit-tested in Node. The browser glue lives in components/chat/use-voice-input.ts and use-read-aloud.ts.
 */

export interface VoiceLanguage { code: string; label: string; short: string }

/** Languages the browser's speech recognition commonly supports for India. */
export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: 'en-IN', label: 'English (India)', short: 'EN' },
  { code: 'hi-IN', label: 'Hindi · हिन्दी', short: 'HI' },
  { code: 'en-US', label: 'English (US)', short: 'US' },
  { code: 'en-GB', label: 'English (UK)', short: 'UK' },
  { code: 'mr-IN', label: 'Marathi · मराठी', short: 'MR' },
  { code: 'gu-IN', label: 'Gujarati · ગુજરાતી', short: 'GU' },
  { code: 'bn-IN', label: 'Bengali · বাংলা', short: 'BN' },
  { code: 'ta-IN', label: 'Tamil · தமிழ்', short: 'TA' },
  { code: 'te-IN', label: 'Telugu · తెలుగు', short: 'TE' },
  { code: 'kn-IN', label: 'Kannada · ಕನ್ನಡ', short: 'KN' },
  { code: 'ml-IN', label: 'Malayalam · മലയാളം', short: 'ML' },
  { code: 'pa-IN', label: 'Punjabi · ਪੰਜਾਬੀ', short: 'PA' },
  { code: 'ur-IN', label: 'Urdu · اردو', short: 'UR' },
];

export const DEFAULT_VOICE_LANG = 'en-IN';
export const isVoiceLang = (code: unknown): code is string => typeof code === 'string' && VOICE_LANGUAGES.some((l) => l.code === code);
export const voiceLanguage = (code: string): VoiceLanguage => VOICE_LANGUAGES.find((l) => l.code === code) ?? VOICE_LANGUAGES[0];

// ── preferences ──────────────────────────────────────────────────────

export interface VoicePrefs { lang: string; /** Send the message as soon as dictation stops. */ autoSend: boolean; /** Read each answer aloud when it arrives. */ speakReplies: boolean }
export const DEFAULT_VOICE_PREFS: VoicePrefs = { lang: DEFAULT_VOICE_LANG, autoSend: false, speakReplies: false };

/** Reads stored preferences defensively: unknown or damaged values fall back to the defaults. */
export function parseVoicePrefs(raw: unknown): VoicePrefs {
  let value: unknown = raw;
  if (typeof raw === 'string') { try { value = JSON.parse(raw); } catch { return { ...DEFAULT_VOICE_PREFS }; } }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_VOICE_PREFS };
  const o = value as Record<string, unknown>;
  return { lang: isVoiceLang(o.lang) ? o.lang : DEFAULT_VOICE_LANG, autoSend: o.autoSend === true, speakReplies: o.speakReplies === true };
}

// ── what people said ─────────────────────────────────────────────────

/** Joins pieces of speech with single spaces and no stray whitespace. */
export function joinSpeech(...parts: Array<string | null | undefined>): string {
  return parts.map((p) => (p ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ');
}

/** Puts spoken text after what is already typed, with the right spacing, and a capital letter when it starts a sentence. */
export function mergeIntoDraft(draft: string, spoken: string): string {
  const said = joinSpeech(spoken);
  if (!said) return draft;
  if (!draft.trim()) return /^[a-z]/.test(said) ? said[0].toUpperCase() + said.slice(1) : said;
  const needsSpace = !/\s$/.test(draft);
  return `${draft}${needsSpace ? ' ' : ''}${said}`;
}

/** The shape of the browser's SpeechRecognition results, reduced to what we read. */
export interface SpeechResultLike { isFinal: boolean; 0: { transcript: string } }

/**
 * Rebuilds the finished and the still-changing parts from the WHOLE result list, not just the new ones: some browsers
 * (Chrome on Android) repeat earlier results in each event, so adding up only the new part would double the words.
 */
export function readResults(results: ArrayLike<SpeechResultLike>): { final: string; interim: string } {
  const finals: string[] = []; const interims: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i]; const t = r?.[0]?.transcript ?? '';
    (r?.isFinal ? finals : interims).push(t);
  }
  return { final: joinSpeech(...finals), interim: joinSpeech(...interims) };
}

export type SpeechErrorCode = 'denied' | 'no-mic' | 'network' | 'no-speech' | 'language' | 'unsupported' | 'busy' | 'unknown';

/** Maps the browser's error names to one of our codes. */
export function classifySpeechError(name: string | undefined | null): SpeechErrorCode {
  switch (name) {
    case 'not-allowed': case 'service-not-allowed': case 'NotAllowedError': case 'SecurityError': return 'denied';
    case 'audio-capture': case 'NotFoundError': case 'DevicesNotFoundError': return 'no-mic';
    case 'network': return 'network';
    case 'no-speech': return 'no-speech';
    case 'language-not-supported': return 'language';
    case 'NotReadableError': case 'TrackStartError': return 'busy';
    default: return 'unknown';
  }
}

export function speechErrorMessage(code: SpeechErrorCode): string {
  switch (code) {
    case 'denied': return 'Microphone access is blocked. Allow the microphone for this site in your browser settings (the lock icon in the address bar), then try again.';
    case 'no-mic': return 'No microphone was found. Plug one in or check your device settings.';
    case 'busy': return 'The microphone is being used by another app. Close it and try again.';
    case 'network': return 'Voice typing needs an internet connection. Check your connection and try again.';
    case 'no-speech': return 'I did not hear anything. Speak a little closer to the microphone and try again.';
    case 'language': return 'This browser cannot recognise that language. Pick another one from the list.';
    case 'unsupported': return 'Voice typing works in Chrome, Edge and Safari. This browser does not support it.';
    default: return 'Voice typing stopped unexpectedly. Please try again.';
  }
}

/** 0..1 loudness from time-domain audio bytes (128 = silence), scaled so normal speech fills most of the range. */
export function levelFromBytes(samples: ArrayLike<number>): number {
  const n = samples.length;
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) { const v = (samples[i] - 128) / 128; sum += v * v; }
  const rms = Math.sqrt(sum / n);
  return Math.max(0, Math.min(1, rms * 3.2));
}

/** m:ss for the recording clock. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── read aloud ───────────────────────────────────────────────────────

const SCRIPTS: Array<[RegExp, string]> = [
  [/[ऀ-ॿ]/g, 'hi-IN'], [/[஀-௿]/g, 'ta-IN'], [/[ఀ-౿]/g, 'te-IN'], [/[ঀ-৿]/g, 'bn-IN'],
  [/[઀-૿]/g, 'gu-IN'], [/[ಀ-೿]/g, 'kn-IN'], [/[ഀ-ൿ]/g, 'ml-IN'], [/[਀-੿]/g, 'pa-IN'], [/[؀-ۿ]/g, 'ur-IN'],
];

/** Picks the speaking language from the writing system of the text; Latin letters mean English (India). */
export function detectSpeechLang(text: string): string {
  let best = 'en-IN'; let most = 0;
  for (const [re, lang] of SCRIPTS) { const n = (text.match(re) ?? []).length; if (n > most) { most = n; best = lang; } }
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return most > 0 && most >= latin * 0.25 ? best : 'en-IN';
}

/** Turns a Markdown answer into text that sounds right when spoken: no symbols, no code, no link addresses. */
export function speechPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' (code omitted) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' link ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/gm, '')
    .replace(/\|/g, ', ')
    .replace(/[*_~]{1,3}([^*_~\n]+)[*_~]{1,3}/g, '$1')
    .replace(/[<>#*_~=^]/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s*\n\s*/g, '. ')
    .replace(/\.(\s*\.)+/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits text into sentence-sized pieces, because speech engines cut off or stall on very long utterances. */
export function chunkForSpeech(text: string, max = 190): string[] {
  const sentences = text.match(/[^.!?।۔\n]+[.!?।۔]*/g) ?? [text];
  const out: string[] = []; let cur = '';
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  for (const raw of sentences) {
    let s = raw.trim(); if (!s) continue;
    while (s.length > max) {
      let cut = s.lastIndexOf(' ', max); if (cut < max * 0.5) cut = max;
      if ((cur + ' ' + s.slice(0, cut)).trim().length > max) push();
      cur = `${cur} ${s.slice(0, cut)}`.trim(); push(); s = s.slice(cut).trim();
    }
    if (cur && (cur + ' ' + s).length > max) push();
    cur = cur ? `${cur} ${s}` : s;
  }
  push();
  return out;
}
