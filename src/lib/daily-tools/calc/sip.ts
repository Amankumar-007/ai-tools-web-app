/** SIP, step-up SIP and lump-sum growth, plus what the money is worth after inflation. */

export type InvestMode = 'sip' | 'stepup' | 'lumpsum';

export interface InvestInput {
  mode: InvestMode;
  /** Monthly amount (sip / stepup). */
  monthly?: number;
  /** One-time amount (lumpsum). */
  lumpsum?: number;
  /** Expected return per year, percent. */
  annualReturn: number;
  years: number;
  /** Yearly increase of the monthly amount, percent (stepup). */
  stepUpPct?: number;
  /** Expected inflation per year, percent (optional). */
  inflationPct?: number;
}

export interface InvestYear { year: number; invested: number; value: number }
export interface InvestResult {
  invested: number;
  futureValue: number;
  gains: number;
  /** What the final amount is worth in today's money (null when no inflation was given). */
  realValue: number | null;
  years: InvestYear[];
}

export function validateInvest(i: InvestInput): string | null {
  if (!Number.isFinite(i.annualReturn) || i.annualReturn < 0 || i.annualReturn > 60) return 'Expected return must be between 0% and 60% a year.';
  if (!Number.isInteger(i.years) || i.years < 1 || i.years > 60) return 'Duration must be a whole number of years between 1 and 60.';
  if (i.mode === 'lumpsum') {
    if (!Number.isFinite(i.lumpsum) || (i.lumpsum as number) <= 0 || (i.lumpsum as number) > 1e11) return 'Enter a one-time amount greater than zero.';
  } else {
    if (!Number.isFinite(i.monthly) || (i.monthly as number) <= 0 || (i.monthly as number) > 1e10) return 'Enter a monthly amount greater than zero.';
  }
  if (i.mode === 'stepup' && (!Number.isFinite(i.stepUpPct) || (i.stepUpPct as number) < 0 || (i.stepUpPct as number) > 100)) return 'Yearly step-up must be between 0% and 100%.';
  if (i.inflationPct !== undefined && (!Number.isFinite(i.inflationPct) || i.inflationPct < 0 || i.inflationPct > 50)) return 'Inflation must be between 0% and 50%.';
  return null;
}

/**
 * SIP: each month the instalment is added at the start of the month and the pot then grows by annualReturn/12
 * (monthly compounding, the convention most Indian calculators use). Lump sum: compounded once a year.
 */
export function calculateInvestment(input: InvestInput): InvestResult {
  const error = validateInvest(input);
  if (error) throw new RangeError(error);
  const years: InvestYear[] = [];
  let balance = 0; let invested = 0;

  if (input.mode === 'lumpsum') {
    const growth = 1 + input.annualReturn / 100;
    balance = input.lumpsum as number; invested = balance;
    for (let y = 1; y <= input.years; y++) { balance *= growth; years.push({ year: y, invested, value: balance }); }
  } else {
    const i = input.annualReturn / 12 / 100;
    const step = input.mode === 'stepup' ? 1 + (input.stepUpPct ?? 0) / 100 : 1;
    for (let y = 1; y <= input.years; y++) {
      const instalment = (input.monthly as number) * Math.pow(step, y - 1);
      for (let m = 0; m < 12; m++) { balance = (balance + instalment) * (1 + i); invested += instalment; }
      years.push({ year: y, invested, value: balance });
    }
  }

  const realValue = input.inflationPct !== undefined && input.inflationPct > 0 ? balance / Math.pow(1 + input.inflationPct / 100, input.years) : null;
  return { invested, futureValue: balance, gains: balance - invested, realValue, years };
}
