'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { Lock, Search } from 'lucide-react'

import { CATEGORY_BLURB, CATEGORY_ORDER, type HubTool, type ToolKind } from '@/lib/daily-tools/categories'
import { ToolTile } from './icons'

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')

export const KIND_LABEL: Record<ToolKind, string> = { ai: 'AI', local: 'On your device', online: 'Online' }
const KIND_STYLE: Record<ToolKind, string> = {
  ai: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  local: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  online: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
}

function Badges({ tool }: { tool: HubTool }) {
  return (
    <span className="flex shrink-0 flex-col items-end gap-1">
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${KIND_STYLE[tool.kind]}`}>{KIND_LABEL[tool.kind]}</span>
      {tool.isNew && <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pink-600 dark:text-pink-300">New</span>}
    </span>
  )
}

function ToolCard({ tool, big = false }: { tool: HubTool; big?: boolean }) {
  const style = { '--tool': tool.color } as CSSProperties
  return (
    <Link
      href={`/tools/${tool.slug}`}
      style={style}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--tool)] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.10] blur-2xl transition-opacity group-hover:opacity-30" style={{ background: tool.color }} />
      <div className="flex items-start justify-between gap-3">
        <ToolTile icon={tool.icon} color={tool.color} size={big ? 'lg' : 'md'} />
        <Badges tool={tool} />
      </div>
      <h3 className={`mt-4 font-semibold ${big ? 'text-lg' : 'text-base'}`}>{tool.name}</h3>
      <p className={`mt-1 text-zinc-600 dark:text-zinc-400 ${big ? 'text-sm' : 'text-sm'}`}>{tool.tagline}</p>
      {big && <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500"><Lock className="h-3 w-3" aria-hidden />{tool.kind === 'local' ? 'Private: runs on your device' : tool.kind === 'online' ? 'Free, no sign-in' : 'Free with an account'}</p>}
    </Link>
  )
}

export default function ToolsHub({ tools }: { tools: HubTool[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'ai'>('all')

  const matches = (t: HubTool) => {
    const q = norm(query.trim())
    const byKind = filter === 'all' || (filter === 'ai' ? t.kind === 'ai' : t.kind !== 'ai')
    return byKind && (!q || t.search.includes(q))
  }
  const filtered = useMemo(() => tools.filter(matches), [query, filter, tools]) // eslint-disable-line react-hooks/exhaustive-deps
  const featured = !query.trim() && filter === 'all' ? tools.filter((t) => t.featuredRank !== null).sort((x, y) => (x.featuredRank ?? 0) - (y.featuredRank ?? 0)) : []
  const total = tools.length

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools: PDF, QR, invoice, LinkedIn, EMI…"
            aria-label="Search tools"
            className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div role="group" aria-label="Filter by type" className="inline-flex shrink-0 rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {([['all', `All ${total}`], ['open', 'No sign-in'], ['ai', 'AI']] as Array<['all' | 'open' | 'ai', string]>).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filter === value ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'}`}>{label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">No tool matches “{query}”. Try a simpler word, like “pdf”, “qr”, “loan” or “letter”.</p>}

      {featured.length > 0 && (
        <section className="mb-14" aria-labelledby="popular">
          <h2 id="popular" className="text-xl font-medium tracking-tight">Most useful</h2>
          <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">The tools people come back for. All free, and your files stay on your device.</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map((t) => <li key={t.slug}><ToolCard tool={t} big /></li>)}</ul>
        </section>
      )}

      {CATEGORY_ORDER.map((category) => {
        const tools = filtered.filter((t) => t.category === category)
        if (tools.length === 0) return null
        return (
          <section key={category} className="mb-12" aria-labelledby={`cat-${category}`}>
            <h2 id={`cat-${category}`} className="text-xl font-medium tracking-tight">{category}</h2>
            <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">{CATEGORY_BLURB[category]}</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map((t) => <li key={t.slug}><ToolCard tool={t} /></li>)}</ul>
          </section>
        )
      })}
    </div>
  )
}
