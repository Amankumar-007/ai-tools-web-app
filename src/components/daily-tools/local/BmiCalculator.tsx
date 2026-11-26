'use client'

import { useMemo } from 'react'

import { ACTIVITY, calculateHealth, feetInchesToCm, poundsToKg, validateHealth, type Activity, type Sex } from '@/lib/daily-tools/calc/health'
import { formatIN } from '@/lib/daily-tools/calc/format'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, NumberField, Note, parseNum, Segmented, SelectField, ShareBar, Stat } from '../ui'

const DEFAULTS = { units: 'metric', sex: 'male', age: '30', cm: '170', ft: '5', inch: '7', kg: '70', lb: '154', activity: 'light' }
const r0 = (n: number) => formatIN(Math.round(n), 0)

/** A bar from BMI 15 to 40 with the Indian and WHO bands, and a marker for the person. */
function BmiScale({ bmi }: { bmi: number }) {
  const min = 15, max = 40; const pos = Math.min(Math.max((bmi - min) / (max - min), 0), 1) * 100
  const band = (from: number, to: number, color: string, label: string) => <div key={label} title={label} style={{ left: `${((from - min) / (max - min)) * 100}%`, width: `${((to - from) / (max - min)) * 100}%`, background: color }} className="absolute inset-y-0" />
  return (
    <div className="space-y-3">
      {[{ name: 'Indian / Asian cut-offs', bands: [[15, 18.5, '#60a5fa', 'Underweight'], [18.5, 23, '#34d399', 'Healthy'], [23, 25, '#fbbf24', 'Overweight (at risk)'], [25, 40, '#f87171', 'Obese']] as const },
        { name: 'WHO global cut-offs', bands: [[15, 18.5, '#60a5fa', 'Underweight'], [18.5, 25, '#34d399', 'Healthy'], [25, 30, '#fbbf24', 'Overweight'], [30, 40, '#f87171', 'Obese']] as const }].map((row) => (
        <div key={row.name}>
          <p className="mb-1 text-xs text-zinc-500">{row.name}</p>
          <div className="relative h-3 overflow-hidden rounded-full">{row.bands.map(([f, t, c, l]) => band(f, t, c, l))}</div>
        </div>
      ))}
      <div className="relative -mt-1 h-3"><div style={{ left: `${pos}%` }} className="absolute -translate-x-1/2 text-orange-600" aria-hidden>▲</div></div>
    </div>
  )
}

export default function BmiCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const metric = state.units !== 'imperial'

  const input = useMemo(() => ({
    sex: (state.sex === 'female' ? 'female' : 'male') as Sex,
    age: parseNum(state.age),
    heightCm: metric ? parseNum(state.cm) : feetInchesToCm(parseNum(state.ft), state.inch.trim() === '' ? 0 : parseNum(state.inch)),
    weightKg: metric ? parseNum(state.kg) : poundsToKg(parseNum(state.lb)),
    activity: (state.activity in ACTIVITY ? state.activity : 'light') as Activity,
  }), [state, metric])
  const error = useMemo(() => validateHealth(input), [input])
  const r = useMemo(() => (error ? null : calculateHealth(input)), [error, input])
  const tone = (c: string) => (c.startsWith('Healthy') ? 'good' : c.startsWith('Under') ? 'warn' : 'bad') as 'good' | 'warn' | 'bad'
  const summary = () => r ? `BMI ${r.bmi.toFixed(1)}: ${r.categoryAsian} (Indian cut-offs), ${r.categoryWho} (WHO)\nMaintenance: ${r0(r.tdee)} kcal/day, to lose weight: ${r0(r.lose)}, to gain: ${r0(r.gain)}\nHealthy weight for your height: ${r.rangeAsian[0].toFixed(1)} to ${r.rangeAsian[1].toFixed(1)} kg\nWater: about ${r.waterLitres.toFixed(1)} litres a day\nGeneral wellness estimate, not medical advice.` : ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <Segmented label="Units" value={metric ? 'metric' : 'imperial'} onChange={(v) => set({ units: v })} options={[{ value: 'metric', label: 'cm / kg' }, { value: 'imperial', label: 'ft / lb' }]} />
          <Segmented label="Sex" value={state.sex as Sex} onChange={(v) => set({ sex: v })} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
          <NumberField label="Age" suffix="years" value={state.age} onChange={(v) => set({ age: v })} inputMode="numeric" />
          {metric
            ? <NumberField label="Height" suffix="cm" value={state.cm} onChange={(v) => set({ cm: v })} />
            : <div className="grid grid-cols-2 gap-3"><NumberField label="Height" suffix="ft" value={state.ft} onChange={(v) => set({ ft: v })} inputMode="numeric" /><NumberField label="&nbsp;" suffix="in" value={state.inch} onChange={(v) => set({ inch: v })} /></div>}
          {metric
            ? <NumberField label="Weight" suffix="kg" value={state.kg} onChange={(v) => set({ kg: v })} />
            : <NumberField label="Weight" suffix="lb" value={state.lb} onChange={(v) => set({ lb: v })} />}
          <SelectField label="How active are you?" value={input.activity} onChange={(v) => set({ activity: v })} options={Object.entries(ACTIVITY).map(([value, a]) => ({ value, label: a.label }))} />
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {r && (
          <>
            <Card>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Your BMI" value={r.bmi.toFixed(1)} />
                <Stat label="Indian cut-offs" value={r.categoryAsian} tone={tone(r.categoryAsian)} />
                <Stat label="WHO cut-offs" value={r.categoryWho} tone={tone(r.categoryWho)} />
              </div>
              <div className="mt-5"><BmiScale bmi={r.bmi} /></div>
              <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">A healthy weight for your height is about <strong>{r.rangeAsian[0].toFixed(1)}–{r.rangeAsian[1].toFixed(1)} kg</strong> by Indian guidelines (BMI 18.5–22.9), or {r.rangeWho[0].toFixed(1)}–{r.rangeWho[1].toFixed(1)} kg by WHO (up to BMI 24.9).</p>
            </Card>
            <Card title="Daily calories, protein and water">
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Maintain weight" value={`${r0(r.tdee)} kcal`} sub={`resting (BMR) ${r0(r.bmr)} kcal`} />
                <Stat label="Lose about 0.5 kg a week" value={`${r0(r.lose)} kcal`} tone="good" />
                <Stat label="Gain slowly" value={`${r0(r.gain)} kcal`} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Stat label="Protein" value={`${r0(r.proteinGrams[0])}–${r0(r.proteinGrams[1])} g`} sub="a day: lower end if inactive, upper end if you train" />
                <Stat label="Water" value={`about ${r.waterLitres.toFixed(1)} L`} sub="a day, more in heat or exercise" />
              </div>
              <div className="mt-5"><ShareBar getSummary={summary} getLink={link} /></div>
            </Card>
            <Note>For healthy adults, a general wellness estimate and not medical advice. BMI ignores muscle, waist size and fitness. Indian guidelines use lower cut-offs because South Asians carry more health risk at the same BMI. Calories use the Mifflin-St Jeor equation; the weight-loss figure never goes below 1,500 kcal for men or 1,200 for women. If you are pregnant, have a medical condition or an eating disorder, talk to a doctor first.</Note>
          </>
        )}
      </div>
    </div>
  )
}
