/**
 * Password, passphrase and PIN generation with the browser's cryptographic random source, plus an honest strength
 * estimate. Everything runs on the device: nothing typed or generated here is ever sent anywhere.
 */

/** Returns a uniformly random integer in [0, maxExclusive). Injected so tests can be deterministic. */
export type RandomInt = (maxExclusive: number) => number;

/** Uniform without modulo bias (rejection sampling over 32-bit values). */
export const cryptoRandomInt: RandomInt = (max) => {
  if (!Number.isInteger(max) || max < 1 || max > 2 ** 32) throw new RangeError('max out of range');
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
export const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';
const AMBIGUOUS = new Set('Il1O0o|`\'"'.split(''));

export interface PasswordOptions { length: number; lower: boolean; upper: boolean; digits: boolean; symbols: boolean; excludeAmbiguous: boolean }

export const PASSWORD_LIMITS = { min: 8, max: 128 } as const;

function pools(o: PasswordOptions): string[] {
  const strip = (s: string) => (o.excludeAmbiguous ? [...s].filter((c) => !AMBIGUOUS.has(c)).join('') : s);
  return [o.lower && strip(LOWER), o.upper && strip(UPPER), o.digits && strip(DIGITS), o.symbols && strip(SYMBOLS)].filter((p): p is string => Boolean(p));
}

export function validatePassword(o: PasswordOptions): string | null {
  if (!Number.isInteger(o.length) || o.length < PASSWORD_LIMITS.min || o.length > PASSWORD_LIMITS.max) return `Length must be between ${PASSWORD_LIMITS.min} and ${PASSWORD_LIMITS.max}.`;
  if (pools(o).length === 0) return 'Choose at least one type of character.';
  if (pools(o).length > o.length) return 'Length is too short for the selected character types.';
  return null;
}

function shuffle<T>(items: T[], rand: RandomInt): T[] {
  for (let i = items.length - 1; i > 0; i--) { const j = rand(i + 1); [items[i], items[j]] = [items[j], items[i]]; }
  return items;
}

/** Guarantees at least one character of every selected type, then fills the rest from the combined pool and shuffles. */
export function generatePassword(o: PasswordOptions, rand: RandomInt = cryptoRandomInt): string {
  const error = validatePassword(o);
  if (error) throw new RangeError(error);
  const sets = pools(o);
  const all = sets.join('');
  const chars = sets.map((s) => s[rand(s.length)]);
  while (chars.length < o.length) chars.push(all[rand(all.length)]);
  return shuffle(chars, rand).join('');
}

export function generatePin(length: number, rand: RandomInt = cryptoRandomInt): string {
  if (!Number.isInteger(length) || length < 4 || length > 12) throw new RangeError('PIN length must be between 4 and 12.');
  return Array.from({ length }, () => String(rand(10))).join('');
}

/** 300 short, common, easy-to-type words (about 8.2 bits each). */
export const WORDLIST: readonly string[] = ('apple arrow autumn bamboo banana basket beach bench berry bicycle bird blanket blossom bottle branch bread bridge bright brook bubble butter cabin cactus camel candle canyon carpet castle cedar cherry circle cliff clock cloud clover coast cobalt copper coral cotton cousin cradle crystal curtain daisy dancer desert diamond dinner dolphin dragon dream drift eagle earth ember engine falcon feather fennel ferry field finch flame flute forest fossil fountain galaxy garden garlic ginger glacier glitter golden granite grape gravel guitar harbor harvest hazel helmet heron hollow honey horizon island ivory jacket jasmine jungle kettle kitten ladder lagoon lantern lemon lilac linen lizard magnet mango maple marble meadow melody mirror monkey moss mountain muffin nectar needle nickel noodle oasis ocean olive onion orange orchid otter paddle palace panda pantry parrot pebble pepper piano pillow pioneer planet plum pocket pond poppy prairie pumpkin puzzle quartz rabbit radish rainbow raven ribbon river rocket saddle saffron sailor salmon sandal season shadow silver sketch slate sleigh spark sparrow spice spiral spring squirrel stable sunrise sunset swallow table temple thunder tiger timber tomato tower trail tulip tunnel turtle umbrella valley velvet village violet voyage walnut water whale willow window winter wizard wonder yellow zebra zephyr anchor beacon cattle comet compass cricket cuckoo dagger desk dune echo elbow elm empire fabric fable fern firefly flint frost gadget gem glove goblet grove gust hammer hawk hill hunter igloo jewel kayak kernel kite knight lava lotus lunar mason mist nest noble north novel nutmeg opal orbit oyster pearl pilot plaza pulse quill radar reef ridge robin rust sage satin scarf scout shell shore sierra smoke solar spruce stone storm summit tango thistle topaz trout twig vapor vessel vista wagon wheat whisper wolf yarn zinc').split(' ');

export interface PassphraseOptions { words: number; separator: string; capitalize: boolean; addNumber: boolean }

export function generatePassphrase(o: PassphraseOptions, rand: RandomInt = cryptoRandomInt): string {
  if (!Number.isInteger(o.words) || o.words < 3 || o.words > 12) throw new RangeError('Use between 3 and 12 words.');
  if (o.separator.length > 3) throw new RangeError('Separator is too long.');
  const picked = Array.from({ length: o.words }, () => WORDLIST[rand(WORDLIST.length)]).map((w) => (o.capitalize ? w[0].toUpperCase() + w.slice(1) : w));
  if (o.addNumber) picked.push(String(rand(100)).padStart(2, '0'));
  return picked.join(o.separator);
}

export const passphraseBits = (words: number, addNumber: boolean) => words * Math.log2(WORDLIST.length) + (addNumber ? Math.log2(100) : 0);
export const passwordBits = (o: PasswordOptions) => o.length * Math.log2(pools(o).join('').length);

// ── Strength estimate for something the user typed ───────────────────

const COMMON = new Set(['password', 'passw0rd', 'p@ssw0rd', '123456', '1234567', '12345678', '123456789', '1234567890', '111111', '000000', '123123', 'qwerty', 'qwerty123', 'qwertyuiop', 'abc123', 'letmein', 'welcome', 'admin', 'admin123', 'login', 'iloveyou', 'monkey', 'dragon', 'master', 'sunshine', 'princess', 'football', 'cricket', 'india123', 'india@123', 'krishna', 'shiva', 'ganesh', 'jaishreeram', 'iloveindia', 'password1', 'password123', 'welcome123', 'test123', 'changeme', 'guest', 'user', 'root', 'secret', 'googledotcom', 'whatever', 'trustno1', 'superman', 'batman', 'qazwsx', 'zaq12wsx', 'asdfgh', 'asdfghjkl', 'zxcvbnm', '987654321', '654321', '147258369', '9999999999']);
const KEYBOARD_RUNS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', 'qazwsx', '1qaz2wsx'];

export interface Strength { bits: number; score: 0 | 1 | 2 | 3 | 4; label: 'Very weak' | 'Weak' | 'Okay' | 'Strong' | 'Very strong'; hints: string[] }

export function estimateStrength(password: string): Strength {
  const hints: string[] = [];
  if (!password) return { bits: 0, score: 0, label: 'Very weak', hints: ['Type a password to check it.'] };
  const lower = password.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9@]+$/g, '').replace(/\d+$/, '');
  if (COMMON.has(lower) || COMMON.has(stripped)) return { bits: Math.min(10, password.length), score: 0, label: 'Very weak', hints: ['This is one of the most commonly used passwords: attackers try it first.'] };

  const chars = [...password];
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;
  if (/[^\x00-\x7f]/.test(password)) pool += 60;

  // Repeated characters and simple runs (abc, 321) add little.
  let effective = new Set(chars).size + (chars.length - new Set(chars).size) * 0.3;
  let run = 1; let runChars = 0;
  for (let i = 1; i < chars.length; i++) {
    const diff = chars[i].charCodeAt(0) - chars[i - 1].charCodeAt(0);
    if (Math.abs(diff) === 1) { run++; if (run === 3) runChars += 3; else if (run > 3) runChars++; } else run = 1;
  }
  if (runChars > 0) { effective -= runChars * 0.7; hints.push('Avoid runs like "abc" or "123".'); }
  if (chars.length - new Set(chars).size > chars.length / 2) hints.push('Too many repeated characters.');

  let bits = Math.max(effective, 0) * Math.log2(Math.max(pool, 2));
  if (KEYBOARD_RUNS.some((k) => { for (let i = 0; i + 4 <= k.length; i++) { const part = k.slice(i, i + 4); if (lower.includes(part) || lower.includes([...part].reverse().join(''))) return true; } return false; })) { bits -= 14; hints.push('Keyboard patterns like "qwer" are guessed quickly.'); }
  if (/(19|20)\d{2}$/.test(password)) { bits -= 6; hints.push('A year at the end is a common pattern.'); }
  if (WORDLIST.some((w) => w.length >= 5 && lower === w)) { bits = Math.min(bits, 20); hints.push('A single dictionary word is easy to guess.'); }
  if (password.length < 12) hints.push('Longer is stronger: aim for 12+ characters or a passphrase of 5+ words.');
  if (pool <= 26) hints.push('Mix in capital letters, digits or symbols, or simply make it longer.');
  bits = Math.max(0, Math.round(bits * 10) / 10);

  const score = bits < 28 ? 0 : bits < 36 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  return { bits, score, label: (['Very weak', 'Weak', 'Okay', 'Strong', 'Very strong'] as const)[score], hints: [...new Set(hints)] };
}

/** Rough time for an attacker making 10 billion guesses a second (an offline attack on a fast hash). */
export function crackTime(bits: number): string {
  const seconds = Math.pow(2, bits) / 2 / 1e10;
  if (seconds < 1) return 'instantly';
  const units: Array<[string, number]> = [['second', 1], ['minute', 60], ['hour', 3600], ['day', 86400], ['year', 31_557_600], ['thousand years', 3.15576e10], ['million years', 3.15576e13], ['billion years', 3.15576e16]];
  let chosen = units[0];
  for (const unit of units) if (seconds >= unit[1]) chosen = unit;
  const value = seconds / chosen[1];
  if (chosen[0] === 'billion years' && value > 1000) return 'longer than the age of the universe';
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${chosen[0]}${chosen[0].endsWith('s') || rounded === 1 ? '' : 's'}`;
}
