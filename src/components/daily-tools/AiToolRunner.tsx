'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Download, Loader2, Printer, Send, Share2, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

import { authFetch } from '@/lib/auth-fetch'
import { AI_SPECS, defaultValues, type FieldDef, type Values } from '@/lib/daily-tools/ai/forms'
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/daily-tools/languages'
import type { ToolPeer } from '@/lib/daily-tools/categories'
import { getSummary } from '@/lib/growth/client'
import { Card, CopyButton, ErrorNote, Field, inputClass, SelectField, whatsappUrl } from './ui'
import { addToHistory, clearHistory, loadHistory, setHandoff, takeHandoff, type HistoryItem } from './history'

const TomatoMarkdown = dynamic(() => import('@/components/TomatoMarkdown'), { ssr: false, loading: () => <div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" /> })

const REFINE_CHIPS: Array<{ key: string; label: string; hideFor?: string[] }> = [
  { key: 'shorter', label: 'Shorter' },
  { key: 'simpler', label: 'Simpler' },
  { key: 'formal', label: 'More formal' },
  { key: 'friendlier', label: 'Friendlier' },
  { key: 'detailed', label: 'More detail' },
  { key: 'actionable', label: 'More practical', hideFor: ['translator', 'rewrite-fix', 'letter-writer', 'reply-assistant', 'caption-writer'] },
  { key: 'hindi', label: 'In Hindi', hideFor: ['translator'] },
  { key: 'hinglish', label: 'In Hinglish', hideFor: ['translator'] },
  { key: 'english', label: 'In English', hideFor: ['translator'] },
]

interface RunError { message: string; kind: 'quota' | 'auth' | 'other' }

/** A recognisable name for a saved result: what the person typed, not the tone or length they picked. */
function historyLabel(spec: (typeof AI_SPECS)[string], item: HistoryItem): string {
  const typed = spec.fields.find((f) => (f.kind === 'text' || f.kind === 'textarea') && item.values[f.id])
  if (typed) return item.values[typed.id].replace(/\s+/g, ' ').slice(0, 70)
  const picked = spec.fields.filter((f) => f.kind !== 'number' && item.values[f.id]).slice(0, 2).map((f) => item.values[f.id])
  return picked.length ? picked.join(' · ') : spec.resultTitle
}

function stamp(at: number): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(at))
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const label = field.label
  if (field.kind === 'select') {
    return <SelectField label={label} value={value} onChange={onChange} options={field.options ?? []} />
  }
  if (field.kind === 'textarea') {
    return (
      <Field label={label} htmlFor={`f-${field.id}`} hint={<span className="tabular-nums">{value.length}/{field.max}</span>}>
        <textarea id={`f-${field.id}`} value={value} rows={field.rows ?? 4} maxLength={field.max} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y`} />
      </Field>
    )
  }
  if (field.kind === 'number') {
    return (
      <Field label={label} htmlFor={`f-${field.id}`}>
        <input id={`f-${field.id}`} value={value} inputMode="numeric" autoComplete="off" placeholder={field.placeholder} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass} />
      </Field>
    )
  }
  return (
    <Field label={label} htmlFor={`f-${field.id}`}>
      <input id={`f-${field.id}`} value={value} maxLength={field.max} placeholder={field.placeholder} autoComplete="off" onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  )
}

export default function AiToolRunner({ slug, peers }: { slug: string; peers: ToolPeer[] }) {
  const spec = AI_SPECS[slug]
  const router = useRouter()
  const [values, setValues] = useState<Values>(() => defaultValues(spec))
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [versions, setVersions] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<RunError | null>(null)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const alive = useRef(true)
  const resultRef = useRef<HTMLDivElement>(null)

  const current = versions[index] ?? ''
  const targets = peers.filter((t) => t.slug !== slug && t.handoff)

  useEffect(() => {
    alive.current = true
    setHistory(loadHistory(slug))
    const handed = takeHandoff(slug)
    if (handed && spec.handoffField) {
      setValues((v) => ({ ...v, [spec.handoffField as string]: handed.text }))
      toast.success(`Text from ${peers.find((t) => t.slug === handed.from)?.name ?? 'another tool'} added`)
    }
    getSummary().then((s) => {
      if (!alive.current) return
      setSignedIn(s !== null)
      setRemaining(s?.remaining ? s.remaining.tool : null)
    })
    return () => { alive.current = false }
  }, [slug, spec.handoffField])

  const missingRequired = useCallback(() => spec.fields.find((f) => f.required && !(values[f.id] ?? '').trim()), [spec.fields, values])

  const run = useCallback(async (refineKey?: string) => {
    if (busy) return
    const missing = refineKey ? undefined : missingRequired()
    if (missing) { setError({ message: `${missing.label.replace(/\s*\(optional\)/, '')} is required.`, kind: 'other' }); return }
    setError(null)
    setBusy(refineKey ?? 'run')
    try {
      const res = await authFetch('/api/daily-tools/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: slug, values, language, ...(refineKey ? { refine: { instruction: refineKey, previous: current } } : {}) }),
      })
      const json = (await res.json().catch(() => ({}))) as { text?: string; error?: string; code?: string }
      const left = res.headers.get('x-quota-remaining')
      if (left !== null && alive.current) setRemaining(Number(left))
      if (!alive.current) return
      if (res.ok && json.text) {
        // A refinement continues from the version being viewed; a fresh run starts a new list.
        const next = [...(refineKey ? versions.slice(0, index + 1) : []), json.text]
        setVersions(next)
        setIndex(next.length - 1)
        setHistory(addToHistory(slug, { values, language, text: json.text }))
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      } else if (res.status === 401) {
        setSignedIn(false)
        setError({ message: 'Please sign in to use this tool. It is free to start.', kind: 'auth' })
      } else if (res.status === 429) {
        setError({ message: json.error || 'You have used today\'s free runs.', kind: 'quota' })
        setRemaining(0)
      } else {
        setError({ message: json.error || 'Something went wrong. Please try again.', kind: 'other' })
      }
    } catch {
      if (alive.current) setError({ message: 'Could not reach the server. Check your connection and try again.', kind: 'other' })
    } finally {
      if (alive.current) setBusy(null)
    }
  }, [busy, missingRequired, slug, values, language, current, index, versions])

  const restore = (item: HistoryItem) => {
    setValues({ ...defaultValues(spec), ...item.values })
    setLanguage(item.language)
    setVersions([item.text]); setIndex(0); setError(null)
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const download = () => {
    const blob = new Blob([current], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const sendTo = (target: string) => { setHandoff(slug, target, current); router.push(`/tools/${target}`) }
  const loginHref = `/login?redirect=${encodeURIComponent(`/tools/${slug}`)}`

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="space-y-6 print:hidden">
        <Card>
          <form onSubmit={(e) => { e.preventDefault(); void run() }} className="space-y-4">
            {spec.fields.map((f) => <FieldInput key={f.id} field={f} value={values[f.id] ?? ''} onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))} />)}
            {spec.language === 'output' && (
              <SelectField
                label="Write the result in"
                value={language}
                onChange={setLanguage}
                options={LANGUAGES.map((l) => ({ value: l.id, label: l.id === 'en' || l.id === 'hinglish' ? l.label : `${l.label} (${l.native})` }))}
                hint="Hinglish is Hindi written in English letters, like WhatsApp messages."
              />
            )}

            {error && (
              <ErrorNote>
                {error.message}{' '}
                {error.kind === 'auth' && <Link href={loginHref} className="font-semibold underline">Sign in</Link>}
                {error.kind === 'quota' && <><Link href="/pricing" className="font-semibold underline">See plans</Link> or <Link href="/account#referral" className="font-semibold underline">invite a friend for bonus runs</Link>.</>}
              </ErrorNote>
            )}

            {signedIn === false ? (
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 text-sm">
                <p className="font-medium">Sign in to use this tool</p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">It is free to start. Signing in lets us give you a fair daily allowance.</p>
                <div className="mt-3 flex gap-2">
                  <Link href={loginHref} className="rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-5 py-2 text-sm font-semibold text-white">Sign in</Link>
                  <Link href={`/register?redirect=${encodeURIComponent(`/tools/${slug}`)}`} className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium dark:border-zinc-700">Create account</Link>
                </div>
              </div>
            ) : (
              <button type="submit" disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60">
                {busy === 'run' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {busy === 'run' ? 'Working…' : spec.action}
              </button>
            )}

            <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <button type="button" onClick={() => { setValues({ ...defaultValues(spec), ...spec.example }); setError(null) }} className="font-medium underline-offset-2 hover:underline">Try an example</button>
              {remaining !== null && signedIn && <span>{remaining} AI run{remaining === 1 ? '' : 's'} left today</span>}
            </div>
          </form>
        </Card>

        {history.length > 0 && (
          <Card title="Your recent results">
            <ul className="space-y-1">
              {history.map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => restore(h)} className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <span className="block truncate font-medium">{historyLabel(spec, h)}</span>
                    <span className="text-xs text-zinc-500">{stamp(h.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Saved only in this browser.</span>
              <button type="button" onClick={() => { clearHistory(slug); setHistory([]) }} className="inline-flex items-center gap-1 font-medium hover:text-red-600"><Trash2 className="h-3.5 w-3.5" />Clear</button>
            </div>
          </Card>
        )}
      </div>

      <div ref={resultRef} className="min-w-0 scroll-mt-24">
        {current ? (
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <h2 className="text-lg font-semibold">{spec.resultTitle}</h2>
              {versions.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-zinc-500" aria-label="Versions">
                  <button type="button" aria-label="Previous version" disabled={index === 0} onClick={() => setIndex(index - 1)} className="rounded-full p-1 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="tabular-nums">Version {index + 1} of {versions.length}</span>
                  <button type="button" aria-label="Next version" disabled={index === versions.length - 1} onClick={() => setIndex(index + 1)} className="rounded-full p-1 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ChevronRight className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 [&_h1]:text-xl [&_h2]:mt-5 [&_h2]:text-lg [&_h3]:text-base" data-testid="ai-result">
              <TomatoMarkdown content={current} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800 print:hidden">
              <CopyButton text={current} label="Copy" />
              <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Download className="h-4 w-4" />Download</button>
              <button type="button" onClick={() => window.open(whatsappUrl(current), '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"><Share2 className="h-4 w-4" />WhatsApp</button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Printer className="h-4 w-4" />Print</button>
              {targets.length > 0 && (
                <details className="relative">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Send className="h-4 w-4" />Send to…</summary>
                  <div className="absolute left-0 z-20 mt-2 w-60 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    {targets.map((t) => <button key={t.slug} type="button" onClick={() => sendTo(t.slug)} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">{t.name}</button>)}
                  </div>
                </details>
              )}
            </div>

            <div className="mt-4 print:hidden">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500"><Wand2 className="h-3.5 w-3.5" />Refine it (each uses one AI run)</p>
              <div className="flex flex-wrap gap-2">
                {REFINE_CHIPS.filter((c) => !c.hideFor?.includes(slug)).map((c) => (
                  <button key={c.key} type="button" disabled={busy !== null || signedIn === false} onClick={() => void run(c.key)} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-orange-500/15 disabled:opacity-50 dark:bg-zinc-800 dark:hover:bg-orange-500/20">
                    {busy === c.key && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{c.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-5 text-xs text-zinc-500 print:hidden">AI can make mistakes. Check names, dates, amounts and anything important before you use it.</p>
          </Card>
        ) : (
          <Card className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <Sparkles className="mb-3 h-8 w-8 text-orange-500" />
            <p className="font-medium">Your result will appear here</p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">Fill in the form and press “{spec.action}”. You can then refine it, copy it, print it or send it on WhatsApp.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
