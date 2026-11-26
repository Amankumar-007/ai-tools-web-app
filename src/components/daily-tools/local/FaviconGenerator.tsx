'use client'

/* Previews of local files and remote thumbnails: next/image cannot optimise blob: or data: URLs. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from 'react'
import JSZip from 'jszip'
import { Download, Loader2 } from 'lucide-react'

import { buildIco, cornerRadius, htmlSnippet, ICO_SIZES, isHexColor, placeImage, PNG_FILES, readme, webManifest, type IconFit, type IconShape } from '@/lib/daily-tools/image/favicon'
import { canvasToBlob, downloadBlob, imageSize, loadImage } from '../download'
import FileDrop from '../FileDrop'
import { Card, CopyButton, ErrorNote, Field, inputClass, Note, Segmented } from '../ui'

type Source = ImageBitmap | HTMLImageElement

interface Opts { shape: IconShape; fit: IconFit; padding: number; bg: 'transparent' | 'solid'; bgColor: string }

function roundedPath(ctx: CanvasRenderingContext2D, size: number, r: number) {
  ctx.beginPath()
  if (r <= 0) { ctx.rect(0, 0, size, size); return }
  ctx.moveTo(r, 0); ctx.lineTo(size - r, 0); ctx.arcTo(size, 0, size, r, r); ctx.lineTo(size, size - r); ctx.arcTo(size, size, size - r, size, r); ctx.lineTo(r, size); ctx.arcTo(0, size, 0, size - r, r); ctx.lineTo(0, r); ctx.arcTo(0, 0, r, 0, r); ctx.closePath()
}

/** Halve repeatedly before the final draw: one big jump down to 16 px looks jagged, small steps look clean. */
function downscale(src: Source, w: number, h: number): CanvasImageSource {
  let { w: cw, h: ch } = imageSize(src); if (cw === 0 || ch === 0) { cw = 512; ch = 512 }
  let current: CanvasImageSource = src
  while (cw / 2 >= w * 1.2 && ch / 2 >= h * 1.2) {
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(cw / 2)); c.height = Math.max(1, Math.round(ch / 2))
    const cx = c.getContext('2d'); if (!cx) break
    cx.imageSmoothingQuality = 'high'; cx.drawImage(current, 0, 0, c.width, c.height)
    current = c; cw = c.width; ch = c.height
  }
  return current
}

function renderIcon(src: Source, size: number, o: Opts): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser could not create the icon.')
  const { w: sw0, h: sh0 } = imageSize(src); const sw = sw0 || 512, sh = sh0 || 512
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  roundedPath(ctx, size, cornerRadius(o.shape, size)); ctx.save(); ctx.clip()
  if (o.bg === 'solid') { ctx.fillStyle = isHexColor(o.bgColor) ? o.bgColor : '#ffffff'; ctx.fillRect(0, 0, size, size) }
  const p = placeImage(sw, sh, size, o.fit, o.padding)
  ctx.drawImage(downscale(src, p.w, p.h), p.x, p.y, p.w, p.h)
  ctx.restore()
  return canvas
}

