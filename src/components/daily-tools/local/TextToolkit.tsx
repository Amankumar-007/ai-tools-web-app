'use client'

import { useMemo, useState } from 'react'

import { formatIN, rupeesInWords } from '@/lib/daily-tools/calc/format'
import { CASES, CLEANUPS, findReplace, formatMinutes, MAX_TEXT, slugify, textStats, topKeywords, type CaseId, type CleanupId } from '@/lib/daily-tools/calc/text'
import { Card, CopyButton, ErrorNote, Field, inputClass, Note, NumberField, parseNum, Stat } from '../ui'

type Tab = 'count' | 'case' | 'clean' | 'replace' | 'slug' | 'words'

const CASE_LABELS: Record<CaseId, string> = { upper: 'UPPERCASE', lower: 'lowercase', title: 'Title Case', sentence: 'Sentence case', camel: 'camelCase', pascal: 'PascalCase', snake: 'snake_case', kebab: 'kebab-case', constant: 'CONSTANT_CASE' }
const CLEAN_LABELS: Record<CleanupId, string> = { trim: 'Trim each line', collapseSpaces: 'Collapse extra spaces', removeBlankLines: 'Remove blank lines', removeDuplicateLines: 'Remove duplicate lines', sortAZ: 'Sort A → Z', sortZA: 'Sort Z → A', reverseLines: 'Reverse line order', numberLines: 'Number the lines' }

function Output({ value, label = 'Result' }: { value: string; label?: string }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between"><span className="text-sm font-medium">{label}</span><CopyButton text={value} /></div>
      <textarea readOnly value={value} rows={7} aria-label={label} className={`${inputClass} resize-y font-mono`} />
    </div>
  )
}

export default function TextToolkit() {
  const [tab, setTab] = useState<Tab>('count')
  const [text, setText] = useState('')
  const [caseId, setCaseId] = useState<CaseId>('title')
  const [cleanId, setCleanId] = useState<CleanupId>('removeDuplicateLines')
  const [find, setFind] = useState('')
  const [replacement, setReplacement] = useState('')
  const [regex, setRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [amount, setAmount] = useState('123456.50')

  const tooLong = text.length > MAX_TEXT
  const safe = tooLong ? '' : text
  const stats = useMemo(() => textStats(safe), [safe])
  const keywords = useMemo(() => (tab === 'count' ? topKeywords(safe, 8) : []), [tab, safe])
  const cased = useMemo(() => (tab === 'case' ? CASES[caseId](safe) : ''), [tab, caseId, safe])
  const cleaned = useMemo(() => (tab === 'clean' ? CLEANUPS[cleanId](safe) : ''), [tab, cleanId, safe])
  const replaced = useMemo(() => (tab === 'replace' ? findReplace(safe, find, replacement, { regex, caseSensitive }) : { result: '', count: 0 }), [tab, safe, find, replacement, regex, caseSensitive])
  const slug = useMemo(() => (tab === 'slug' ? slugify(safe) : ''), [tab, safe])
  const amountNum = parseNum(amount)
  const words = useMemo(() => { try { return Number.isFinite(amountNum) ? rupeesInWords(amountNum) : '' } catch { return null } }, [amountNum])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Text tools">
        {([['count', 'Count'], ['case', 'Change case'], ['clean', 'Clean up lines'], ['replace', 'Find & replace'], ['slug', 'URL slug'], ['words', 'Amount in words']] as Array<[Tab, string]>).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${tab === id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}>{label}</button>
        ))}
      </div>

      {tab === 'words' ? (
        <Card>
          <div className="max-w-md"><NumberField label="Amount in rupees" prefix="₹" value={amount} onChange={setAmount} hint={Number.isFinite(amountNum) ? `${formatIN(amountNum)} (Indian grouping)` : undefined} /></div>
          {words === null ? <div className="mt-4"><ErrorNote>That number is too large. The limit is just under ₹1 lakh crore.</ErrorNote></div> : words ? <Output value={words} label="In words (for cheques and forms)" /> : <p className="mt-4 text-sm text-zinc-500">Type an amount, for example 123456.50</p>}
        </Card>
      ) : (
        <Card>
          <Field label="Your text" htmlFor="tk-text" hint={<span className="tabular-nums">{text.length.toLocaleString('en-IN')} characters</span>}>
            <textarea id="tk-text" value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Type or paste here. It stays on this device." className={`${inputClass} resize-y`} />
          </Field>
          {tooLong && <div className="mt-3"><ErrorNote>That is more than {MAX_TEXT.toLocaleString('en-IN')} characters. Please use a shorter piece of text.</ErrorNote></div>}

          {tab === 'count' && (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Words" value={stats.words.toLocaleString('en-IN')} />
                <Stat label="Characters" value={stats.characters.toLocaleString('en-IN')} sub={`${stats.charactersNoSpaces.toLocaleString('en-IN')} without spaces`} />
                <Stat label="Sentences" value={stats.sentences.toLocaleString('en-IN')} />
                <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString('en-IN')} sub={`${stats.lines.toLocaleString('en-IN')} lines`} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Stat label="Reading time" value={formatMinutes(stats.readingMinutes)} sub="at 200 words a minute" />
                <Stat label="Speaking time" value={formatMinutes(stats.speakingMinutes)} sub="at 130 words a minute" />
                <Stat label="Unique words" value={stats.uniqueWords.toLocaleString('en-IN')} />
              </div>
              {keywords.length > 0 && (
                <div className="mt-5"><p className="mb-2 text-sm font-medium">Most used words</p><div className="flex flex-wrap gap-2">{keywords.map((k) => <span key={k.word} className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800">{k.word} <span className="text-zinc-500">×{k.count}</span></span>)}</div></div>
              )}
            </div>
          )}

          {tab === 'case' && (
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">{(Object.keys(CASES) as CaseId[]).map((id) => <button key={id} type="button" aria-pressed={caseId === id} onClick={() => setCaseId(id)} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${caseId === id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>{CASE_LABELS[id]}</button>)}</div>
              <Output value={cased} />
            </div>
          )}

          {tab === 'clean' && (
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">{(Object.keys(CLEANUPS) as CleanupId[]).map((id) => <button key={id} type="button" aria-pressed={cleanId === id} onClick={() => setCleanId(id)} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${cleanId === id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>{CLEAN_LABELS[id]}</button>)}</div>
              <Output value={cleaned} />
            </div>
          )}

          {tab === 'replace' && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Find" htmlFor="tk-find"><input id="tk-find" value={find} maxLength={200} onChange={(e) => setFind(e.target.value)} className={inputClass} /></Field>
                <Field label="Replace with" htmlFor="tk-repl"><input id="tk-repl" value={replacement} onChange={(e) => setReplacement(e.target.value)} className={inputClass} /></Field>
              </div>
              <div className="flex flex-wrap gap-5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-orange-500" />Match case</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} className="accent-orange-500" />Regular expression (use $1 for groups)</label>
              </div>
              {replaced.error ? <ErrorNote>{replaced.error}</ErrorNote> : find && <p className="text-sm text-zinc-600 dark:text-zinc-400">{replaced.count} replacement{replaced.count === 1 ? '' : 's'} made.</p>}
              <Output value={replaced.result} />
            </div>
          )}

          {tab === 'slug' && <Output value={slug} label="URL slug" />}
        </Card>
      )}
      <Note>Everything here runs in your browser: your text is never uploaded, so it is safe to paste private notes. Counts treat Hindi and other scripts correctly. A word is any run of letters or digits; a sentence ends at . ! ? or ।</Note>
    </div>
  )
}
