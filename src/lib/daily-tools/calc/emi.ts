/** Loan EMI maths with an optional extra monthly prepayment ("how much do I save by paying a bit more?"). */

export interface EmiInput {
  /** Loan amount in rupees. */
  principal: number;
  /** Interest rate per year, in percent (0 is allowed). */
  annualRate: number;
  /** Tenure in months. */
  months: number;
  /** Extra amount paid every month on top of the EMI (optional). */
  extraMonthly?: number;
}

export interface EmiRow { month: number; interest: number; principal: number; extra: number; balance: number }

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  /** Months actually needed (fewer than the tenure when prepaying). */
  months: number;
  schedule: EmiRow[];
  /** The same loan without any extra payment. */
  baseline: { months: number; totalInterest: number; totalPayment: number };
  interestSaved: number;
  monthsSaved: number;
}

export const LIMITS = { maxPrincipal: 1e10, maxRate: 60, maxMonths: 600 } as const;

export function validateEmi(i: EmiInput): string | null {
  if (!Number.isFinite(i.principal) || i.principal <= 0) return 'Enter a loan amount greater than zero.';
  if (i.principal > LIMITS.maxPrincipal) return 'That loan amount is too large to calculate.';
  if (!Number.isFinite(i.annualRate) || i.annualRate < 0 || i.annualRate > LIMITS.maxRate) return `Interest rate must be between 0% and ${LIMITS.maxRate}%.`;
  if (!Number.isInteger(i.months) || i.months < 1 || i.months > LIMITS.maxMonths) return `Tenure must be between 1 and ${LIMITS.maxMonths} months (${LIMITS.maxMonths / 12} years).`;
  if (i.extraMonthly !== undefined && (!Number.isFinite(i.extraMonthly) || i.extraMonthly < 0)) return 'Extra payment cannot be negative.';
  return null;
}

/** The standard EMI formula: P·r·(1+r)^n / ((1+r)^n − 1), with r the monthly rate. Zero interest is just P/n. */
export function emiAmount(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const growth = Math.pow(1 + r, months);
  return (principal * r * growth) / (growth - 1);
}

function run(principal: number, annualRate: number, months: number, emi: number, extra: number): { schedule: EmiRow[]; totalInterest: number; totalPayment: number } {
  const r = annualRate / 12 / 100;
  const schedule: EmiRow[] = [];
  let balance = principal; let totalInterest = 0; let totalPayment = 0;
  for (let m = 1; m <= months && balance > 0.005; m++) {
    const interest = balance * r;
    const scheduled = emi - interest;
    // Never pay more than what is owed; on the final scheduled month clear any floating-point residue exactly.
    let principalTotal = Math.min(scheduled + extra, balance);
    if (m === months) principalTotal = balance;
    const principalPart = Math.min(Math.max(scheduled, 0), principalTotal);
    const extraPart = principalTotal - principalPart;
    balance = balance - principalTotal;
    if (balance < 0.005) balance = 0;
    totalInterest += interest;
    totalPayment += interest + principalPart + extraPart;
    schedule.push({ month: m, interest, principal: principalPart, extra: extraPart, balance });
  }
  return { schedule, totalInterest, totalPayment };
}

export function calculateEmi(input: EmiInput): EmiResult {
  const error = validateEmi(input);
  if (error) throw new RangeError(error);
  const emi = emiAmount(input.principal, input.annualRate, input.months);
  const base = run(input.principal, input.annualRate, input.months, emi, 0);
  const extra = input.extraMonthly && input.extraMonthly > 0 ? input.extraMonthly : 0;
  const actual = extra ? run(input.principal, input.annualRate, input.months, emi, extra) : base;
  return {
    emi,
    totalInterest: actual.totalInterest,
    totalPayment: actual.totalPayment,
    months: actual.schedule.length,
    schedule: actual.schedule,
    baseline: { months: base.schedule.length, totalInterest: base.totalInterest, totalPayment: base.totalPayment },
    interestSaved: base.totalInterest - actual.totalInterest,
    monthsSaved: base.schedule.length - actual.schedule.length,
  };
}

/** Roll the month-by-month schedule up into years for a compact table. */
export function yearlySummary(schedule: EmiRow[]): Array<{ year: number; interest: number; principal: number; balance: number }> {
  const years: Array<{ year: number; interest: number; principal: number; balance: number }> = [];
  for (const row of schedule) {
    const y = Math.ceil(row.month / 12);
    let bucket = years[y - 1];
    if (!bucket) { bucket = { year: y, interest: 0, principal: 0, balance: 0 }; years[y - 1] = bucket; }
    bucket.interest += row.interest; bucket.principal += row.principal + row.extra; bucket.balance = row.balance;
  }
  return years;
}
