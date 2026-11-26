/**
 * Per-tool result history, kept ONLY in this browser (localStorage). Nothing about it is ever sent to the server.
 * Defensive on purpose: storage can be blocked, full or corrupted, and none of that may break the tool.
 */

import type { Values } from '@/lib/daily-tools/ai/forms'

export interface HistoryItem { id: string; at: number; values: Values; language: string; text: string }

const KEY = 'tomato_tools_history_v1'
const PER_TOOL = 10
const MAX_TEXT = 30_000
const MAX_TOTAL_CHARS = 900_000

type Store = Record<string, HistoryItem[]>

function read(): Store {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const clean: Store = {}
    for (const [slug, items] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(items)) continue
      clean[slug] = items.filter((i): i is HistoryItem => !!i && typeof i === 'object' && typeof (i as HistoryItem).text === 'string' && typeof (i as HistoryItem).id === 'string' && typeof (i as HistoryItem).values === 'object').slice(0, PER_TOOL)
    }
    return clean
  } catch { return {} }
}

function write(store: Store) {
  try {
    let json = JSON.stringify(store)
    // Over budget: drop the oldest entries across tools until it fits.
    while (json.length > MAX_TOTAL_CHARS) {
      let oldestSlug: string | null = null; let oldestAt = Infinity
      for (const [slug, items] of Object.entries(store)) { const last = items.at(-1); if (last && last.at < oldestAt) { oldestAt = last.at; oldestSlug = slug } }
      if (!oldestSlug) break
      store[oldestSlug].pop(); json = JSON.stringify(store)
    }
    window.localStorage.setItem(KEY, json)
  } catch { /* quota exceeded or blocked: history is a convenience, not a requirement */ }
}

export function loadHistory(slug: string): HistoryItem[] {
  return read()[slug] ?? []
}

export function addToHistory(slug: string, item: Omit<HistoryItem, 'id' | 'at'>): HistoryItem[] {
  const store = read()
  const entry: HistoryItem = { ...item, text: item.text.slice(0, MAX_TEXT), id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: Date.now() }
  store[slug] = [entry, ...(store[slug] ?? [])].slice(0, PER_TOOL)
  write(store)
  return store[slug]
}

export function clearHistory(slug: string): void {
  const store = read()
  delete store[slug]
  write(store)
}

// ── Hand-over between tools ("Send to...") ───────────────────────────

const HANDOFF_KEY = 'tomato_tools_handoff'

export function setHandoff(from: string, to: string, text: string): void {
  try { window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ from, to, text: text.slice(0, 6000), at: Date.now() })) } catch { /* ignore */ }
}

/** Returns the text handed over for this tool (once, and only if fresh), then forgets it. */
export function takeHandoff(to: string): { from: string; text: string } | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { from?: string; to?: string; text?: string; at?: number }
    if (data.to !== to || typeof data.text !== 'string' || typeof data.from !== 'string' || !data.at || Date.now() - data.at > 10 * 60_000) return null
    window.sessionStorage.removeItem(HANDOFF_KEY)
    return { from: data.from, text: data.text }
  } catch { return null }
}
