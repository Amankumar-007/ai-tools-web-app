'use client'

/* Previews of remote thumbnails: next/image cannot be used for third-party CDN images we do not list. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type ReactNode } from 'react'
import { Copy, Download, ExternalLink, Loader2 } from 'lucide-react'
import type { IconType } from 'react-icons'

import { downloadBlob, formatBytes } from '../download'
import { Card, copyText, ErrorNote, inputClass, Note } from '../ui'

export interface VideoOption { url: string; quality: number | null; bitrate: number | null; label: string }

export interface PlatformConfig {
  /** Short prefix for element ids and test ids (li, x). */
  idPrefix: string
  endpoint: string
  /** "LinkedIn post" */
  subject: string
  placeholder: string
  brandColor: string
  Icon: IconType
  fallbackTitle: string
  parse: (input: string) => { ok: true; url: string } | { ok: false; error: string }
  isAllowedMediaUrl: (url: string) => boolean
  fileName: (title: string | null, label: string, gif: boolean) => string
  help: ReactNode
  note: ReactNode
}

interface Found { title: string | null; thumbnail: string | null; sources: VideoOption[]; isGif?: boolean }

/**
 * One lookup form + quality list used by every "paste a post link, save its video" tool. The server only finds the
 * file addresses; the visitor's own browser downloads the video straight from the platform's CDN, so our server never carries it.
 */
export default function SocialVideoDownloader({ cfg }: { cfg: PlatformConfig }) {
  const { idPrefix: p, Icon } = cfg
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [found, setFound] = useState<Found | null>(null)
  const [progress, setProgress] = useState<{ key: string; pct: number | null } | null>(null)
  const abort = useRef<AbortController | null>(null)

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault()
    if (busy) return
    setError(null); setFound(null)
    const parsed = cfg.parse(input)
    if (!parsed.ok) { setError({ message: parsed.error }); return }
    setBusy(true)
    try {
      const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: parsed.url }) })
      const json = (await res.json().catch(() => ({}))) as Partial<Found> & { error?: string; code?: string }
      if (!res.ok || !json.sources?.length) { setError({ message: json.error || 'Something went wrong. Please try again.', code: json.code }); return }
      setFound({ title: json.title ?? null, thumbnail: json.thumbnail ?? null, sources: json.sources, isGif: json.isGif === true })
    } catch { setError({ message: 'Could not reach the server. Check your connection and try again.' }) } finally { setBusy(false) }
  }

  async function save(s: VideoOption) {
    if (!cfg.isAllowedMediaUrl(s.url)) return
    setError(null); setProgress({ key: s.url, pct: 0 })
    const ctl = new AbortController(); abort.current = ctl
    try {
      const res = await fetch(s.url, { signal: ctl.signal, referrerPolicy: 'no-referrer', credentials: 'omit' })
      if (!res.ok || !res.body) throw new Error('bad response')
      const total = Number(res.headers.get('content-length')) || 0
      const reader = res.body.getReader(); const chunks: Uint8Array[] = []; let got = 0
      for (;;) {
        const { value, done } = await reader.read(); if (done) break
        chunks.push(value); got += value.byteLength
        if (got > 600 * 1024 * 1024) throw new Error('too large')
        setProgress({ key: s.url, pct: total ? Math.min(99, Math.round((got / total) * 100)) : null })
      }
      downloadBlob(new Blob(chunks as BlobPart[], { type: 'video/mp4' }), cfg.fileName(found?.title ?? null, s.label, found?.isGif === true), 'video/mp4')
    } catch (e) {
      if ((e as { name?: string })?.name !== 'AbortError') {
        // The browser could not fetch it directly (privacy extension, network): open the file so it can be saved from the player menu.
        window.open(s.url, '_blank', 'noopener,noreferrer')
        setError({ message: 'Your browser could not save it directly, so the video opened in a new tab. Use the ⋮ menu on the player and choose Download, or right-click and choose "Save video as".' })
      }
    } finally { setProgress(null); abort.current = null }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={(e) => void lookup(e)} className="space-y-3">
          <label htmlFor={`${p}-url`} className="block text-sm font-medium">Link to the {cfg.subject}</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id={`${p}-url`} value={input} onChange={(e) => setInput(e.target.value)} placeholder={cfg.placeholder} autoComplete="off" spellCheck={false} inputMode="url" className={`${inputClass} flex-1`} />
            <button type="submit" disabled={busy || input.trim() === ''} style={{ backgroundColor: cfg.brandColor }} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{busy ? 'Finding video…' : 'Get video'}</button>
          </div>
          <p className="text-xs text-zinc-500">{cfg.help}</p>
        </form>
      </Card>

      {error && <ErrorNote>{error.message}</ErrorNote>}

      {found && (
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row">
            {found.thumbnail && <img src={found.thumbnail} alt="" referrerPolicy="no-referrer" className="aspect-video w-full rounded-2xl border border-zinc-200 bg-zinc-100 object-cover dark:border-zinc-800 dark:bg-zinc-800 sm:w-64" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{found.isGif ? 'GIF found (saved as a short MP4)' : 'Video found'}</p>
              <p className="mt-1 line-clamp-3 text-base font-medium" data-testid={`${p}-title`}>{found.title ?? cfg.fallbackTitle}</p>
              <p className="mt-1 text-sm text-zinc-500">{found.sources.length} quality option{found.sources.length === 1 ? '' : 's'}. The best one is first.</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2" data-testid={`${p}-sources`}>
            {found.sources.map((s, i) => (
              <li key={s.url} className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <span className="min-w-0 flex-1"><span className="font-semibold">{s.label}</span>{i === 0 && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Best quality</span>}<span className="ml-2 text-xs text-zinc-500">MP4{s.bitrate ? ` · ${Math.round(s.bitrate / 1000).toLocaleString('en-IN')} kbps` : ''}</span></span>
                <button type="button" onClick={() => void copyText(s.url, 'Video link copied')} aria-label={`Copy ${s.label} link`} className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Copy className="h-4 w-4" /></button>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer" aria-label={`Open ${s.label} in a new tab`} className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ExternalLink className="h-4 w-4" /></a>
                <button type="button" onClick={() => void save(s)} disabled={progress !== null} className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black">{progress?.key === s.url ? <><Loader2 className="h-4 w-4 animate-spin" />{progress.pct === null ? 'Saving…' : `${progress.pct}%`}</> : <><Download className="h-4 w-4" />Download</>}</button>
              </li>
            ))}
          </ul>
          {progress && <button type="button" onClick={() => abort.current?.abort()} className="mt-3 text-sm font-medium text-zinc-500 underline">Cancel download</button>}
          <p className="mt-4 text-xs text-zinc-500">File name: {cfg.fileName(found.title, found.sources[0].label, found.isGif === true)} {found.sources[0].bitrate ? `· roughly ${formatBytes(found.sources[0].bitrate / 8 * 60)} per minute` : ''}</p>
        </Card>
      )}

      <Note>{cfg.note}</Note>
    </div>
  )
}
