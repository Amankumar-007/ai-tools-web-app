'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Coffee, Copy, Plus, Printer, Trash2, Utensils } from 'lucide-react'

import { formatDate, todayLocal } from '@/lib/daily-tools/calc/dates'
import { DEFAULT_SETTINGS, formatDuration, formatTime12, isIsoDate, LIMITS, parseTime, planDay, toIcs, toScheduleCsv, toScheduleText, validateTask, type PlanBlock, type PlanSettings, type PlanTask, type Priority } from '@/lib/daily-tools/planner'
import { downloadBlob } from '../download'
import { useLocalStorage } from '../hooks'
import { Card, copyText, ErrorNote, Field, inputClass, Note, Stat } from '../ui'

interface Row { id: string; title: string; minutes: string; priority: Priority; start: string }
interface Saved { rows: Row[]; settings: PlanSettings }
let seq = 0
const newRow = (over: Partial<Row> = {}): Row => ({ id: `t${++seq}${Date.now().toString(36)}`, title: '', minutes: '30', priority: 2, start: '', ...over })

const EXAMPLE: Row[] = [
  newRow({ title: 'Finish quarterly report', minutes: '120', priority: 3 }),
  newRow({ title: 'Reply to emails', minutes: '30', priority: 2 }),
  newRow({ title: 'Team stand-up', minutes: '15', priority: 2, start: '10:00' }),
  newRow({ title: 'Client call', minutes: '45', priority: 3, start: '15:00' }),
  newRow({ title: 'Gym', minutes: '60', priority: 1 }),
]

const PRIORITY_STYLE: Record<Priority, string> = { 3: 'border-l-red-500 bg-red-500/10', 2: 'border-l-orange-500 bg-orange-500/10', 1: 'border-l-sky-500 bg-sky-500/10' }
const PRIORITY_LABEL: Record<Priority, string> = { 3: 'High', 2: 'Medium', 1: 'Low' }

