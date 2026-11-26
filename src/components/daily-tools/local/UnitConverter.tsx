'use client'

import { useMemo } from 'react'
import { ArrowLeftRight } from 'lucide-react'

import { CATEGORIES, convert, formatUnitValue, getCategory } from '@/lib/daily-tools/calc/units'
import { useShareableState } from '../hooks'
import { Card, CopyButton, ErrorNote, inputClass, Note, parseNum, ShareBar } from '../ui'

const DEFAULTS = { cat: 'length', from: 'km', to: 'mi', val: '1', side: 'from' }

export default function UnitConverter() {
  const { state, set, link } = useShareableState(DEFAULTS)
  const category = getCategory(state.cat) ?? CATEGORIES[0]
  const ids = category.units.map((u) => u.id)
  const from = ids.includes(state.from) ? state.from : ids[0]
  const to = ids.includes(state.to) ? state.to : ids[1] ?? ids[0]
  const editingTo = state.side === 'to'

  // One number is typed; the other side is computed. Whichever box was edited last is the "typed" side.
  const typed = parseNum(state.val)
  const computed = useMemo(() => {
    if (!Number.isFinite(typed)) return null
    return editingTo ? convert(typed, category.id, to, from) : convert(typed, category.id, from, to)
  }, [typed, editingTo, category.id, from, to])

  const invalid = state.val.trim() !== '' && !Number.isFinite(typed)
  const belowZero = category.id === 'temperature' && Number.isFinite(typed) && computed === null
  const fromText = editingTo ? (computed === null ? '' : formatUnitValue(computed)) : state.val
  const toText = editingTo ? state.val : computed === null ? '' : formatUnitValue(computed)
  const label = (id: string) => category.units.find((u) => u.id === id)?.label ?? id
  const summary = () => `${fromText} ${label(from)} = ${toText} ${label(to)}`

  const changeCategory = (cat: string) => {
    const c = getCategory(cat) ?? CATEGORIES[0]
    set({ cat, from: c.units[0].id, to: c.units[Math.min(1, c.units.length - 1)].id, val: '1', side: 'from' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 print:hidden" role="tablist" aria-label="Unit category">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={c.id === category.id} onClick={() => changeCategory(c.id)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${c.id === category.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}>{c.label}</button>
        ))}
      </div>

      <Card>
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <select aria-label="Convert from" value={from} onChange={(e) => set({ from: e.target.value })} className={inputClass}>{category.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
            <input aria-label="Value to convert" inputMode="decimal" autoComplete="off" value={fromText} onChange={(e) => set({ val: e.target.value.replace(/[^\d.,\-]/g, '').slice(0, 24), side: 'from' })} className={`${inputClass} text-lg font-semibold tabular-nums`} />
          </div>
          <button type="button" aria-label="Swap units" onClick={() => set({ from: to, to: from, side: 'from', val: computed === null ? state.val : String(Number(computed.toPrecision(10))) })} className="mx-auto rounded-full border border-zinc-300 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 md:mb-1"><ArrowLeftRight className="h-5 w-5" /></button>
          <div className="space-y-2">
            <select aria-label="Convert to" value={to} onChange={(e) => set({ to: e.target.value })} className={inputClass}>{category.units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
            <input aria-label="Converted value" inputMode="decimal" autoComplete="off" value={toText} onChange={(e) => set({ val: e.target.value.replace(/[^\d.,\-]/g, '').slice(0, 24), side: 'to' })} className={`${inputClass} text-lg font-semibold tabular-nums`} />
          </div>
        </div>
        {invalid && <div className="mt-4"><ErrorNote>Enter a number.</ErrorNote></div>}
        {belowZero && <div className="mt-4"><ErrorNote>That is below absolute zero (−273.15 °C), which is not possible.</ErrorNote></div>}
        {computed !== null && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{summary()}</p>
            <CopyButton text={editingTo ? fromText : toText} label="Copy result" />
          </div>
        )}
        <div className="mt-4"><ShareBar getSummary={summary} getLink={link} /></div>
      </Card>

      <Card title={`Common ${category.label.toLowerCase()} conversions`}>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          {category.units.filter((u) => u.id !== from).slice(0, 8).map((u) => {
            const v = convert(1, category.id, from, u.id)
            return <li key={u.id} className="flex justify-between rounded-xl bg-zinc-50 px-4 py-2 dark:bg-zinc-950/50"><span>1 {label(from).replace(/\s*\(.*\)/, '')}</span><span className="font-medium tabular-nums">{v === null ? '—' : formatUnitValue(v)} {u.label.replace(/\s*\(.*\)/, '')}</span></li>
          })}
        </ul>
      </Card>
      <Note>Results are shown with up to 10 significant digits. KB, MB and GB are decimal (1000); KiB, MiB and GiB are binary (1024). A bigha is not included because its size differs from state to state; a guntha is 1,089 square feet.</Note>
    </div>
  )
}
