'use client'

import { useMemo } from 'react'

import { formatIN, formatINR } from '@/lib/daily-tools/calc/format'
import { discount, marginFromCostAndPrice, percentChange, percentOf, priceFromCostAndMargin, priceFromCostAndMarkup, whatPercent } from '@/lib/daily-tools/calc/percent'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, NumberField, Note, parseNum, SelectField, ShareBar, Stat } from '../ui'

const DEFAULTS = { mode: 'of', a: '20', b: '1500', c: '0' }
/** Sensible starting numbers for each mode, so switching never leaves meaningless values behind. */
const PRESETS: Record<string, { a: string; b: string; c: string }> = {
  of: { a: '20', b: '1500', c: '' },
  what: { a: '30', b: '150', c: '' },
  change: { a: '80', b: '100', c: '' },
  discount: { a: '1000', b: '20', c: '10' },
  margin: { a: '80', b: '100', c: '' },
}
const MODES = [
  { value: 'of', label: 'What is X% of Y?' },
  { value: 'what', label: 'X is what % of Y?' },
  { value: 'change', label: '% increase or decrease' },
  { value: 'discount', label: 'Discount (and coupon)' },
  { value: 'margin', label: 'Profit margin & markup' },
]
const num = (n: number) => formatIN(Math.round(n * 1e4) / 1e4, 4)

export default function PercentageCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const a = parseNum(state.a), b = parseNum(state.b), c = state.c.trim() === '' ? 0 : parseNum(state.c)

  const out = useMemo<{ error?: string; stats: Array<{ label: string; value: string; tone?: 'good' | 'warn' | 'bad' }>; working: string[]; text: string }>(() => {
    const bad = (message: string) => ({ error: message, stats: [], working: [], text: '' })
    if (!Number.isFinite(a) || !Number.isFinite(b)) return bad('Enter both numbers.')
    switch (state.mode) {
      case 'of': {
        const r = percentOf(a, b); return { stats: [{ label: `${num(a)}% of ${num(b)}`, value: num(r.value) }], working: [r.working], text: `${num(a)}% of ${num(b)} = ${num(r.value)}` }
      }
      case 'what': {
        const r = whatPercent(a, b); if (!r) return bad('The second number cannot be zero.')
        return { stats: [{ label: `${num(a)} is what % of ${num(b)}`, value: `${num(r.value)}%` }], working: [r.working], text: `${num(a)} is ${num(r.value)}% of ${num(b)}` }
      }
      case 'change': {
        const r = percentChange(a, b); if (!r) return bad('The starting value cannot be zero.')
        const up = r.value >= 0
        return { stats: [{ label: up ? 'Increase' : 'Decrease', value: `${num(Math.abs(r.value))}%`, tone: up ? 'good' : 'bad' }, { label: 'Difference', value: num(b - a) }], working: [r.working], text: `From ${num(a)} to ${num(b)} is a ${up ? 'rise' : 'fall'} of ${num(Math.abs(r.value))}%` }
      }
      case 'discount': {
        if (a < 0 || b < 0 || b > 100 || c < 0 || c > 100 || !Number.isFinite(c)) return bad('Price must be 0 or more and discounts between 0% and 100%.')
        const r = discount(a, b, c); if (!r) return bad('Check the numbers.')
        return { stats: [{ label: 'You pay', value: formatINR(r.finalPrice, true) }, { label: 'You save', value: formatINR(r.saved, true), tone: 'good' }, { label: 'Total discount', value: `${num(r.effectivePct)}%` }], working: r.steps, text: `Price ${formatINR(a)}, ${num(b)}%${c ? ` + ${num(c)}%` : ''} off: you pay ${formatINR(r.finalPrice, true)} and save ${formatINR(r.saved, true)} (${num(r.effectivePct)}% off)` }
      }
      default: {
        const m = marginFromCostAndPrice(a, b); if (!m) return bad('Enter the cost price and a selling price greater than zero.')
        const up = m.profit >= 0
        return { stats: [{ label: up ? 'Profit' : 'Loss', value: formatINR(Math.abs(m.profit), true), tone: up ? 'good' : 'bad' }, { label: 'Margin (of selling price)', value: `${num(m.marginPct)}%` }, { label: 'Markup (on cost)', value: Number.isFinite(m.markupPct) ? `${num(m.markupPct)}%` : '∞' }], working: [`Profit = ${num(b)} − ${num(a)} = ${num(m.profit)}`, `Margin = profit ÷ selling price = ${num(m.profit)} ÷ ${num(b)} × 100`, `Markup = profit ÷ cost = ${num(m.profit)} ÷ ${num(a)} × 100`], text: `Cost ${formatINR(a, true)}, sold at ${formatINR(b, true)}: profit ${formatINR(m.profit, true)}, margin ${num(m.marginPct)}%, markup ${Number.isFinite(m.markupPct) ? num(m.markupPct) + '%' : 'n/a'}` }
      }
    }
  }, [state.mode, a, b, c])

  // Reverse helpers for the margin mode: price needed for a target margin or markup.
  const target = useMemo(() => {
    if (state.mode !== 'margin' || !Number.isFinite(a)) return null
    const t = Number.isFinite(c) && c > 0 ? c : null
    if (t === null) return null
    return { byMargin: priceFromCostAndMargin(a, t), byMarkup: priceFromCostAndMarkup(a, t) }
  }, [state.mode, a, c])

  const labels: Record<string, [string, string, string?]> = {
    of: ['Percentage (X)', 'Of this number (Y)'],
    what: ['The part (X)', 'The whole (Y)'],
    change: ['Old value', 'New value'],
    discount: ['Original price (₹)', 'Discount (%)', 'Extra coupon or second discount (%, optional)'],
    margin: ['Cost price (₹)', 'Selling price (₹)', 'Target margin or markup % (optional)'],
  }
  const [la, lb, lc] = labels[state.mode] ?? labels.of

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <SelectField label="What do you want to work out?" value={state.mode} onChange={(v) => set({ mode: v, ...(PRESETS[v] ?? PRESETS.of) })} options={MODES} />
          <NumberField label={la} value={state.a} onChange={(v) => set({ a: v })} />
          <NumberField label={lb} value={state.b} onChange={(v) => set({ b: v })} />
          {lc && <NumberField label={lc} value={state.c} onChange={(v) => set({ c: v })} placeholder="0" />}
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {out.error ? <ErrorNote>{out.error}</ErrorNote> : (
          <Card>
            <div className="grid gap-3 sm:grid-cols-3">{out.stats.map((s) => <Stat key={s.label} label={s.label} value={s.value} tone={s.tone} />)}</div>
            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">The working</p>
              <ul className="space-y-1 font-mono text-sm">{out.working.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
            {target && (target.byMargin || target.byMarkup) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {target.byMargin && <Stat label={`Price for ${num(c)}% margin`} value={formatINR(target.byMargin.price, true)} />}
                {target.byMarkup && <Stat label={`Price for ${num(c)}% markup`} value={formatINR(target.byMarkup.price, true)} />}
              </div>
            )}
            <div className="mt-5"><ShareBar getSummary={() => out.text} getLink={link} /></div>
          </Card>
        )}
        <Note>Two discounts do not add up: 20% off and then 10% off is 28% off in total, because the second applies to the reduced price. Margin is profit as a share of the selling price; markup is profit as a share of the cost.</Note>
      </div>
    </div>
  )
}
