/** Number formatting for India: lakh/crore grouping, rupee symbol, and amounts in words (for cheques and forms). */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrDecimals = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** ₹12,34,567 (whole rupees) or ₹12,34,567.50 when `decimals` is true. */
export function formatINR(value: number, decimals = false): string {
  if (!Number.isFinite(value)) return '—';
  return (decimals ? inrDecimals : inr).format(value);
}

/** 12,34,567.5 */
export function formatIN(value: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return maxFractionDigits === 2 ? plain.format(value) : new Intl.NumberFormat('en-IN', { maximumFractionDigits: maxFractionDigits }).format(value);
}

/** "12.5 lakh", "3.2 crore" for big rupee amounts; falls back to formatINR below a lakh. */
export function compactINR(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value); const sign = value < 0 ? '-' : '';
  const trim = (n: number) => String(Math.round(n * 100) / 100);
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7)} crore`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5)} lakh`;
  return formatINR(value);
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n / 100)]} Hundred`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '')); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}

/** Whole number in the Indian system: thousand, lakh, crore. Supports 0 to 99,999,99,99,999 (just under a lakh crore). */
export function integerToWordsIN(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 1e12) throw new RangeError('Number out of range');
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  const parts: string[] = [];
  if (crore) parts.push(`${integerToWordsIN(crore)} Crore`);
  if (lakh) parts.push(`${below1000(lakh)} Lakh`);
  if (thousand) parts.push(`${below1000(thousand)} Thousand`);
  if (rest) parts.push(below1000(rest));
  return parts.join(' ');
}

/** "One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Rupees and Fifty Paise Only". */
export function rupeesInWords(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError('Not a number');
  const negative = value < 0;
  const totalPaise = Math.round(Math.abs(value) * 100);
  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  if (rupees >= 1e12) throw new RangeError('Number out of range');
  let text = rupees === 0 && paise > 0 ? `${integerToWordsIN(paise)} Paise` : `${integerToWordsIN(rupees)} Rupee${rupees === 1 ? '' : 's'}`;
  if (paise && rupees > 0) text += ` and ${integerToWordsIN(paise)} Paise`;
  return `${negative ? 'Minus ' : ''}${text} Only`;
}

/** Round to paise without binary-float noise (1.005 -> 1.01). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
