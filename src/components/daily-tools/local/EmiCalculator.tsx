'use client'

import { useMemo, useState } from 'react'

import { calculateEmi, validateEmi, yearlySummary } from '@/lib/daily-tools/calc/emi'
import { compactINR, formatINR, rupeesInWords } from '@/lib/daily-tools/calc/format'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, NumberField, Note, parseNum, Segmented, SelectField, ShareBar, StackedBar, Stat } from '../ui'

const DEFAULTS = { amount: '1000000', rate: '8.5', tenure: '20', unit: 'years', extra: '' }

function BalanceChart({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const w = 600; const h = 140; const max = Math.max(...points, 1)
  const path = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - (p / max) * (h - 8) - 4}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" role="img" aria-label="Outstanding loan balance over time, falling to zero">
      <polyline points={`0,${h} ${path} ${w},${h}`} fill="rgba(249,115,22,0.12)" stroke="none" />
      <polyline points={path} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function EmiCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const [view, setView] = useState<'yearly' | 'monthly'>('yearly')

  const parsed = useMemo(() => {
    const principal = parseNum(state.amount)
    const annualRate = parseNum(state.rate)
    const tenure = parseNum(state.tenure)
    const months = state.unit === 'years' ? Math.round(tenure * 12) : Math.round(tenure)
    const extra = state.extra.trim() === '' ? 0 : parseNum(state.extra)
    const input = { principal, annualRate, months, extraMonthly: extra }
    const error = Number.isNaN(tenure) ? 'Enter the loan tenure.' : validateEmi(input)
    return { input, error, principal }
  }, [state])

  const result = useMemo(() => (parsed.error ? null : calculateEmi(parsed.input)), [parsed])
  const yearly = useMemo(() => (result ? yearlySummary(result.schedule) : []), [result])
  const summary = () => result
    ? `EMI calculation\nLoan: ${formatINR(parsed.principal)} at ${state.rate}% for ${state.tenure} ${state.unit}\nMonthly EMI: ${formatINR(result.emi)}\nTotal interest: ${formatINR(result.totalInterest)}\nTotal payment: ${formatINR(result.totalPayment)}${result.monthsSaved ? `\nWith ${formatINR(parseNum(state.extra))} extra every month: ${result.monthsSaved} months earlier, ${formatINR(result.interestSaved)} interest saved` : ''}`
    : ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <NumberField label="Loan amount" prefix="₹" value={state.amount} onChange={(v) => set({ amount: v })} hint={Number.isFinite(parsed.principal) && parsed.principal > 0 && parsed.principal < 1e12 ? rupeesInWords(parsed.principal) : undefined} />
          <NumberField label="Interest rate (per year)" suffix="% p.a." value={state.rate} onChange={(v) => set({ rate: v })} />
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <NumberField label="Loan tenure" value={state.tenure} onChange={(v) => set({ tenure: v })} inputMode="decimal" />
            <Segmented label="Tenure unit" value={state.unit as 'years' | 'months'} onChange={(v) => set({ unit: v })} options={[{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }]} />
          </div>
          <NumberField label="Extra payment every month (optional)" prefix="₹" value={state.extra} onChange={(v) => set({ extra: v })} placeholder="0" hint="See how paying a little more each month saves interest and time." />
          <SelectField label="Quick pick" value="" onChange={(v) => { const [a, r, t] = v.split('|'); if (a) set({ amount: a, rate: r, tenure: t, unit: 'years' }) }} options={[{ value: '', label: 'Choose a typical loan…' }, { value: '5000000|8.5|20', label: 'Home loan: ₹50 lakh, 8.5%, 20 years' }, { value: '800000|9|7', label: 'Car loan: ₹8 lakh, 9%, 7 years' }, { value: '300000|12|3', label: 'Personal loan: ₹3 lakh, 12%, 3 years' }, { value: '1000000|9.5|10', label: 'Education loan: ₹10 lakh, 9.5%, 10 years' }]} />
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {parsed.error && <ErrorNote>{parsed.error}</ErrorNote>}
        {result && (
          <>
            <Card>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Monthly EMI" value={formatINR(result.emi)} sub={`for ${result.months} months`} />
                <Stat label="Total interest" value={compactINR(result.totalInterest)} sub={formatINR(result.totalInterest)} tone="warn" />
                <Stat label="Total payment" value={compactINR(result.totalPayment)} sub={formatINR(result.totalPayment)} />
              </div>
              <div className="mt-5"><StackedBar parts={[{ label: 'Principal', value: parsed.principal, color: '#f97316' }, { label: 'Interest', value: result.totalInterest, color: '#a1a1aa' }]} /></div>
              {result.monthsSaved > 0 && (
                <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">{result.interestSaved >= 1 ? `Your extra payment saves you ${formatINR(result.interestSaved)}` : 'Your extra payment clears the loan sooner'}</p>
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">You finish {Math.floor(result.monthsSaved / 12) > 0 ? `${Math.floor(result.monthsSaved / 12)} year${Math.floor(result.monthsSaved / 12) === 1 ? '' : 's'} ` : ''}{result.monthsSaved % 12 ? `${result.monthsSaved % 12} month${result.monthsSaved % 12 === 1 ? '' : 's'} ` : ''}earlier ({result.months} months instead of {result.baseline.months}).</p>
                </div>
              )}
              <div className="mt-5"><ShareBar getSummary={summary} getLink={link} /></div>
            </Card>

            <Card title="Outstanding balance over time">
              <BalanceChart points={[parsed.principal, ...result.schedule.map((r) => r.balance)]} />
            </Card>

            <Card title="Repayment schedule">
              <div className="mb-4"><Segmented label="Schedule view" value={view} onChange={setView} options={[{ value: 'yearly', label: 'Year by year' }, { value: 'monthly', label: 'Month by month' }]} /></div>
              <div className="max-h-96 overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[480px] text-sm tabular-nums">
                  <thead className="sticky top-0 bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <tr><th className="px-3 py-2">{view === 'yearly' ? 'Year' : 'Month'}</th><th className="px-3 py-2 text-right">Principal</th><th className="px-3 py-2 text-right">Interest</th><th className="px-3 py-2 text-right">Balance</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {view === 'yearly'
                      ? yearly.map((y) => <tr key={y.year}><td className="px-3 py-2">{y.year}</td><td className="px-3 py-2 text-right">{formatINR(y.principal)}</td><td className="px-3 py-2 text-right">{formatINR(y.interest)}</td><td className="px-3 py-2 text-right">{formatINR(y.balance)}</td></tr>)
                      : result.schedule.map((r) => <tr key={r.month}><td className="px-3 py-2">{r.month}</td><td className="px-3 py-2 text-right">{formatINR(r.principal + r.extra)}</td><td className="px-3 py-2 text-right">{formatINR(r.interest)}</td><td className="px-3 py-2 text-right">{formatINR(r.balance)}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </Card>
            <Note>EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where r is the monthly rate. Banks round the EMI to a whole rupee and may count days exactly, so your bank’s figure can differ slightly. This is an estimate, not a loan offer.</Note>
          </>
        )}
      </div>
    </div>
  )
}
