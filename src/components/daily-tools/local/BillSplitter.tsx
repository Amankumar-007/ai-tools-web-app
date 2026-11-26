'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

import { formatINR } from '@/lib/daily-tools/calc/format'
import { settleGroup, simpleSplit, validateExpense, validateSimpleSplit, type Expense } from '@/lib/daily-tools/calc/split'
import { useLocalStorage, useShareableState } from '../hooks'
import { Card, ErrorNote, Field, inputClass, NumberField, Note, parseNum, Segmented, SelectField, ShareBar, Stat } from '../ui'

interface Group { people: string[]; expenses: Expense[] }
const EMPTY_GROUP: Group = { people: [], expenses: [] }
/** Whatever is in storage may be stale, hand-edited or from an older version: keep only what is valid. */
function sanitizeGroup(raw: unknown): Group {
  if (!raw || typeof raw !== 'object') return EMPTY_GROUP
  const r = raw as { people?: unknown; expenses?: unknown }
  const people = Array.isArray(r.people) ? [...new Set(r.people.filter((p): p is string => typeof p === 'string' && p.trim() !== '').map((p) => p.trim().slice(0, 30)))].slice(0, 30) : []
  const expenses = (Array.isArray(r.expenses) ? r.expenses : []).filter((e): e is Expense => {
    if (!e || typeof e !== 'object') return false
    const x = e as Expense
    return typeof x.id === 'string' && typeof x.description === 'string' && typeof x.payer === 'string' && typeof x.amount === 'number' && Array.isArray(x.among) && x.among.every((a) => typeof a === 'string') && validateExpense(x, people) === null
  }).slice(0, 300)
  return { people, expenses }
}

const QUICK_DEFAULTS = { total: '2400', people: '4', tip: '10', tax: '0', round: 'no' }

function QuickSplit() {
  const { state, set, link } = useShareableState(QUICK_DEFAULTS)
  const input = useMemo(() => ({ total: parseNum(state.total), people: Math.round(parseNum(state.people)), tipPct: parseNum(state.tip || '0'), taxPct: parseNum(state.tax || '0'), roundUpPerPerson: state.round === 'yes' }), [state])
  const error = useMemo(() => validateSimpleSplit(input), [input])
  const r = useMemo(() => (error ? null : simpleSplit(input)), [error, input])
  const summary = () => r ? `Bill split\nBill ${formatINR(r.subtotal, true)} + tax ${formatINR(r.tax, true)} + tip ${formatINR(r.tip, true)} = ${formatINR(r.grand, true)}\n${input.people} people: ${formatINR(r.perPerson, true)} each` : ''
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Card className="print:hidden">
        <div className="space-y-4">
          <NumberField label="Bill amount" prefix="₹" value={state.total} onChange={(v) => set({ total: v })} />
          <NumberField label="Number of people" value={state.people} onChange={(v) => set({ people: v })} inputMode="numeric" />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Tip" suffix="%" value={state.tip} onChange={(v) => set({ tip: v })} />
            <NumberField label="Extra tax / service" suffix="%" value={state.tax} onChange={(v) => set({ tax: v })} />
          </div>
          <Segmented label="Rounding" value={state.round as 'yes' | 'no'} onChange={(v) => set({ round: v })} options={[{ value: 'no', label: 'Exact' }, { value: 'yes', label: 'Round up to ₹1 each' }]} />
        </div>
      </Card>
      <div className="min-w-0 space-y-6">
        {error && <ErrorNote>{error}</ErrorNote>}
        {r && (
          <Card>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Each person pays" value={formatINR(r.perPerson, true)} tone="good" />
              <Stat label="Grand total" value={formatINR(r.grand, true)} sub={`bill ${formatINR(r.subtotal, true)} + tax ${formatINR(r.tax, true)} + tip ${formatINR(r.tip, true)}`} />
              <Stat label={r.roundingExtra > 0 ? 'Extra from rounding' : 'Rounding left over'} value={formatINR(r.roundingExtra, true)} />
            </div>
            {!input.roundUpPerPerson && new Set(r.shares).size > 1 && <p className="mt-4 text-xs text-zinc-500">The bill does not divide evenly, so {r.shares.filter((s) => s === r.perPerson).length} {r.shares.filter((s) => s === r.perPerson).length === 1 ? 'person pays' : 'people pay'} {formatINR(r.perPerson, true)} and the rest pay one paisa less. The total is exact.</p>}
            <div className="mt-5"><ShareBar getSummary={summary} getLink={link} /></div>
          </Card>
        )}
      </div>
    </div>
  )
}

