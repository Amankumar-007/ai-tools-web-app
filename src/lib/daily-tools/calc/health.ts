/**
 * BMI, calories and water. General wellness estimates for healthy adults, not medical advice.
 * BMI categories follow BOTH the WHO global cut-offs and the lower cut-offs recommended for Indians and other South Asians
 * (overweight from 23, obese from 25), because the global ones under-flag risk at the same BMI.
 */

export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

export const ACTIVITY: Record<Activity, { label: string; factor: number }> = {
  sedentary: { label: 'Little or no exercise (desk job)', factor: 1.2 },
  light: { label: 'Light exercise 1–3 days a week', factor: 1.375 },
  moderate: { label: 'Moderate exercise 3–5 days a week', factor: 1.55 },
  active: { label: 'Hard exercise 6–7 days a week', factor: 1.725 },
  'very-active': { label: 'Very hard exercise or physical job', factor: 1.9 },
};

export interface HealthInput { sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity }

export function feetInchesToCm(feet: number, inches: number): number { return (feet * 12 + inches) * 2.54; }
export function poundsToKg(lb: number): number { return lb * 0.45359237; }

export function validateHealth(i: HealthInput): string | null {
  if (!Number.isFinite(i.age) || i.age < 18 || i.age > 100) return 'These formulas are for adults: enter an age between 18 and 100.';
  if (!Number.isFinite(i.heightCm) || i.heightCm < 100 || i.heightCm > 250) return 'Height should be between 100 and 250 cm.';
  if (!Number.isFinite(i.weightKg) || i.weightKg < 25 || i.weightKg > 300) return 'Weight should be between 25 and 300 kg.';
  return null;
}

export const bmiOf = (kg: number, cm: number) => kg / Math.pow(cm / 100, 2);

export function bmiCategoryWho(bmi: number): string {
  return bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : 'Obese';
}
export function bmiCategoryAsian(bmi: number): string {
  return bmi < 18.5 ? 'Underweight' : bmi < 23 ? 'Healthy weight' : bmi < 25 ? 'Overweight (at risk)' : 'Obese';
}

export interface HealthResult {
  bmi: number;
  categoryWho: string;
  categoryAsian: string;
  /** Healthy weight range for this height: BMI 18.5 to 22.9 (Asian) and 18.5 to 24.9 (WHO). */
  rangeAsian: [number, number];
  rangeWho: [number, number];
  bmr: number;
  tdee: number;
  /** Daily calories for steady change of about 0.5 kg a week, never below a safe floor. */
  lose: number;
  gain: number;
  proteinGrams: [number, number];
  waterLitres: number;
}

/** Mifflin-St Jeor resting energy. */
export function bmrOf(i: Pick<HealthInput, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  return 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === 'male' ? 5 : -161);
}

export function calculateHealth(i: HealthInput): HealthResult {
  const error = validateHealth(i);
  if (error) throw new RangeError(error);
  const bmi = bmiOf(i.weightKg, i.heightCm);
  const h2 = Math.pow(i.heightCm / 100, 2);
  const bmr = bmrOf(i);
  const tdee = bmr * ACTIVITY[i.activity].factor;
  const floor = i.sex === 'male' ? 1500 : 1200;
  return {
    bmi,
    categoryWho: bmiCategoryWho(bmi),
    categoryAsian: bmiCategoryAsian(bmi),
    rangeAsian: [18.5 * h2, 22.9 * h2],
    rangeWho: [18.5 * h2, 24.9 * h2],
    bmr,
    tdee,
    lose: Math.max(tdee - 500, floor),
    gain: tdee + 400,
    proteinGrams: [0.8 * i.weightKg, 1.6 * i.weightKg],
    waterLitres: (i.weightKg * 35) / 1000,
  };
}
