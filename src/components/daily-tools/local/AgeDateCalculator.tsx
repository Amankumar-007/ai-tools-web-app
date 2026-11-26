'use client'

import { useEffect, useMemo, useState } from 'react'

import { ageOn, dateDifference, formatDate, parseDate, shiftDate, todayLocal, weekdayName, type Duration } from '@/lib/daily-tools/calc/dates'
import { formatIN } from '@/lib/daily-tools/calc/format'
import { useShareableState } from '../hooks'
import { Card, ErrorNote, Field, inputClass, NumberField, Note, parseNum, Segmented, ShareBar, Stat } from '../ui'

const DEFAULTS = { mode: 'age', dob: '', from: '', to: '', start: '', op: 'add', y: '0', m: '0', d: '30' }
const plural = (n: number, w: string) => `${formatIN(n, 0)} ${w}${n === 1 ? '' : 's'}`
const ymdText = (d: Duration) => [d.years && plural(d.years, 'year'), d.months && plural(d.months, 'month'), d.days && plural(d.days, 'day')].filter(Boolean).join(', ') || '0 days'
const pretty = (p: { y: number; m: number; d: number }) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)))

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <Field label={label} htmlFor={`d-${label}`}><input id={`d-${label}`} type="date" min="1900-01-01" max="2200-12-31" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} /></Field>
}

export default function AgeDateCalculator() {
  const { state, set, link } = useShareableState(DEFAULTS)
  // "Today" comes from the user's own clock, read after mount so the server and browser HTML match.
  const [today, setToday] = useState<string | null>(null)
  useEffect(() => { setToday(formatDate(todayLocal())) }, [])
  const t = today ?? ''
  const dob = state.dob, from = state.from || t, to = state.to || t, start = state.start || t

  const out = useMemo<{ error?: string; stats: Array<{ label: string; value: string; sub?: string }>; lines: string[]; text: string }>(() => {
    const empty = { stats: [], lines: [], text: '' }
    if (!today) return empty
    const bad = (error: string) => ({ ...empty, error })
    try {
      if (state.mode === 'age') {
        const p = parseDate(dob); if (!p) return dob ? bad('That date of birth is not valid.') : empty
        const a = ageOn(p, parseDate(today)!)
        return {
          stats: [{ label: 'Your age', value: ymdText(a.age) }, { label: 'Next birthday', value: a.nextBirthday.daysUntil === 1 ? 'Tomorrow' : `in ${plural(a.nextBirthday.daysUntil, 'day')}`, sub: `${pretty(a.nextBirthday.date)} (${a.nextBirthday.weekday}), turning ${a.nextBirthday.turning}` }, { label: 'Born on a', value: a.bornOn }],
          lines: [`That is ${plural(a.totalMonths, 'month')}, ${plural(a.totalWeeks, 'week')} or ${plural(a.totalDays, 'day')} in all.`, ...(parseDate(dob)!.m === 2 && parseDate(dob)!.d === 29 ? ['Born on 29 February: in years without one, the birthday is counted on 1 March.'] : [])],
          text: `Born ${pretty(p)}. Age today: ${ymdText(a.age)}. Next birthday in ${plural(a.nextBirthday.daysUntil, 'day')} (${pretty(a.nextBirthday.date)}).`,
        }
      }
      if (state.mode === 'diff') {
        const a = parseDate(from), b = parseDate(to); if (!a || !b) return bad('Choose two valid dates.')
        const d = dateDifference(a, b)
        return {
          stats: [{ label: 'Difference', value: plural(d.days, 'day') }, { label: 'In years, months, days', value: ymdText(d.duration) }, { label: 'Working days (Mon–Fri)', value: formatIN(d.weekdays, 0), sub: 'excludes public holidays' }],
          lines: [`${plural(d.weeks, 'week')}${d.remainderDays ? ` and ${plural(d.remainderDays, 'day')}` : ''}. The start date is counted, the end date is not.${d.swapped ? ' (The dates were in reverse order, so they were swapped.)' : ''}`],
          text: `From ${pretty(d.swapped ? b : a)} to ${pretty(d.swapped ? a : b)}: ${plural(d.days, 'day')} (${ymdText(d.duration)}), ${formatIN(d.weekdays, 0)} working days.`,
        }
      }
      const s = parseDate(start); if (!s) return bad('Choose a valid start date.')
      const delta = { years: Math.max(0, Math.round(parseNum(state.y || '0'))), months: Math.max(0, Math.round(parseNum(state.m || '0'))), days: Math.max(0, Math.round(parseNum(state.d || '0'))) }
      if (![delta.years, delta.months, delta.days].every(Number.isFinite)) return bad('Enter whole numbers.')
      if (delta.years > 300 || delta.months > 3000 || delta.days > 100000) return bad('That is too far from the start date.')
      const sign = state.op === 'sub' ? -1 : 1
      const r = shiftDate(s, delta, sign)
      return { stats: [{ label: 'Result', value: pretty(r), sub: weekdayName(r) }], lines: [`${pretty(s)} ${sign === 1 ? '+' : '−'} ${ymdText(delta)}. If the day does not exist in the target month, the last day of that month is used.`], text: `${pretty(s)} ${sign === 1 ? 'plus' : 'minus'} ${ymdText(delta)} is ${pretty(r)} (${weekdayName(r)}).` }
    } catch (e) {
      return bad(e instanceof RangeError ? e.message : 'Could not calculate that.')
    }
  }, [state, dob, from, to, start, today])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <Segmented label="Mode" value={state.mode as 'age' | 'diff' | 'shift'} onChange={(v) => set({ mode: v })} options={[{ value: 'age', label: 'Age' }, { value: 'diff', label: 'Between dates' }, { value: 'shift', label: 'Add / subtract' }]} />
          {state.mode === 'age' && <DateInput label="Date of birth" value={dob} onChange={(v) => set({ dob: v })} />}
          {state.mode === 'diff' && <><DateInput label="From" value={from} onChange={(v) => set({ from: v })} /><DateInput label="To" value={to} onChange={(v) => set({ to: v })} /></>}
          {state.mode === 'shift' && (
            <>
              <DateInput label="Start date" value={start} onChange={(v) => set({ start: v })} />
              <Segmented label="Operation" value={state.op as 'add' | 'sub'} onChange={(v) => set({ op: v })} options={[{ value: 'add', label: 'Add' }, { value: 'sub', label: 'Subtract' }]} />
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Years" value={state.y} onChange={(v) => set({ y: v })} inputMode="numeric" />
                <NumberField label="Months" value={state.m} onChange={(v) => set({ m: v })} inputMode="numeric" />
                <NumberField label="Days" value={state.d} onChange={(v) => set({ d: v })} inputMode="numeric" />
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="min-w-0 space-y-6">
        {out.error && <ErrorNote>{out.error}</ErrorNote>}
        {out.stats.length > 0 ? (
          <Card>
            <div className="grid gap-3 sm:grid-cols-3">{out.stats.map((s) => <Stat key={s.label} label={s.label} value={s.value} sub={s.sub} />)}</div>
            {out.lines.map((l) => <p key={l} className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{l}</p>)}
            <div className="mt-5"><ShareBar getSummary={() => out.text} getLink={link} /></div>
          </Card>
        ) : !out.error && <Note>{state.mode === 'age' ? 'Choose your date of birth to see your exact age and a countdown to your next birthday.' : 'Choose the dates to see the result.'}</Note>}
        <Note>Dates are plain calendar dates, so time zones and daylight saving cannot shift a day. Working days count Monday to Friday only: public holidays differ by state and year and are not included.</Note>
      </div>
    </div>
  )
}
