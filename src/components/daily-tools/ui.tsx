'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { Check, Copy, Link2, Printer, Share2 } from 'lucide-react'
import { toast } from 'sonner'

/** Small shared building blocks so all 20 tools look and behave the same. */

export const inputClass =
  'w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500'

export function Card({ children, className = '', title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={`rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</h2>}
      {children}
    </section>
  )
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  )
}

/** Free-typing numeric box (no spinners, no scientific notation). The caller parses it with parseNum. */
export function NumberField({ label, value, onChange, prefix, suffix, hint, placeholder, inputMode = 'decimal' }: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; hint?: ReactNode; placeholder?: string; inputMode?: 'decimal' | 'numeric'
}) {
  const id = useId()
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{prefix}</span>}
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          autoComplete="off"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,\-]/g, '').slice(0, 20))}
          className={`${inputClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400">{suffix}</span>}
      </div>
    </Field>
  )
}

export function SelectField({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; hint?: ReactNode }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string }>; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex w-full flex-wrap gap-1 rounded-2xl border border-zinc-200 bg-zinc-100 p-1 sm:inline-flex sm:w-auto sm:rounded-full dark:border-zinc-800 dark:bg-zinc-900">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors sm:flex-none sm:rounded-full sm:py-1.5 ${value === o.value ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ label, value, sub, tone = 'default' }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const toneClass = tone === 'good' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'warn' ? 'text-amber-600 dark:text-amber-400' : tone === 'bad' ? 'text-red-600 dark:text-red-400' : ''
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`mt-1 break-words text-2xl font-semibold tabular-nums tracking-tight ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
    </div>
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">{children}</p>
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-400">{children}</p>
}

export async function copyText(text: string, successMessage = 'Copied'): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
    return true
  } catch {
    toast.error('Could not copy. Select the text and copy it manually.')
    return false
  }
}

export function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 1800); return () => clearTimeout(t) }, [done])
  return (
    <button
      type="button"
      onClick={async () => { if (await copyText(text)) setDone(true) }}
      className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 ${className}`}
    >
      {done ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      {done ? 'Copied' : label}
    </button>
  )
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text.slice(0, 3500))}`
}

/** Copy the summary, copy a link that reopens the same numbers, send on WhatsApp, or print. */
export function ShareBar({ getSummary, getLink }: { getSummary: () => string; getLink?: () => string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button type="button" onClick={() => void copyText(getSummary(), 'Result copied')} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
        <Copy className="h-4 w-4" /> Copy result
      </button>
      {getLink && (
        <button type="button" onClick={() => void copyText(getLink(), 'Link copied: it reopens these exact numbers')} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <Link2 className="h-4 w-4" /> Copy link
        </button>
      )}
      <button
        type="button"
        onClick={() => window.open(whatsappUrl(`${getSummary()}${getLink ? `
${getLink()}` : ''}`), '_blank', 'noopener,noreferrer')}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3.5 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
      >
        <Share2 className="h-4 w-4" /> WhatsApp
      </button>
      <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
        <Printer className="h-4 w-4" /> Print
      </button>
    </div>
  )
}

/** Parse what a person typed: "12,50,000" -> 1250000. Empty or junk -> NaN. */
export function parseNum(text: string): number {
  const t = text.replace(/[,\s]/g, '')
  if (t === '' || !/^-?\d*\.?\d+$|^-?\d+\.?$/.test(t)) return NaN
  return Number(t)
}

/** Simple horizontal stacked bar (e.g. principal vs interest). */
export function StackedBar({ parts }: { parts: Array<{ label: string; value: number; color: string }> }) {
  const total = parts.reduce((s, p) => s + Math.max(p.value, 0), 0)
  if (total <= 0) return null
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.map((p) => <div key={p.label} style={{ width: `${(Math.max(p.value, 0) / total) * 100}%`, background: p.color }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        {parts.map((p) => <span key={p.label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.label} {Math.round((p.value / total) * 100)}%</span>)}
      </div>
    </div>
  )
}
