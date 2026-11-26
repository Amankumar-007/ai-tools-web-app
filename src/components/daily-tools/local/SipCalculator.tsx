'use client'

import { useMemo } from 'react'

import { compactINR, formatINR, rupeesInWords } from '@/lib/daily-tools/calc/format'
import { calculateInvestment, validateInvest, type InvestMode } from '@/lib/daily-tools/calc/sip'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, NumberField, Note, parseNum, Segmented, ShareBar, StackedBar, Stat } from '../ui'

const DEFAULTS = { mode: 'sip', monthly: '10000', lumpsum: '500000', ret: '12', years: '10', step: '10', infl: '6' }

function YearBars({ years }: { years: Array<{ year: number; invested: number; value: number }> }) {
  if (years.length === 0) return null
  const w = 600; const h = 180; const max = Math.max(...years.map((y) => y.value), 1)
  const bw = w / years.length
  return (
    <svg viewBox={`0 0 ${w} ${h + 18}`} className="h-48 w-full" role="img" aria-label="Investment growth year by year: amount invested and gains">
      {years.map((y, i) => {
        const invH = (y.invested / max) * h; const gainH = ((y.value - y.invested) / max) * h
        const x = i * bw + bw * 0.12; const width = bw * 0.76
        return (
          <g key={y.year}>
            <rect x={x} y={h - invH} width={width} height={invH} fill="#a1a1aa" rx="2" />
            <rect x={x} y={h - invH - gainH} width={width} height={Math.max(gainH, 0)} fill="#f97316" rx="2" />
            {(years.length <= 12 || y.year % Math.ceil(years.length / 10) === 0) && <text x={x + width / 2} y={h + 14} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">{y.year}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export default function SipCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const mode = (['sip', 'stepup', 'lumpsum'].includes(state.mode) ? state.mode : 'sip') as InvestMode

  const input = useMemo(() => ({
    mode,
    monthly: parseNum(state.monthly),
    lumpsum: parseNum(state.lumpsum),
    annualReturn: parseNum(state.ret),
    years: Math.round(parseNum(state.years)),
    stepUpPct: parseNum(state.step),
    inflationPct: state.infl.trim() === '' ? undefined : parseNum(state.infl),
  }), [mode, state])
  const error = useMemo(() => validateInvest(input), [input])
  const result = useMemo(() => (error ? null : calculateInvestment(input)), [error, input])

  const label = mode === 'lumpsum' ? 'Lump sum' : mode === 'stepup' ? 'Step-up SIP' : 'SIP'
  const summary = () => result
    ? `${label} projection\n${mode === 'lumpsum' ? `One-time: ${formatINR(input.lumpsum as number)}` : `Monthly: ${formatINR(input.monthly as number)}${mode === 'stepup' ? `, rising ${state.step}% a year` : ''}`} for ${input.years} years at ${state.ret}% a year\nInvested: ${formatINR(result.invested)}\nEstimated value: ${formatINR(result.futureValue)}\nEstimated gains: ${formatINR(result.gains)}${result.realValue ? `\nIn today's money (${state.infl}% inflation): ${formatINR(result.realValue)}` : ''}\nProjection only: returns are not guaranteed.`
    : ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <Segmented label="Investment type" value={mode} onChange={(v) => set({ mode: v })} options={[{ value: 'sip', label: 'SIP' }, { value: 'stepup', label: 'Step-up SIP' }, { value: 'lumpsum', label: 'Lump sum' }]} />
          {mode === 'lumpsum'
            ? <NumberField label="One-time investment" prefix="₹" value={state.lumpsum} onChange={(v) => set({ lumpsum: v })} hint={Number.isFinite(input.lumpsum) && (input.lumpsum as number) > 0 && (input.lumpsum as number) < 1e12 ? rupeesInWords(input.lumpsum as number) : undefined} />
            : <NumberField label="Monthly investment" prefix="₹" value={state.monthly} onChange={(v) => set({ monthly: v })} hint={Number.isFinite(input.monthly) && (input.monthly as number) > 0 && (input.monthly as number) < 1e12 ? rupeesInWords(input.monthly as number) : undefined} />}
          {mode === 'stepup' && <NumberField label="Increase your monthly amount every year by" suffix="%" value={state.step} onChange={(v) => set({ step: v })} />}
          <NumberField label="Expected return (per year)" suffix="% p.a." value={state.ret} onChange={(v) => set({ ret: v })} hint="Be realistic. Higher expected returns mean higher risk, not a guarantee." />
          <NumberField label="For how many years" suffix="years" value={state.years} onChange={(v) => set({ years: v })} inputMode="numeric" />
          <NumberField label="Expected inflation (optional)" suffix="% p.a." value={state.infl} onChange={(v) => set({ infl: v })} hint="Shows what the final amount would be worth in today's money." />
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {result && (
          <>
            <Card>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="You invest" value={compactINR(result.invested)} sub={formatINR(result.invested)} />
                <Stat label="Estimated gains" value={compactINR(result.gains)} sub={formatINR(result.gains)} tone="good" />
                <Stat label="Estimated value" value={compactINR(result.futureValue)} sub={formatINR(result.futureValue)} />
              </div>
              {result.realValue !== null && (
                <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/50">
                  In <strong>today’s money</strong>, after {state.infl}% yearly inflation, that is worth about <strong>{formatINR(result.realValue)}</strong>.
                </p>
              )}
              <div className="mt-5"><StackedBar parts={[{ label: 'Invested', value: result.invested, color: '#a1a1aa' }, { label: 'Gains', value: Math.max(result.gains, 0), color: '#f97316' }]} /></div>
              <div className="mt-5"><ShareBar getSummary={summary} getLink={link} /></div>
            </Card>
            <Card title="Growth year by year">
              <YearBars years={result.years} />
              <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[420px] text-sm tabular-nums">
                  <thead className="sticky top-0 bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"><tr><th className="px-3 py-2">Year</th><th className="px-3 py-2 text-right">Invested</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-right">Gains</th></tr></thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {result.years.map((y) => <tr key={y.year}><td className="px-3 py-2">{y.year}</td><td className="px-3 py-2 text-right">{formatINR(y.invested)}</td><td className="px-3 py-2 text-right">{formatINR(y.value)}</td><td className="px-3 py-2 text-right">{formatINR(y.value - y.invested)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
            <Note>This is an illustration based on the return you typed, not a forecast or advice. Market-linked investments can lose value. SIP growth assumes each instalment is added at the start of the month and compounds monthly at the yearly return ÷ 12; a lump sum compounds once a year. Taxes and fund charges are not included.</Note>
          </>
        )}
      </div>
    </div>
  )
}