function GroupSplit() {
  const [stored, setGroup, ready] = useLocalStorage<Group>('tomato_split_group_v1', EMPTY_GROUP)
  const group = useMemo(() => sanitizeGroup(stored), [stored])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [among, setAmong] = useState<string[] | null>(null) // null = everyone
  const [formError, setFormError] = useState<string | null>(null)

  const people = group.people
  const sharing = among ?? people
  const payerValue = people.includes(payer) ? payer : people[0] ?? ''

  const result = useMemo(() => { try { return settleGroup(people, group.expenses) } catch { return null } }, [people, group.expenses])

  const addPerson = () => {
    const n = name.trim().replace(/\s+/g, ' ').slice(0, 30)
    if (!n) return
    if (people.some((p) => p.toLowerCase() === n.toLowerCase())) { setFormError(`${n} is already in the group.`); return }
    if (people.length >= 30) { setFormError('A group can have up to 30 people.'); return }
    setGroup({ ...group, people: [...people, n] }); setName(''); setFormError(null)
  }
  const removePerson = (p: string) => {
    if (group.expenses.some((e) => e.payer === p || e.among.includes(p))) { setFormError(`${p} is part of an expense. Remove those expenses first.`); return }
    setGroup({ ...group, people: people.filter((x) => x !== p) }); setAmong(null); setFormError(null)
  }
  const addExpense = () => {
    const e: Expense = { id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, description: desc.trim().slice(0, 60) || 'Expense', payer: payerValue, amount: parseNum(amount), among: [...sharing] }
    const problem = validateExpense(e, people)
    if (problem) { setFormError(problem); return }
    if (group.expenses.length >= 300) { setFormError('That is a lot of expenses: start a new group.'); return }
    setGroup({ ...group, expenses: [...group.expenses, e] }); setDesc(''); setAmount(''); setAmong(null); setFormError(null)
  }

  const summary = () => {
    if (!result) return ''
    const lines = [`Group expenses: total ${formatINR(result.totalSpent, true)}`]
    for (const p of people) lines.push(`${p}: paid ${formatINR(group.expenses.filter((e) => e.payer === p).reduce((s, e) => s + e.amount, 0), true)}, share ${formatINR(result.shareOf[p] ?? 0, true)}`)
    lines.push('', result.transfers.length ? 'To settle up:' : 'Everyone is settled.')
    for (const t of result.transfers) lines.push(`${t.from} pays ${t.to} ${formatINR(t.amount, true)}`)
    return lines.join('\n')
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="space-y-6 print:hidden">
        <Card title="1. Who is in the group?">
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson() } }} placeholder="Name, then Enter" maxLength={30} aria-label="Add a person" className={inputClass} />
            <button type="button" onClick={addPerson} className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-black"><Plus className="h-4 w-4" />Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {people.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pl-3 pr-1.5 text-sm dark:bg-zinc-800">{p}<button type="button" aria-label={`Remove ${p}`} onClick={() => removePerson(p)} className="rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600"><X className="h-3.5 w-3.5" /></button></span>)}
            {people.length === 0 && <p className="text-sm text-zinc-500">Add at least two people.</p>}
          </div>
        </Card>

        {people.length >= 2 && (
          <Card title="2. Add an expense">
            <div className="space-y-4">
              <Field label="What was it for?" htmlFor="exp-desc"><input id="exp-desc" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={60} placeholder="Hotel, cab, dinner…" className={inputClass} /></Field>
              <NumberField label="Amount" prefix="₹" value={amount} onChange={setAmount} />
              <SelectField label="Who paid?" value={payerValue} onChange={setPayer} options={people.map((p) => ({ value: p, label: p }))} />
              <div>
                <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Split between</p>
                <div className="flex flex-wrap gap-2">
                  {people.map((p) => {
                    const on = sharing.includes(p)
                    return <button key={p} type="button" aria-pressed={on} onClick={() => setAmong(on ? sharing.filter((x) => x !== p) : [...sharing, p])} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${on ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>{p}</button>
                  })}
                </div>
              </div>
              <button type="button" onClick={addExpense} className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white">Add expense</button>
            </div>
          </Card>
        )}
        {formError && <ErrorNote>{formError}</ErrorNote>}
        <p className="text-xs text-zinc-500">Your group is saved only in this browser. <button type="button" onClick={() => { if (window.confirm('Delete this group and all its expenses?')) { setGroup(EMPTY_GROUP); setFormError(null) } }} className="font-medium underline">Start over</button></p>
      </div>

      <div className="min-w-0 space-y-6">
        {group.expenses.length > 0 && (
          <Card title={`Expenses (${group.expenses.length})`}>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {group.expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0"><span className="block truncate font-medium">{e.description}</span><span className="text-xs text-zinc-500">{e.payer} paid · split {e.among.length === people.length ? 'between everyone' : e.among.join(', ')}</span></span>
                  <span className="flex shrink-0 items-center gap-2 tabular-nums"><span className="font-semibold">{formatINR(e.amount, true)}</span><button type="button" aria-label={`Delete ${e.description}`} onClick={() => setGroup({ ...group, expenses: group.expenses.filter((x) => x.id !== e.id) })} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button></span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {result && group.expenses.length > 0 && (
          <Card title="Settle up">
            <div className="grid gap-3 sm:grid-cols-2">
              {people.map((p) => {
                const b = result.balances[p] ?? 0
                return <Stat key={p} label={p} value={b === 0 ? 'Settled' : formatINR(Math.abs(b), true)} sub={b > 0 ? 'gets back' : b < 0 ? 'needs to pay' : `share ${formatINR(result.shareOf[p] ?? 0, true)}`} tone={b > 0 ? 'good' : b < 0 ? 'bad' : 'default'} />
              })}
            </div>
            <h3 className="mb-2 mt-6 text-sm font-semibold">{result.transfers.length ? `${result.transfers.length} payment${result.transfers.length === 1 ? '' : 's'} settle everything` : 'Everyone is settled'}</h3>
            <ul className="space-y-2">
              {result.transfers.map((t, i) => <li key={i} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-800"><strong>{t.from}</strong> pays <strong>{t.to}</strong> <span className="font-semibold tabular-nums">{formatINR(t.amount, true)}</span></li>)}
            </ul>
            <div className="mt-5"><ShareBar getSummary={summary} /></div>
          </Card>
        )}
        {group.expenses.length === 0 && <Note>Add the people, then each expense with who paid and who shared it. You will get everyone’s balance and the fewest payments needed to settle up.</Note>}
      </div>
    </div>
  )
}

export default function BillSplitter() {
  const [tab, setTab] = useState<'quick' | 'group'>('quick')
  return (
    <div className="space-y-6">
      <Segmented label="Splitter type" value={tab} onChange={setTab} options={[{ value: 'quick', label: 'Quick split' }, { value: 'group', label: 'Group expenses' }]} />
      {tab === 'quick' ? <QuickSplit /> : <GroupSplit />}
    </div>
  )
}
