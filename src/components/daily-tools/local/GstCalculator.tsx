'use client'

import { useMemo } from 'react'

import { formatINR, rupeesInWords } from '@/lib/daily-tools/calc/format'
import { calculateGst, COMMON_GST_RATES, validateGst, type GstMode } from '@/lib/daily-tools/calc/gst'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, NumberField, Note, parseNum, Segmented, ShareBar, Stat } from '../ui'

const DEFAULTS = { amount: '1000', rate: '18', mode: 'add', inter: 'no' }

export default function GstCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const mode = (state.mode === 'remove' ? 'remove' : 'add') as GstMode
  const interstate = state.inter === 'yes'
  const input = useMemo(() => ({ amount: parseNum(state.amount), rate: parseNum(state.rate), mode, interstate }), [state, mode, interstate])
  const error = useMemo(() => validateGst(input), [input])
  const result = useMemo(() => (error ? null : calculateGst(input)), [error, input])
  const preset = (COMMON_GST_RATES as readonly number[]).includes(Number(state.rate)) ? state.rate : 'custom'

  const summary = () => result
    ? `GST calculation (${mode === 'add' ? 'adding' : 'removing'} ${state.rate}% GST)\nPrice before GST: ${formatINR(result.net, true)}\nGST: ${formatINR(result.gst, true)}${interstate ? ` (IGST ${formatINR(result.igst, true)})` : ` (CGST ${formatINR(result.cgst, true)} + SGST ${formatINR(result.sgst, true)})`}\nTotal with GST: ${formatINR(result.gross, true)}`
    : ''

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <Segmented label="Mode" value={mode} onChange={(v) => set({ mode: v })} options={[{ value: 'add', label: 'Add GST' }, { value: 'remove', label: 'Remove GST' }]} />
          <NumberField label={mode === 'add' ? 'Price before GST' : 'Price including GST'} prefix="₹" value={state.amount} onChange={(v) => set({ amount: v })} hint={Number.isFinite(input.amount) && input.amount > 0 && input.amount < 1e12 ? rupeesInWords(input.amount) : undefined} />
          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">GST rate</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_GST_RATES.map((r) => (
                <button key={r} type="button" aria-pressed={preset === String(r)} onClick={() => set({ rate: String(r) })} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${preset === String(r) ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}>{r}%</button>
              ))}
            </div>
            <div className="mt-3"><NumberField label="Or type a rate" suffix="%" value={state.rate} onChange={(v) => set({ rate: v })} hint="Rates depend on the item and change over time. Check the current rate for your item." /></div>
          </div>
          <Segmented label="Type of sale" value={interstate ? 'yes' : 'no'} onChange={(v) => set({ inter: v })} options={[{ value: 'no', label: 'Same state (CGST + SGST)' }, { value: 'yes', label: 'Other state (IGST)' }]} />
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {result && (
          <>
            <Card>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Price before GST" value={formatINR(result.net, true)} />
                <Stat label={`GST @ ${result.rate}%`} value={formatINR(result.gst, true)} tone="warn" />
                <Stat label="Total with GST" value={formatINR(result.gross, true)} />
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm tabular-nums">
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {interstate
                      ? <tr><td className="px-4 py-2.5">IGST ({result.rate}%)</td><td className="px-4 py-2.5 text-right">{formatINR(result.igst, true)}</td></tr>
                      : <>
                          <tr><td className="px-4 py-2.5">CGST ({result.rate / 2}%)</td><td className="px-4 py-2.5 text-right">{formatINR(result.cgst, true)}</td></tr>
                          <tr><td className="px-4 py-2.5">SGST ({result.rate / 2}%)</td><td className="px-4 py-2.5 text-right">{formatINR(result.sgst, true)}</td></tr>
                        </>}
                    <tr className="bg-zinc-50 font-semibold dark:bg-zinc-950/50"><td className="px-4 py-2.5">Total GST</td><td className="px-4 py-2.5 text-right">{formatINR(result.gst, true)}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-zinc-500">{mode === 'add' ? 'GST = price × rate ÷ 100. Total = price + GST.' : 'Price before GST = total × 100 ÷ (100 + rate). GST = total − that price.'} Calculated in whole paise so the parts always add up.</p>
              <div className="mt-4"><ShareBar getSummary={summary} getLink={link} /></div>
            </Card>
            <Note>For information only. It is not tax advice and does not check which rate applies to your item, input tax credit or reverse charge. Confirm with your accountant for filings.</Note>
          </>
        )}
      </div>
    </div>
  )
}
