'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import { DAILY_TOOLS } from '@/lib/daily-tools/registry'
import { ToolIcon } from './icons'

interface Item { id: string; label: string; hint: string; href: string; group: string; icon: string; keywords: string }

const CORE: Item[] = [
  { id: 'chat', label: 'AI Chat', hint: 'Chat with PDFs, documents and images', href: '/tomato-ai', group: 'TomatoAI', icon: 'MessageCircle', keywords: 'assistant chatgpt gemini' },
  { id: 'directory', label: 'AI Tools Directory', hint: 'Search 400+ AI tools', href: '/ai-tools', group: 'TomatoAI', icon: 'Wrench', keywords: 'find best ai tool' },
  { id: 'summarizer', label: 'Summarizer', hint: 'Summarise documents and articles', href: '/summarization', group: 'TomatoAI', icon: 'FileText', keywords: 'summary tldr' },
  { id: 'resume', label: 'Resume Analyzer', hint: 'Score and improve your resume', href: '/resume-analyzer', group: 'TomatoAI', icon: 'GraduationCap', keywords: 'cv ats job' },
  { id: 'prompt', label: 'Prompt Generator', hint: 'Turn an idea into a strong prompt', href: '/prompt-generator', group: 'TomatoAI', icon: 'PenLine', keywords: 'prompts' },
  { id: 'roadmap', label: 'Roadmap Generator', hint: 'A learning roadmap for any skill', href: '/roadmap-generator', group: 'TomatoAI', icon: 'TrendingUp', keywords: 'learn path career' },
  { id: 'content', label: 'Content Generator', hint: 'Blog posts, ads and social copy', href: '/content-generator', group: 'TomatoAI', icon: 'Type', keywords: 'blog writing marketing' },
  { id: 'prompts', label: 'Prompt Library', hint: 'Ready-made prompts', href: '/prompts', group: 'TomatoAI', icon: 'Hash', keywords: 'templates' },
  { id: 'pricing', label: 'Pricing', hint: 'Plans, limits and upgrades', href: '/pricing', group: 'Account', icon: 'Receipt', keywords: 'upgrade pro premium buy' },
  { id: 'account', label: 'My account', hint: 'Usage, streak and invite link', href: '/account', group: 'Account', icon: 'Users', keywords: 'profile referral credits streak' },
]

const ITEMS: Item[] = [
  ...DAILY_TOOLS.map((t) => ({ id: t.slug, label: t.name, hint: t.tagline, href: `/tools/${t.slug}`, group: 'Daily tools', icon: t.icon, keywords: `${t.keywords.join(' ')} ${t.category}` })),
  { id: 'tools', label: 'All daily tools', hint: `Browse all ${DAILY_TOOLS.length} tools`, href: '/tools', group: 'Daily tools', icon: 'Wrench', keywords: 'calculators utilities' },
  ...CORE,
]

const RECENT_KEY = 'tomato_launcher_recent'
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')

function loadRecent(): string[] {
  try { const v = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as unknown; return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 5) : [] } catch { return [] }
}
function saveRecent(id: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...loadRecent().filter((x) => x !== id)].slice(0, 5))) } catch { /* ignore */ }
}

function score(item: Item, q: string): number {
  const label = norm(item.label)
  if (label.startsWith(q)) return 100
  if (label.split(/\s+/).some((w) => w.startsWith(q))) return 80
  if (label.includes(q)) return 60
  if (norm(item.keywords).includes(q)) return 40
  if (norm(item.hint).includes(q)) return 20
  return 0
}

export default function LauncherDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recent] = useState(loadRecent)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(() => {
    const q = norm(query.trim())
    if (!q) {
      const recents = recent.map((id) => ITEMS.find((i) => i.id === id)).filter((i): i is Item => Boolean(i))
      const rest = ITEMS.filter((i) => !recents.includes(i))
      return [...recents.map((i) => ({ ...i, group: 'Recent' })), ...rest.slice(0, 12)]
    }
    return ITEMS.map((i) => ({ i, s: score(i, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.i).slice(0, 12)
  }, [query, recent])

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setActive(0) }, [query])
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }) }, [active])
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  const go = (item: Item) => { saveRecent(item.id); onClose(); router.push(item.href) }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Jump to a tool" className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); onClose() }
              else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
              else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]) }
            }}
            placeholder="Jump to a tool: EMI, email, GST, password…"
            aria-label="Search tools"
            role="combobox"
            aria-expanded="true"
            aria-controls="launcher-list"
            aria-activedescendant={results[active] ? `launcher-${results[active].id}` : undefined}
            autoComplete="off"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-zinc-400"
          />
          <kbd className="hidden shrink-0 rounded border border-zinc-300 px-1.5 py-0.5 text-[11px] text-zinc-500 dark:border-zinc-700 sm:block">Esc</kbd>
        </div>
        <ul id="launcher-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-4 py-8 text-center text-sm text-zinc-500">Nothing matches “{query}”.</li>}
          {results.map((item, i) => (
            <li key={`${item.group}-${item.id}`} role="presentation">
              {(i === 0 || results[i - 1].group !== item.group) && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{item.group}</p>}
              <button
                type="button"
                id={`launcher-${item.id}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${i === active ? 'bg-orange-500/10' : ''}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-orange-500 dark:bg-zinc-800"><ToolIcon name={item.icon} className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{item.label}</span><span className="block truncate text-xs text-zinc-500">{item.hint}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-zinc-200 px-5 py-2.5 text-[11px] text-zinc-500 dark:border-zinc-800"><span>↑↓ to move</span><span>Enter to open</span><span>Esc to close</span></div>
      </div>
    </div>
  )
}