export default function FaviconGenerator() {
  const [src, setSrc] = useState<Source | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shape, setShape] = useState<IconShape>('rounded')
  const [fit, setFit] = useState<IconFit>('contain')
  const [padding, setPadding] = useState(8)
  const [bg, setBg] = useState<'transparent' | 'solid'>('transparent')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [siteName, setSiteName] = useState('My Website')
  const [theme, setTheme] = useState('#ffffff')
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [tab, setTab] = useState<'light' | 'dark'>('light')

  const opts: Opts = { shape, fit, padding, bg, bgColor }

  useEffect(() => {
    if (!src) return
    const t = setTimeout(() => {
      try {
        const next: Record<number, string> = {}
        for (const size of [16, 32, 48, 180]) next[size] = renderIcon(src, size, { shape, fit, padding, bg, bgColor }).toDataURL('image/png')
        setPreviews(next)
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not draw the preview.') }
    }, 120)
    return () => clearTimeout(t)
  }, [src, shape, fit, padding, bg, bgColor])

  const onFiles = useCallback(async (files: File[]) => {
    setError(null); setBusy(true)
    try {
      const img = await loadImage(files[0]); const { w, h } = imageSize(img)
      if (files[0].type !== 'image/svg+xml' && (w < 16 || h < 16)) throw new Error('That image is too small to make an icon from. Use one that is at least 64×64 pixels.')
      setSrc(img); setFileName(files[0].name)
      if (files[0].type !== 'image/svg+xml' && Math.min(w, h) < 192) setError('Tip: the image is small, so the larger icons will look soft. For best results use a square image of 512×512 or more.')
    } catch (e) { setSrc(null); setError(e instanceof Error ? e.message : 'Could not read that image.') } finally { setBusy(false) }
  }, [])

  async function makePack() {
    if (!src) return
    setBusy(true); setError(null)
    try {
      const zip = new JSZip(); const pngs = new Map<number, Uint8Array>()
      for (const f of PNG_FILES) {
        const blob = await canvasToBlob(renderIcon(src, f.size, opts), 'image/png')
        const bytes = new Uint8Array(await blob.arrayBuffer()); pngs.set(f.size, bytes); zip.file(f.name, bytes)
      }
      zip.file('favicon.ico', buildIco(ICO_SIZES.map((s) => ({ size: s, data: pngs.get(s)! }))))
      zip.file('site.webmanifest', webManifest({ name: siteName, shortName: siteName, themeColor: theme, backgroundColor: theme }))
      zip.file('favicon-snippet.html', htmlSnippet({ themeColor: theme }))
      zip.file('README.txt', readme())
      downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }), 'favicon-pack.zip')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not build the pack.') } finally { setBusy(false) }
  }

  async function single(size: number, name: string) {
    if (!src) return
    downloadBlob(await canvasToBlob(renderIcon(src, size, opts), 'image/png'), name)
  }
  async function icoOnly() {
    if (!src) return
    const items = []
    for (const s of ICO_SIZES) items.push({ size: s, data: new Uint8Array(await (await canvasToBlob(renderIcon(src, s, opts), 'image/png')).arrayBuffer()) })
    downloadBlob(buildIco(items), 'favicon.ico', 'image/x-icon')
  }

  return (
    <div className="space-y-6">
      {!src && <FileDrop accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.svg,.bmp" maxBytes={15 * 1024 * 1024} label="Choose your logo or image" hint="PNG, JPG, SVG, WebP" onFiles={(f) => void onFiles(f)} onReject={setError} />}
      {busy && !src && <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />Reading your image…</p>}
      {error && <ErrorNote>{error}</ErrorNote>}

      {src && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card title="Style">
            <div className="space-y-4">
              <p className="truncate text-sm text-zinc-500">Using <strong className="text-zinc-800 dark:text-zinc-200">{fileName}</strong> <button type="button" onClick={() => { setSrc(null); setPreviews({}); setError(null) }} className="ml-1 font-medium underline">change</button></p>
              <div><p className="mb-1.5 text-sm font-medium">Shape</p><Segmented label="Icon shape" value={shape} onChange={setShape} options={[{ value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' }, { value: 'circle', label: 'Circle' }]} /></div>
              <div><p className="mb-1.5 text-sm font-medium">Fit</p><Segmented label="Image fit" value={fit} onChange={setFit} options={[{ value: 'contain', label: 'Whole image' }, { value: 'cover', label: 'Fill the icon' }]} /></div>
              <div><label htmlFor="fav-pad" className="mb-1.5 flex justify-between text-sm font-medium"><span>Padding</span><span className="tabular-nums">{padding}%</span></label><input id="fav-pad" type="range" min={0} max={30} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-orange-500" /></div>
              <div><p className="mb-1.5 text-sm font-medium">Background</p><div className="flex items-center gap-3"><Segmented label="Background" value={bg} onChange={setBg} options={[{ value: 'transparent', label: 'Transparent' }, { value: 'solid', label: 'Colour' }]} />{bg === 'solid' && <input type="color" aria-label="Background colour" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-300 bg-transparent dark:border-zinc-700" />}</div></div>
              <Field label="Site name (for the web manifest)" htmlFor="fav-name"><input id="fav-name" value={siteName} maxLength={60} onChange={(e) => setSiteName(e.target.value)} className={inputClass} /></Field>
              <div className="flex items-center gap-3"><label htmlFor="fav-theme" className="text-sm font-medium">Theme colour</label><input id="fav-theme" type="color" value={theme} onChange={(e) => setTheme(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-300 bg-transparent dark:border-zinc-700" /></div>
            </div>
          </Card>

          <div className="min-w-0 space-y-6">
            <Card title="Preview">
              <div className="flex flex-wrap items-end gap-6">
                {[16, 32, 48, 180].map((s) => (
                  <figure key={s} className="text-center">
                    <div className="flex items-end justify-center rounded-xl bg-[linear-gradient(45deg,#e4e4e7_25%,transparent_25%,transparent_75%,#e4e4e7_75%),linear-gradient(45deg,#e4e4e7_25%,#fafafa_25%,#fafafa_75%,#e4e4e7_75%)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] p-3 dark:bg-[linear-gradient(45deg,#3f3f46_25%,transparent_25%,transparent_75%,#3f3f46_75%),linear-gradient(45deg,#3f3f46_25%,#27272a_25%,#27272a_75%,#3f3f46_75%)]">
                      {previews[s] ? <img src={previews[s]} alt={`${s} pixel icon`} width={s > 64 ? 96 : s} height={s > 64 ? 96 : s} style={{ imageRendering: s <= 32 ? 'pixelated' : 'auto' }} /> : <span className="block" style={{ width: s > 64 ? 96 : s, height: s > 64 ? 96 : s }} />}
                    </div>
                    <figcaption className="mt-1.5 text-xs text-zinc-500">{s === 180 ? '180 (iPhone)' : `${s}×${s}`}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-6">
                <div className="mb-2"><Segmented label="Tab theme" value={tab} onChange={setTab} options={[{ value: 'light', label: 'Light browser' }, { value: 'dark', label: 'Dark browser' }]} /></div>
                <div className={`flex max-w-sm items-center gap-2 rounded-t-xl px-3 py-2 text-xs ${tab === 'light' ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-100'}`}>
                  {previews[16] && <img src={previews[16]} alt="" width={16} height={16} />}
                  <span className="truncate">{siteName || 'My Website'}</span><span className="ml-auto opacity-60">✕</span>
                </div>
              </div>
            </Card>

            <Card title="Download">
              <button type="button" onClick={() => void makePack()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download the full favicon pack (.zip)</button>
              <p className="mt-2 text-xs text-zinc-500">Includes favicon.ico, {PNG_FILES.length} PNG sizes, site.webmanifest, the HTML to paste, and setup instructions.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => void icoOnly()} className="rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">favicon.ico only</button>
                {PNG_FILES.filter((f) => [32, 180, 512].includes(f.size)).map((f) => <button key={f.name} type="button" onClick={() => void single(f.size, f.name)} className="rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">{f.name}</button>)}
              </div>
            </Card>

            <Card title="Paste this into your site's <head>">
              <pre className="overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-6 dark:border-zinc-800 dark:bg-zinc-950/50">{htmlSnippet({ themeColor: theme })}</pre>
              <div className="mt-3"><CopyButton text={htmlSnippet({ themeColor: theme })} label="Copy HTML" /></div>
              <p className="mt-3 text-xs text-zinc-500">Upload the files to the root folder of your website so /favicon.ico works.</p>
            </Card>
          </div>
        </div>
      )}
      <Note>Made on your device: your image is never uploaded. The icon is drawn at every size from your original, so small sizes stay sharp. Browsers cache favicons for a long time, so a new icon can take a while (or a private window) to show up.</Note>
    </div>
  )
}
