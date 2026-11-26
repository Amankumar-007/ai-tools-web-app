/** Splitting bills and settling group expenses, in whole paise so nobody is ever off by a rounding paisa. */

const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

/** Divide `total` paise among `n` people so the shares sum EXACTLY to total (the first few pay one paisa more). */
export function splitPaise(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const extra = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

export interface SimpleSplitInput { total: number; people: number; tipPct: number; taxPct: number; roundUpPerPerson: boolean }
export interface SimpleSplitResult { subtotal: number; tax: number; tip: number; grand: number; perPerson: number; shares: number[]; /** Extra collected by rounding up. */ roundingExtra: number }

export function validateSimpleSplit(i: SimpleSplitInput): string | null {
  if (!Number.isFinite(i.total) || i.total <= 0 || i.total > 1e9) return 'Enter the bill amount.';
  if (!Number.isInteger(i.people) || i.people < 1 || i.people > 200) return 'Number of people must be between 1 and 200.';
  if (!Number.isFinite(i.tipPct) || i.tipPct < 0 || i.tipPct > 100) return 'Tip must be between 0% and 100%.';
  if (!Number.isFinite(i.taxPct) || i.taxPct < 0 || i.taxPct > 100) return 'Tax must be between 0% and 100%.';
  return null;
}

export function simpleSplit(i: SimpleSplitInput): SimpleSplitResult {
  const error = validateSimpleSplit(i);
  if (error) throw new RangeError(error);
  const subtotal = toPaise(i.total);
  const tax = Math.round((subtotal * i.taxPct) / 100);
  const tip = Math.round((subtotal * i.tipPct) / 100);
  const grand = subtotal + tax + tip;
  let shares: number[]; let roundingExtra = 0;
  if (i.roundUpPerPerson) {
    const each = Math.ceil(grand / i.people / 100) * 100; // whole rupees per person
    shares = Array(i.people).fill(each);
    roundingExtra = each * i.people - grand;
  } else {
    shares = splitPaise(grand, i.people);
  }
  return { subtotal: toRupees(subtotal), tax: toRupees(tax), tip: toRupees(tip), grand: toRupees(grand), perPerson: toRupees(Math.max(...shares)), shares: shares.map(toRupees), roundingExtra: toRupees(roundingExtra) };
}

export interface Expense { id: string; description: string; payer: string; amount: number; among: string[] }
export interface Transfer { from: string; to: string; amount: number }
export interface GroupResult {
  /** Positive = is owed money, negative = owes money. */
  balances: Record<string, number>;
  transfers: Transfer[];
  totalSpent: number;
  /** What each person's own share of everything came to. */
  shareOf: Record<string, number>;
}

export function validateExpense(e: Expense, people: string[]): string | null {
  if (!people.includes(e.payer)) return 'Choose who paid.';
  if (!Number.isFinite(e.amount) || e.amount <= 0 || e.amount > 1e9) return 'Enter a valid amount.';
  if (e.among.length === 0) return 'Choose at least one person to split with.';
  if (e.among.some((p) => !people.includes(p))) return 'Someone in this expense is not in the group.';
  if (new Set(e.among).size !== e.among.length) return 'A person is listed twice.';
  return null;
}

/** Net each person's balance across all expenses, then produce few, simple "A pays B" payments that settle everything. */
export function settleGroup(people: string[], expenses: Expense[]): GroupResult {
  const balance = new Map<string, number>(people.map((p) => [p, 0]));
  const share = new Map<string, number>(people.map((p) => [p, 0]));
  let totalSpent = 0;
  for (const e of expenses) {
    const error = validateExpense(e, people);
    if (error) throw new RangeError(`${e.description || 'Expense'}: ${error}`);
    const amount = toPaise(e.amount);
    totalSpent += amount;
    balance.set(e.payer, (balance.get(e.payer) ?? 0) + amount);
    splitPaise(amount, e.among.length).forEach((part, i) => {
      const who = e.among[i];
      balance.set(who, (balance.get(who) ?? 0) - part);
      share.set(who, (share.get(who) ?? 0) + part);
    });
  }

  const creditors = [...balance].filter(([, v]) => v > 0).map(([name, v]) => ({ name, v })).sort((a, b) => b.v - a.v || a.name.localeCompare(b.name));
  const debtors = [...balance].filter(([, v]) => v < 0).map(([name, v]) => ({ name, v: -v })).sort((a, b) => b.v - a.v || a.name.localeCompare(b.name));
  const transfers: Transfer[] = [];
  let ci = 0; let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const pay = Math.min(creditors[ci].v, debtors[di].v);
    if (pay > 0) transfers.push({ from: debtors[di].name, to: creditors[ci].name, amount: toRupees(pay) });
    creditors[ci].v -= pay; debtors[di].v -= pay;
    if (creditors[ci].v === 0) ci++;
    if (debtors[di].v === 0) di++;
  }
  return {
    balances: Object.fromEntries([...balance].map(([k, v]) => [k, toRupees(v)])),
    transfers,
    totalSpent: toRupees(totalSpent),
    shareOf: Object.fromEntries([...share].map(([k, v]) => [k, toRupees(v)])),
  };
}
