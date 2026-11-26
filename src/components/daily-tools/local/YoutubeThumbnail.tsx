'use client'

/* Previews of local files and remote thumbnails: next/image cannot optimise blob: or data: URLs. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import { Download, ExternalLink, Loader2 } from 'lucide-react'

import { parseYouTubeId, THUMB_SIZES, thumbUrl } from '@/lib/daily-tools/youtube'
import { downloadBlob } from '../download'
import { Card, ErrorNote, inputClass, Note } from '../ui'

interface Found { key: string; label: string; width: number; height: number; url: string; file: string }

/**
 * Is there a real image at this address? For sizes a video does not have, YouTube answers 404 but still sends a grey
 * 120x90 placeholder JPEG, which an <img> happily loads. So only images wider than 120 px count as real.
 */
function probe(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const timer = setTimeout(() => resolve(null), 8000)
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 120 ? { w: img.naturalWidth, h: img.naturalHeight } : null) }
    img.onerror = () => { clearTimeout(timer); resolve(null) }
    img.src = url
  })
}

export default function YoutubeThumbnail() {
  const [input, setInput] = useState('')
  const [id, setId] = useState<string | null>(null)
  const [found, setFound] = useState<Found[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const text = input.trim()
    if (!text) { setId(null); setFound(null); setError(null); return }
    const parsed = parseYouTubeId(text)
    if (!parsed) { setId(null); setFound(null); setError('That does not look like a YouTube link. Paste the video address, like https://youtu.be/dQw4w9WgXcQ.'); return }
    setError(null); setId(parsed)
    let cancelled = false
    setBusy(true); setFound(null)
    ;(async () => {
      const checks = await Promise.all(THUMB_SIZES.filter((s) => s.key !== 'default').map(async (s) => { const url = thumbUrl(parsed, s.file); const size = await probe(url); return size ? { key: s.key, label: s.label, width: size.w, height: size.h, url, file: s.file } : null }))
      if (cancelled) return
      const list = checks.filter((c): c is Found => c !== null)
      // The small 120x90 "default" size exists for every real video but is indistinguishable from the placeholder, so list it only when a larger real size was found.
      if (list.length > 0) list.push({ key: 'default', label: 'Small', width: 120, height: 90, url: thumbUrl(parsed, 'default.jpg'), file: 'default.jpg' })
      setFound(list); setBusy(false)
      if (list.length === 0) setError('No thumbnail was found for this video. It may be private, deleted, or the link may be wrong.')
    })()
    return () => { cancelled = true }
  }, [input])

  async function save(f: Found) {
    setSaving(f.key); setError(null)
    try {
      const res = await fetch(f.url, { mode: 'cors' })
      if (!res.ok) throw new Error('bad status')
      downloadBlob(await res.blob(), `youtube-${id}-${f.width}x${f.height}.jpg`, 'image/jpeg')
    } catch {
      // The browser blocked the direct save (strict privacy mode or an extension): open the image so it can be saved by hand.
      window.open(f.url, '_blank', 'noopener,noreferrer')
    } finally { setSaving(null) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <label htmlFor="yt-url" className="mb-1.5 block text-sm font-medium">YouTube video link</label>
        <input id="yt-url" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=… or youtu.be/… or a Shorts link" autoComplete="off" spellCheck={false} className={inputClass} />
        <p className="mt-2 text-xs text-zinc-500">Works with watch, youtu.be, Shorts, live and embed links. The thumbnails come straight from YouTube.</p>
      </Card>

      {error && <ErrorNote>{error}</ErrorNote>}
      {busy && <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />Looking for thumbnails…</p>}

      {found && found.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="yt-results">
          {found.map((f, i) => (
            <Card key={f.key}>
              {}
              <img src={f.url} alt={`${f.label} thumbnail`} className="aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-100 object-cover dark:border-zinc-800 dark:bg-zinc-800" loading="lazy" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div><p className="text-sm font-semibold">{f.label}{i === 0 && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Best</span>}</p><p className="text-xs text-zinc-500">{f.width} × {f.height} px · JPG</p></div>
                <div className="flex gap-2">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${f.label} thumbnail in a new tab`} className="rounded-full border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ExternalLink className="h-4 w-4" /></a>
                  <button type="button" onClick={() => void save(f)} disabled={saving !== null} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black">{saving === f.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Note>Thumbnails are the property of the video&apos;s creator. Use them for reference, commentary or with permission, and do not present them as your own.</Note>
    </div>
  )
}
