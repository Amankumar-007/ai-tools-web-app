'use client'

/* Previews of local files and remote thumbnails: next/image cannot optimise blob: or data: URLs. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react'
import JSZip from 'jszip'
import { Download, Loader2, Trash2 } from 'lucide-react'

import { EXT, fitWithin, outputName, savings, type OutType } from '@/lib/daily-tools/image/resize'
import { canvasToBlob, downloadBlob, formatBytes, imageSize, loadImage, MAX_PIXELS } from '../download'
import FileDrop from '../FileDrop'
import { Card, ErrorNote, Note, NumberField, parseNum, Segmented } from '../ui'

interface Item { id: string; file: File; status: 'queued' | 'done' | 'error'; out?: Blob; outName?: string; url?: string; w?: number; h?: number; error?: string }
let seq = 0

const TYPES: Array<{ value: OutType; label: string }> = [{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/webp', label: 'WebP' }, { value: 'image/png', label: 'PNG' }]

export default function ImageConverter() {
  const [items, setItems] = useState<Item[]>([])
  const [type, setType] = useState<OutType>('image/webp')
  const [quality, setQuality] = useState(82)
  const [maxW, setMaxW] = useState('')
  const [maxH, setMaxH] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [webpOk, setWebpOk] = useState(true)
  const urls = useRef<string[]>([])

  useEffect(() => {
    // Safari before 17 cannot write WebP from a canvas: it silently returns PNG. Detect it and say so.
    const c = document.createElement('canvas'); c.width = c.height = 1
    setWebpOk(c.toDataURL('image/webp').startsWith('data:image/webp'))
    return () => urls.current.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const clearOutputs = () => { urls.current.forEach((u) => URL.revokeObjectURL(u)); urls.current = []; setItems((cur) => cur.map((it) => ({ id: it.id, file: it.file, status: 'queued' as const }))) }
  const onFiles = useCallback((files: File[]) => { setError(null); setItems((cur) => [...cur, ...files.map((file) => ({ id: `i${++seq}`, file, status: 'queued' as const }))].slice(0, 50)) }, [])

  async function convert() {
    if (busy || items.length === 0) return
    setError(null)
    const mw = maxW.trim() === '' ? 0 : parseNum(maxW), mh = maxH.trim() === '' ? 0 : parseNum(maxH)
    if (Number.isNaN(mw) || Number.isNaN(mh) || mw < 0 || mh < 0 || mw > 20000 || mh > 20000) { setError('Maximum width and height must be numbers up to 20000 (or empty to keep the size).'); return }
    urls.current.forEach((u) => URL.revokeObjectURL(u)); urls.current = []
    const taken = new Set<string>(); const next: Item[] = []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]; setBusy(`Converting ${i + 1} of ${items.length}…`)
      try {
        const img = await loadImage(it.file); const size = imageSize(img)
        const { w, h } = fitWithin(size.w, size.h, mw, mh)
        if (w * h > MAX_PIXELS) throw new Error('This image is too large to process in a browser. Reduce its size first.')
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser could not process this image.')
        ctx.imageSmoothingQuality = 'high'
        if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h) } // JPEG has no transparency: white, not black
        ctx.drawImage(img, 0, 0, w, h)
        const blob = await canvasToBlob(canvas, type, type === 'image/png' ? undefined : quality / 100); canvas.width = 0
        if (blob.type !== type) throw new Error(`Your browser cannot save ${EXT[type].toUpperCase()}. Choose JPG or PNG.`)
        const url = URL.createObjectURL(blob); urls.current.push(url)
        next.push({ ...it, status: 'done', out: blob, outName: outputName(it.file.name, type, taken), url, w, h, error: undefined })
      } catch (e) { next.push({ ...it, status: 'error', error: e instanceof Error ? e.message : 'Could not convert this file.' }) }
      await new Promise((r) => setTimeout(r, 0))
    }
    setItems(next); setBusy(null)
  }

  async function downloadAll() {
    const done = items.filter((i) => i.status === 'done' && i.out && i.outName)
    if (done.length === 1) { downloadBlob(done[0].out!, done[0].outName!); return }
    const zip = new JSZip(); done.forEach((i) => zip.file(i.outName!, i.out!))
    downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'STORE' }), 'converted-images.zip')
  }

  const done = items.filter((i) => i.status === 'done')
  const before = done.reduce((s, i) => s + i.file.size, 0), after = done.reduce((s, i) => s + (i.out?.size ?? 0), 0)

  return (
    <div className="space-y-6">
      <FileDrop accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml,image/avif,.png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.avif" multiple maxBytes={40 * 1024 * 1024} maxFiles={50} label="Add images to convert or compress" hint="PNG, JPG, WebP, GIF, BMP, SVG, AVIF" onFiles={onFiles} onReject={setError} />
      {error && <ErrorNote>{error}</ErrorNote>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card title="Settings">
          <div className="space-y-4">
            <div><p className="mb-1.5 text-sm font-medium">Convert to</p><Segmented label="Output format" value={type} onChange={(v) => { setType(v); clearOutputs() }} options={TYPES} /></div>
            {type === 'image/webp' && !webpOk && <p className="text-xs text-amber-600">This browser cannot create WebP files. Pick JPG or PNG.</p>}
            {type !== 'image/png' ? (
              <div><label htmlFor="img-q" className="mb-1.5 flex justify-between text-sm font-medium"><span>Quality</span><span className="tabular-nums">{quality}%</span></label><input id="img-q" type="range" min={30} max={100} value={quality} onChange={(e) => { setQuality(Number(e.target.value)); clearOutputs() }} className="w-full accent-orange-500" /><p className="mt-1 text-xs text-zinc-500">70–85% is the sweet spot: much smaller, hard to tell apart.</p></div>
            ) : <p className="text-xs text-zinc-500">PNG is lossless, so there is no quality setting. Resizing is how you make it smaller.</p>}
            <div className="grid grid-cols-2 gap-3"><NumberField label="Max width (px)" value={maxW} onChange={(v) => { setMaxW(v); clearOutputs() }} placeholder="keep" inputMode="numeric" /><NumberField label="Max height (px)" value={maxH} onChange={(v) => { setMaxH(v); clearOutputs() }} placeholder="keep" inputMode="numeric" /></div>
            <p className="text-xs text-zinc-500">Images are only ever made smaller, never stretched. Converting also removes hidden photo data (location, camera) from the copy.</p>
            <button type="button" onClick={() => void convert()} disabled={busy !== null || items.length === 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ?? `Convert ${items.length || ''} image${items.length === 1 ? '' : 's'}`}</button>
          </div>
        </Card>

        <Card title={items.length ? `Images (${items.length})` : 'Images'}>
          {items.length === 0 ? <p className="text-sm text-zinc-500">Add some images to get started.</p> : (
            <>
              <ul className="space-y-2">
                {items.map((it) => {
                  const s = it.out ? savings(it.file.size, it.out.size) : null
                  return (
                    <li key={it.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                      {it.url ? <img src={it.url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{it.outName ?? it.file.name}</p>
                        {it.status === 'error' ? <p className="text-xs text-red-600">{it.error}</p> : it.out && s ? <p className="text-xs text-zinc-500">{formatBytes(it.file.size)} → <strong className="text-zinc-800 dark:text-zinc-200">{formatBytes(it.out.size)}</strong> · <span className={s.smaller ? 'text-emerald-600' : 'text-amber-600'}>{s.text}</span> · {it.w}×{it.h}</p> : <p className="text-xs text-zinc-500">{formatBytes(it.file.size)}</p>}
                      </div>
                      {it.out && <button type="button" aria-label={`Download ${it.outName}`} onClick={() => downloadBlob(it.out!, it.outName!)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Download className="h-4 w-4" /></button>}
                      <button type="button" aria-label={`Remove ${it.file.name}`} onClick={() => { if (it.url) URL.revokeObjectURL(it.url); setItems((cur) => cur.filter((x) => x.id !== it.id)) }} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  )
                })}
              </ul>
              {done.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <p className="text-sm" data-testid="img-summary">{done.length} converted: {formatBytes(before)} → <strong>{formatBytes(after)}</strong> {after < before ? `(${Math.round((1 - after / before) * 100)}% smaller)` : ''}</p>
                  <button type="button" onClick={() => void downloadAll()} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"><Download className="h-4 w-4" />{done.length > 1 ? 'Download all (.zip)' : 'Download'}</button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
      <Note>Your images are converted inside your browser and never uploaded. Animated GIFs become still images. HEIC/HEIF photos from iPhones are not supported by browsers: in the Photos app, share or export them as JPG first.</Note>
    </div>
  )
}
