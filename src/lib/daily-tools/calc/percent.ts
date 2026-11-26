/** Percentage, change, discount and margin helpers. Each returns the answer AND the working, so the UI can show its steps. */

export interface Worked { value: number; working: string }

const fmt = (n: number) => String(Math.round(n * 1e6) / 1e6);

export const percentOf = (percent: number, of: number): Worked => ({ value: (percent / 100) * of, working: `${fmt(percent)}% of ${fmt(of)} = ${fmt(percent)} ÷ 100 × ${fmt(of)}` });

export function whatPercent(part: number, whole: number): Worked | null {
  if (whole === 0) return null;
  return { value: (part / whole) * 100, working: `${fmt(part)} ÷ ${fmt(whole)} × 100` };
}

/** Percentage increase (positive) or decrease (negative) from `from` to `to`. */
export function percentChange(from: number, to: number): Worked | null {
  if (from === 0) return null;
  return { value: ((to - from) / Math.abs(from)) * 100, working: `(${fmt(to)} − ${fmt(from)}) ÷ ${fmt(Math.abs(from))} × 100` };
}

export interface DiscountResult { finalPrice: number; saved: number; effectivePct: number; steps: string[] }

/** One or two successive discounts (e.g. 20% off, then an extra 10% coupon). The second applies to the already-reduced price. */
export function discount(price: number, first: number, second = 0): DiscountResult | null {
  if (!(price >= 0) || first < 0 || first > 100 || second < 0 || second > 100) return null;
  const afterFirst = price * (1 - first / 100);
  const finalPrice = afterFirst * (1 - second / 100);
  const steps = [`${fmt(price)} − ${fmt(first)}% = ${fmt(afterFirst)}`];
  if (second > 0) steps.push(`${fmt(afterFirst)} − ${fmt(second)}% = ${fmt(finalPrice)}`);
  return { finalPrice, saved: price - finalPrice, effectivePct: price === 0 ? 0 : ((price - finalPrice) / price) * 100, steps };
}

export interface MarginResult { cost: number; price: number; profit: number; marginPct: number; markupPct: number }

/** Margin is profit ÷ selling price; markup is profit ÷ cost. People mix them up, so both are shown. */
export function marginFromCostAndPrice(cost: number, price: number): MarginResult | null {
  if (!(cost >= 0) || !(price > 0)) return null;
  const profit = price - cost;
  return { cost, price, profit, marginPct: (profit / price) * 100, markupPct: cost === 0 ? Infinity : (profit / cost) * 100 };
}

export function priceFromCostAndMarkup(cost: number, markupPct: number): MarginResult | null {
  if (!(cost >= 0) || !(markupPct >= 0)) return null;
  return marginFromCostAndPrice(cost, cost * (1 + markupPct / 100));
}

export function priceFromCostAndMargin(cost: number, marginPct: number): MarginResult | null {
  if (!(cost >= 0) || !(marginPct >= 0) || marginPct >= 100) return null;
  return marginFromCostAndPrice(cost, cost / (1 - marginPct / 100));
}
