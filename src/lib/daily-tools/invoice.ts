/**
 * GST invoice maths and validation. Everything is computed in whole paise (integers), per line like a real GST
 * invoice, so totals always add up to the paisa and match what a GST portal would compute.
 */

export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat', '26': 'Dadra & Nagar Haveli and Daman & Diu', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory',
};

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** The 15th GSTIN character is a check digit over the first 14 (mod-36 algorithm). */
export function gstinCheckChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = GSTIN_CHARS.indexOf(first14[i]);
    if (v < 0) return '';
    const product = v * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36];
}

export type GstinResult = { ok: true; stateCode: string; state: string } | { ok: false; error: string };

export function validateGstin(input: string): GstinResult {
  const g = input.trim().toUpperCase();
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return { ok: false, error: 'A GSTIN is 15 characters, like 27AAPFU0939F1ZV.' };
  const state = STATE_CODES[g.slice(0, 2)];
  if (!state) return { ok: false, error: `The first two digits (${g.slice(0, 2)}) are not a valid state code.` };
  if (gstinCheckChar(g.slice(0, 14)) !== g[14]) return { ok: false, error: 'The last character does not match: check the GSTIN for a typing mistake.' };
  return { ok: true, stateCode: g.slice(0, 2), state };
}

export interface InvoiceItem { description: string; hsn: string; qty: number; rate: number; discountPct: number; gstRate: number }
export type Supply = 'intra' | 'inter' | 'none';

export interface LineTotals { amount: number; discount: number; taxable: number; gst: number; total: number }
export interface TaxRow { rate: number; taxable: number; cgst: number; sgst: number; igst: number }
export interface InvoiceTotals {
  lines: LineTotals[]; subtotal: number; discount: number; taxable: number; cgst: number; sgst: number; igst: number; gst: number;
  beforeRound: number; roundOff: number; grand: number; taxRows: TaxRow[];
}

export const LIMITS = { maxItems: 50 } as const;

export function validateItem(i: InvoiceItem, n: number): string | null {
  const row = `Item ${n}`;
  if (!i.description.trim()) return `${row}: add a description.`;
  if (!Number.isFinite(i.qty) || i.qty <= 0 || i.qty > 1e6 || Math.round(i.qty * 1000) / 1000 !== i.qty) return `${row}: quantity must be above 0 (up to 3 decimals).`;
  if (!Number.isFinite(i.rate) || i.rate < 0 || i.rate > 1e9) return `${row}: enter the rate (price per unit).`;
  if (!Number.isFinite(i.discountPct) || i.discountPct < 0 || i.discountPct > 100) return `${row}: discount must be between 0% and 100%.`;
  if (!Number.isFinite(i.gstRate) || i.gstRate < 0 || i.gstRate > 100) return `${row}: GST rate must be between 0% and 100%.`;
  if (i.hsn && !/^\d{4,8}$/.test(i.hsn.trim())) return `${row}: HSN/SAC is 4 to 8 digits (or leave it empty).`;
  return null;
}

const paise = (rupees: number) => Math.round(rupees * 100);

export function calculateInvoice(items: InvoiceItem[], supply: Supply, roundOff: boolean): InvoiceTotals {
  if (items.length === 0 || items.length > LIMITS.maxItems) throw new RangeError(`Add between 1 and ${LIMITS.maxItems} items.`);
  items.forEach((it, i) => { const e = validateItem(it, i + 1); if (e) throw new RangeError(e); });
  const lines: LineTotals[] = []; const byRate = new Map<number, TaxRow>();
  let cgst = 0, sgst = 0, igst = 0;
  for (const it of items) {
    const amount = Math.round(it.qty * paise(it.rate));
    const discount = Math.round((amount * it.discountPct) / 100);
    const taxable = amount - discount;
    const rate = supply === 'none' ? 0 : it.gstRate;
    // Within a state, CGST and SGST are always EQUAL (each at half the rate, rounded to the paisa); between states it is one IGST.
    const half = Math.round((taxable * rate) / 200);
    const c = supply === 'intra' ? half : 0, s = supply === 'intra' ? half : 0, g = supply === 'inter' ? Math.round((taxable * rate) / 100) : 0;
    const gst = c + s + g;
    cgst += c; sgst += s; igst += g;
    lines.push({ amount, discount, taxable, gst, total: taxable + gst });
    const row = byRate.get(rate) ?? { rate, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    row.taxable += taxable; row.cgst += c; row.sgst += s; row.igst += g; byRate.set(rate, row);
  }
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const discount = lines.reduce((a, l) => a + l.discount, 0);
  const taxable = lines.reduce((a, l) => a + l.taxable, 0);
  const gst = cgst + sgst + igst;
  const beforeRound = taxable + gst;
  const grand = roundOff ? Math.round(beforeRound / 100) * 100 : beforeRound;
  const to = (n: number) => n / 100;
  return {
    lines: lines.map((l) => ({ amount: to(l.amount), discount: to(l.discount), taxable: to(l.taxable), gst: to(l.gst), total: to(l.total) })),
    subtotal: to(subtotal), discount: to(discount), taxable: to(taxable), cgst: to(cgst), sgst: to(sgst), igst: to(igst), gst: to(gst),
    beforeRound: to(beforeRound), roundOff: to(grand - beforeRound), grand: to(grand),
    taxRows: [...byRate.values()].sort((a, b) => a.rate - b.rate).map((r) => ({ rate: r.rate, taxable: to(r.taxable), cgst: to(r.cgst), sgst: to(r.sgst), igst: to(r.igst) })),
  };
}

/** Same state -> CGST + SGST; different state -> IGST. State codes come from the GSTIN or the chosen state. */
export function supplyType(sellerStateCode: string, buyerStateCode: string): Supply {
  if (!sellerStateCode || !buyerStateCode) return 'intra';
  return sellerStateCode === buyerStateCode ? 'intra' : 'inter';
}

export const isInvoiceNo = (s: string) => /^[A-Za-z0-9][A-Za-z0-9/_\-.]{0,15}$/.test(s.trim());
