/** GST maths in whole paise (integers), so totals always add up to the paisa. */

export type GstMode = 'add' | 'remove';

export interface GstInput {
  /** The amount you typed: the price before GST (mode "add") or the price that already includes GST (mode "remove"). */
  amount: number;
  /** GST rate in percent. */
  rate: number;
  mode: GstMode;
  /** Sale to another state: one IGST instead of CGST + SGST. */
  interstate?: boolean;
}

export interface GstResult {
  net: number;
  gst: number;
  gross: number;
  cgst: number;
  sgst: number;
  igst: number;
  rate: number;
}

/** Rates currently on offer in the UI. People can also type any other rate. */
export const COMMON_GST_RATES = [0, 3, 5, 12, 18, 28, 40] as const;

export function validateGst(i: GstInput): string | null {
  if (!Number.isFinite(i.amount) || i.amount < 0) return 'Enter an amount of zero or more.';
  if (i.amount > 1e11) return 'That amount is too large to calculate.';
  if (!Number.isFinite(i.rate) || i.rate < 0 || i.rate > 100) return 'GST rate must be between 0% and 100%.';
  return null;
}

export function calculateGst(input: GstInput): GstResult {
  const error = validateGst(input);
  if (error) throw new RangeError(error);
  const amountPaise = Math.round(input.amount * 100);
  let netPaise: number; let gstPaise: number;
  if (input.mode === 'add') {
    netPaise = amountPaise;
    gstPaise = Math.round((amountPaise * input.rate) / 100);
  } else {
    netPaise = Math.round((amountPaise * 100) / (100 + input.rate));
    gstPaise = amountPaise - netPaise;
  }
  const grossPaise = netPaise + gstPaise;
  const half = Math.floor(gstPaise / 2);
  return {
    net: netPaise / 100,
    gst: gstPaise / 100,
    gross: grossPaise / 100,
    cgst: input.interstate ? 0 : half / 100,
    sgst: input.interstate ? 0 : (gstPaise - half) / 100,
    igst: input.interstate ? gstPaise / 100 : 0,
    rate: input.rate,
  };
}