function Timeline({ blocks, dayStart, dayEnd }: { blocks: PlanBlock[]; dayStart: number; dayEnd: number }) {
  const span = dayEnd - dayStart; const PX = 1.4 // pixels per minute
  const hours: number[] = []; for (let h = Math.ceil(dayStart / 60); h * 60 <= dayEnd; h++) hours.push(h)
  return (
    <div className="relative ml-14" style={{ height: span * PX }} role="list" aria-label="Your schedule">
      {hours.map((h) => <div key={h} className="absolute left-0 right-0 border-t border-zinc-200 dark:border-zinc-800" style={{ top: (h * 60 - dayStart) * PX }}><span className="absolute -left-14 -top-2.5 w-12 text-right text-[11px] tabular-nums text-zinc-400">{formatTime12(h * 60)}</span></div>)}
      {blocks.map((b, i) => {
        const h = Math.max((b.end - b.start) * PX - 2, 14)
        const isBreak = b.kind === 'break' || b.kind === 'lunch'
        return (
          <div key={`${b.start}-${i}`} role="listitem" className={`absolute left-1 right-1 overflow-hidden rounded-lg border-l-4 px-3 py-1 text-sm ${isBreak ? 'border-l-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : PRIORITY_STYLE[b.priority ?? 2]} ${b.kind === 'fixed' ? 'ring-1 ring-zinc-400/50' : ''}`} style={{ top: (b.start - dayStart) * PX + 1, height: h }} title={`${formatTime12(b.start)} - ${formatTime12(b.end)}`}>
            <p className="flex items-center gap-1.5 truncate font-medium">{b.kind === 'lunch' ? <Utensils className="h-3.5 w-3.5 shrink-0" /> : b.kind === 'break' ? <Coffee className="h-3.5 w-3.5 shrink-0" /> : null}{b.title}{b.part ? ` (${b.part.index}/${b.part.of})` : ''}{b.kind === 'fixed' && <span className="rounded bg-zinc-900/10 px-1 text-[10px] font-semibold uppercase dark:bg-white/10">fixed</span>}</p>
            {h >= 34 && <p className="text-xs opacity-70">{formatTime12(b.start)} – {formatTime12(b.end)} · {formatDuration(b.end - b.start)}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default function DayPlanner() {
  const [saved, save, ready] = useLocalStorage<Saved>('tomato_day_planner_v1', { rows: [], settings: DEFAULT_SETTINGS })
  const [rows, setRows] = useState<Row[]>([newRow()])
  const [settings, setSettings] = useState<PlanSettings>(DEFAULT_SETTINGS)
  const [date, setDate] = useState('')
  const [reminder, setReminder] = useState('10')
  const [withBreaks, setWithBreaks] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!ready || loaded) return
    if (saved.rows?.length) setRows(saved.rows.map((r) => ({ ...newRow(), ...r })).slice(0, LIMITS.maxTasks))
    if (saved.settings) setSettings({ ...DEFAULT_SETTINGS, ...saved.settings })
    setDate(formatDate(todayLocal())); setLoaded(true)
  }, [ready, loaded, saved])
  useEffect(() => { if (loaded) save({ rows, settings }) }, [rows, settings, loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const tasks: PlanTask[] = useMemo(() => rows.filter((r) => r.title.trim() !== '' || r.minutes !== '30' || r.start !== '').map((r) => ({ id: r.id, title: r.title, minutes: Number(r.minutes), priority: r.priority, ...(r.start ? { start: r.start } : {}) })), [rows])
  const plan = useMemo(() => planDay(tasks.filter((t) => t.title.trim() !== ''), settings), [tasks, settings])
  const dayStart = parseTime(settings.dayStart) ?? 540; const dayEnd = parseTime(settings.dayEnd) ?? 1080
  const setS = (patch: Partial<PlanSettings>) => setSettings((s) => ({ ...s, ...patch }))
  const setRow = (id: string, patch: Partial<Row>) => setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const dateOk = isIsoDate(date)
  const rowError = (r: Row) => (r.title.trim() === '' ? null : validateTask({ id: r.id, title: r.title, minutes: Number(r.minutes), priority: r.priority, start: r.start || undefined }))
  const hasTasks = plan.blocks.some((b) => b.kind === 'task' || b.kind === 'fixed')

  const exportIcs = () => { if (dateOk) downloadBlob(toIcs(plan.blocks, { date, includeBreaks: withBreaks, reminderMinutes: Number(reminder) || 0, now: new Date() }), `plan-${date}.ics`, 'text/calendar') }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="space-y-6">
          <Card title="Your tasks">
            <ul className="space-y-3">
              {rows.map((r, i) => {
                const err = rowError(r)
                return (
                  <li key={r.id} className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="grid gap-3 sm:grid-cols-[1fr_5.5rem_7rem_6rem_auto]">
                      <input aria-label={`Task ${i + 1} name`} value={r.title} maxLength={80} onChange={(e) => setRow(r.id, { title: e.target.value })} placeholder="What needs doing?" className={inputClass} />
                      <div className="relative"><input aria-label={`Task ${i + 1} minutes`} value={r.minutes} inputMode="numeric" onChange={(e) => setRow(r.id, { minutes: e.target.value.replace(/\D/g, '').slice(0, 3) })} className={`${inputClass} pr-10`} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">min</span></div>
                      <select aria-label={`Task ${i + 1} priority`} value={r.priority} onChange={(e) => setRow(r.id, { priority: Number(e.target.value) as Priority })} className={inputClass}>{([3, 2, 1] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}</select>
                      <input aria-label={`Task ${i + 1} fixed time (optional)`} type="time" value={r.start} onChange={(e) => setRow(r.id, { start: e.target.value })} className={inputClass} title="Optional: pin this task to a time" />
                      <button type="button" aria-label={`Remove task ${i + 1}`} onClick={() => setRows((cur) => (cur.length === 1 ? [newRow()] : cur.filter((x) => x.id !== r.id)))} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={rows.length >= LIMITS.maxTasks} onClick={() => setRows((cur) => [...cur, newRow()])} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"><Plus className="h-4 w-4" />Add task</button>
              <button type="button" onClick={() => setRows(EXAMPLE.map((r) => ({ ...r, id: newRow().id })))} className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Try an example</button>
              <button type="button" onClick={() => { if (rows.some((r) => r.title.trim()) ? window.confirm('Clear all tasks?') : true) setRows([newRow()]) }} className="rounded-full px-4 py-2 text-sm font-medium text-zinc-500 hover:text-red-600">Clear</button>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Set a time on a task to pin it (a meeting, a call). Everything else is fitted around it, most important first. Saved only in this browser.</p>
          </Card>

          <Card>
            <button type="button" onClick={() => setShowSettings((v) => !v)} aria-expanded={showSettings} className="flex w-full items-center justify-between text-left text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Your day {showSettings ? '▲' : '▼'}</button>
            {showSettings && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Day starts" htmlFor="pl-start"><input id="pl-start" type="time" value={settings.dayStart} onChange={(e) => setS({ dayStart: e.target.value })} className={inputClass} /></Field>
                <Field label="Day ends" htmlFor="pl-end"><input id="pl-end" type="time" value={settings.dayEnd} onChange={(e) => setS({ dayEnd: e.target.value })} className={inputClass} /></Field>
                <Field label="Lunch at (empty = none)" htmlFor="pl-lunch"><input id="pl-lunch" type="time" value={settings.lunchStart} onChange={(e) => setS({ lunchStart: e.target.value })} className={inputClass} /></Field>
                <Field label="Lunch length (min)" htmlFor="pl-lm"><input id="pl-lm" inputMode="numeric" value={settings.lunchMinutes} onChange={(e) => setS({ lunchMinutes: Number(e.target.value.replace(/\D/g, '').slice(0, 3)) })} className={inputClass} /></Field>
                <Field label="Break after (min of focus, 0 = never)" htmlFor="pl-be"><input id="pl-be" inputMode="numeric" value={settings.breakEvery} onChange={(e) => setS({ breakEvery: Number(e.target.value.replace(/\D/g, '').slice(0, 3)) })} className={inputClass} /></Field>
                <Field label="Break length (min)" htmlFor="pl-bm"><input id="pl-bm" inputMode="numeric" value={settings.breakMinutes} onChange={(e) => setS({ breakMinutes: Number(e.target.value.replace(/\D/g, '').slice(0, 3)) })} className={inputClass} /></Field>
                <Field label="Gap after each task (min)" htmlFor="pl-bf"><input id="pl-bf" inputMode="numeric" value={settings.buffer} onChange={(e) => setS({ buffer: Number(e.target.value.replace(/\D/g, '').slice(0, 2)) })} className={inputClass} /></Field>
                <button type="button" onClick={() => setSettings(DEFAULT_SETTINGS)} className="self-end rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Reset to defaults</button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {plan.settingsError && <ErrorNote>{plan.settingsError}</ErrorNote>}
          <Card title="Your plan">
            <div className="mb-4 grid grid-cols-3 gap-3">
              <Stat label="Focus time" value={formatDuration(plan.focusMinutes)} />
              <Stat label="Free time" value={formatDuration(plan.freeMinutes)} />
              <Stat label="Tasks" value={String(new Set(plan.blocks.filter((b) => b.taskId).map((b) => b.taskId)).size)} />
            </div>
            {hasTasks ? <Timeline blocks={plan.blocks} dayStart={dayStart} dayEnd={dayEnd} /> : <p className="py-10 text-center text-sm text-zinc-500">Add tasks with a name and time to see your day take shape. <button type="button" onClick={() => setRows(EXAMPLE.map((r) => ({ ...r, id: newRow().id })))} className="font-medium underline">Try an example</button>.</p>}
          </Card>

          {plan.problems.length > 0 && (
            <Card title="Needs attention">
              <ul className="space-y-2 text-sm" data-testid="plan-problems">
                {plan.problems.map((p, i) => <li key={`${p.taskId}-${i}`} className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2"><strong>{p.title}</strong>: {p.reason}{p.minutesLeft > 0 && !/between 5|name|14:30/.test(p.reason) ? ` (${formatDuration(p.minutesLeft)} left over)` : ''}</li>)}
              </ul>
            </Card>
          )}

          {hasTasks && (
            <Card title="Take it with you">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date" htmlFor="pl-date"><input id="pl-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></Field>
                <Field label="Reminder" htmlFor="pl-rem"><select id="pl-rem" value={reminder} onChange={(e) => setReminder(e.target.value)} className={inputClass}><option value="0">None</option><option value="5">5 min before</option><option value="10">10 min before</option><option value="15">15 min before</option></select></Field>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={withBreaks} onChange={(e) => setWithBreaks(e.target.checked)} className="h-4 w-4 accent-orange-500" />Also add lunch and breaks to the calendar</label>
              <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                <button type="button" disabled={!dateOk} onClick={exportIcs} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"><CalendarPlus className="h-4 w-4" />Add to calendar (.ics)</button>
                <button type="button" disabled={!dateOk} onClick={() => void copyText(toScheduleText(plan.blocks, date), 'Schedule copied')} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"><Copy className="h-4 w-4" />Copy</button>
                <button type="button" disabled={!dateOk} onClick={() => downloadBlob(toScheduleCsv(plan.blocks, date), `plan-${date}.csv`, 'text/csv')} className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800">CSV</button>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Printer className="h-4 w-4" />Print</button>
              </div>
              {!dateOk && <p className="mt-2 text-xs text-red-600">Choose a valid date to export.</p>}
              <p className="mt-3 text-xs text-zinc-500">The .ics file opens in Google Calendar, Apple Calendar and Outlook (import it once to add the whole day).</p>
            </Card>
          )}
        </div>
      </div>
      <Note>This plans a single day from the times and priorities you give it. It is a starting point: estimates are yours, travel time is not included, and nothing is sent anywhere (your tasks stay in this browser).</Note>
    </div>
  )
}
