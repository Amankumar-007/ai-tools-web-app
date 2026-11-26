'use client'

/* Previews of local files and remote thumbnails: next/image cannot optimise blob: or data: URLs. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useState } from 'react'
import JSZip from 'jszip'
import { ArrowDown, ArrowUp, Download, FileText, ImageIcon, Loader2, Trash2 } from 'lucide-react'

import { deletePages, extractPages, imagesToPdf, LIMITS, mergePdfs, pageCountOf, parsePageRanges, rotatePages, splitEvery, type ImageInput } from '@/lib/daily-tools/pdf/tools'
import { baseName, canvasToBlob, downloadBlob, formatBytes, imageSize, loadImage, MAX_PIXELS } from '../download'
import FileDrop from '../FileDrop'
import { Card, ErrorNote, Field, inputClass, Note, Segmented } from '../ui'

type Tab = 'merge' | 'split' | 'pages' | 'images'
interface PdfFile { id: string; name: string; bytes: Uint8Array; pages: number; size: number }
interface Pic { id: string; name: string; input: ImageInput; url: string; size: number }
interface Output { files: Array<{ name: string; blob: Blob }>; note: string }

let seq = 0; const uid = () => `f${++seq}${Date.now().toString(36)}`
const PDF_MAX = 100 * 1024 * 1024
const pdfBlob = (bytes: Uint8Array) => new Blob([bytes as BlobPart], { type: 'application/pdf' })

async function readPdf(file: File): Promise<PdfFile> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!new TextDecoder('latin1').decode(bytes.subarray(0, 1024)).includes('%PDF-')) throw new Error(`"${file.name}" is not a PDF file.`)
  return { id: uid(), name: file.name, bytes, pages: await pageCountOf(bytes), size: file.size }
}

/** PNG and JPEG go straight in; anything else (WebP, GIF, BMP, SVG) is drawn on a canvas and re-encoded first. */
async function toPdfImage(file: File): Promise<{ input: ImageInput; url: string }> {
  const url = URL.createObjectURL(file)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8
  if (isPng || isJpg) return { input: { bytes, type: isPng ? 'png' : 'jpg' }, url }
  const img = await loadImage(file); const { w, h } = imageSize(img)
  if (w * h > MAX_PIXELS) throw new Error(`"${file.name}" is too large (${w}×${h}).`)
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Your browser could not process the image.')
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0)
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92); canvas.width = 0
  return { input: { bytes: new Uint8Array(await blob.arrayBuffer()), type: 'jpg' }, url }
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list
  const next = [...list]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next
}

export default function PdfTools() {
  const [tab, setTab] = useState<Tab>('merge')
  const [pdfs, setPdfs] = useState<PdfFile[]>([])
  const [pics, setPics] = useState<Pic[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [out, setOut] = useState<Output | null>(null)
  // options
  const [splitMode, setSplitMode] = useState<'every' | 'extract'>('every')
  const [every, setEvery] = useState('1')
  const [spec, setSpec] = useState('')
  const [pageAction, setPageAction] = useState<'delete' | 'rotate' | 'reorder'>('delete')
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4')
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto')
  const [margin, setMargin] = useState(24)

  const reset = () => { setOut(null); setError(null) }
  const switchTab = (t: Tab) => { setTab(t); reset(); setPdfs([]); pics.forEach((p) => URL.revokeObjectURL(p.url)); setPics([]); setSpec('') }

  const addPdfs = useCallback(async (files: File[]) => {
    reset(); setBusy('Reading your PDFs…')
    try {
      const read: PdfFile[] = []
      for (const f of files) read.push(await readPdf(f))
      setPdfs((cur) => (tab === 'merge' ? [...cur, ...read].slice(0, LIMITS.maxFiles) : read.slice(0, 1)))
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read that PDF.') } finally { setBusy(null) }
  }, [tab])

  const addPics = useCallback(async (files: File[]) => {
    reset(); setBusy('Reading your images…')
    try {
      const read: Pic[] = []
      for (const f of files) { const { input, url } = await toPdfImage(f); read.push({ id: uid(), name: f.name, input, url, size: f.size }) }
      setPics((cur) => [...cur, ...read].slice(0, 100))
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not read that image.') } finally { setBusy(null) }
  }, [])

  async function run() {
    reset(); setBusy('Working…')
    try {
      if (tab === 'merge') {
        const bytes = await mergePdfs(pdfs.map((p) => p.bytes))
        setOut({ files: [{ name: 'merged.pdf', blob: pdfBlob(bytes) }], note: `${pdfs.length} files, ${pdfs.reduce((s, p) => s + p.pages, 0)} pages` })
      } else if (tab === 'split' && pdfs[0]) {
        const src = pdfs[0]; const stem = baseName(src.name)
        if (splitMode === 'every') {
          const n = Number(every)
          if (!Number.isInteger(n) || n < 1) throw new Error('Pages per file must be a whole number, 1 or more.')
          const parts = await splitEvery(src.bytes, n)
          setOut({ files: parts.map((b, i) => ({ name: `${stem}-part-${i + 1}.pdf`, blob: pdfBlob(b) })), note: `${parts.length} file${parts.length === 1 ? '' : 's'} of ${n} page${n === 1 ? '' : 's'}` })
        } else {
          const r = parsePageRanges(spec, src.pages, { allowRepeat: true }); if (!r.ok) throw new Error(r.error)
          setOut({ files: [{ name: `${stem}-pages.pdf`, blob: pdfBlob(await extractPages(src.bytes, r.pages)) }], note: `${r.pages.length} page${r.pages.length === 1 ? '' : 's'}, in the order you gave` })
        }
      } else if (tab === 'pages' && pdfs[0]) {
        const src = pdfs[0]; const stem = baseName(src.name)
        const r = parsePageRanges(spec, src.pages, { allowRepeat: pageAction === 'reorder' }); if (!r.ok) throw new Error(r.error)
        if (pageAction === 'delete') setOut({ files: [{ name: `${stem}-edited.pdf`, blob: pdfBlob(await deletePages(src.bytes, r.pages)) }], note: `Removed ${r.pages.length} page${r.pages.length === 1 ? '' : 's'}` })
        else if (pageAction === 'rotate') setOut({ files: [{ name: `${stem}-rotated.pdf`, blob: pdfBlob(await rotatePages(src.bytes, r.pages, angle)) }], note: `Rotated ${r.pages.length} page${r.pages.length === 1 ? '' : 's'} by ${angle}°` })
        else setOut({ files: [{ name: `${stem}-reordered.pdf`, blob: pdfBlob(await extractPages(src.bytes, r.pages)) }], note: `New order: ${r.pages.length} pages` })
      } else if (tab === 'images') {
        const bytes = await imagesToPdf(pics.map((p) => p.input), { pageSize, orientation, margin })
        setOut({ files: [{ name: 'images.pdf', blob: pdfBlob(bytes) }], note: `${pics.length} image${pics.length === 1 ? '' : 's'}, one per page` })
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') } finally { setBusy(null) }
  }

  async function downloadAll() {
    if (!out) return
    if (out.files.length === 1) { downloadBlob(out.files[0].blob, out.files[0].name); return }
    const zip = new JSZip(); out.files.forEach((f) => zip.file(f.name, f.blob))
    downloadBlob(await zip.generateAsync({ type: 'blob', compression: 'STORE' }), 'split-pdfs.zip')
  }

  const src = pdfs[0]
  const ready = tab === 'merge' ? pdfs.length >= 2 : tab === 'images' ? pics.length >= 1 : Boolean(src) && (tab === 'split' ? (splitMode === 'every' || spec.trim() !== '') : spec.trim() !== '')

  return (
    <div className="space-y-6">
      <Segmented label="What do you want to do?" value={tab} onChange={switchTab} options={[{ value: 'merge', label: 'Merge PDFs' }, { value: 'split', label: 'Split' }, { value: 'pages', label: 'Delete / rotate / reorder' }, { value: 'images', label: 'Images to PDF' }]} />

      {tab === 'images'
        ? <FileDrop accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp" multiple maxBytes={40 * 1024 * 1024} maxFiles={100} label="Add images" hint="PNG, JPG, WebP, GIF, BMP" onFiles={(f) => void addPics(f)} onReject={setError} />
        : (tab === 'merge' || pdfs.length === 0) && <FileDrop accept="application/pdf,.pdf" multiple={tab === 'merge'} maxBytes={PDF_MAX} maxFiles={LIMITS.maxFiles} label={tab === 'merge' ? 'Add PDFs to merge' : 'Choose a PDF'} hint="PDF" onFiles={(f) => void addPdfs(f)} onReject={setError} />}

      {busy && <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}
      {error && <ErrorNote>{error}</ErrorNote>}

      {tab === 'images' && pics.length > 0 && (
        <Card title={`Images (${pics.length}): the order here is the page order`}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pics.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-2.5 dark:border-zinc-800">
                {}
                <img src={p.url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i + 1}. {p.name}</p><p className="text-xs text-zinc-500">{formatBytes(p.size)}</p></div>
                <div className="flex shrink-0">
                  <button type="button" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => setPics(move(pics, i, i - 1))} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Move ${p.name} down`} disabled={i === pics.length - 1} onClick={() => setPics(move(pics, i, i + 1))} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Remove ${p.name}`} onClick={() => { URL.revokeObjectURL(p.url); setPics(pics.filter((x) => x.id !== p.id)) }} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Page size" htmlFor="pt-size"><select id="pt-size" value={pageSize} onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')} className={inputClass}><option value="a4">A4</option><option value="letter">US Letter</option><option value="fit">Same as the image</option></select></Field>
            <Field label="Orientation" htmlFor="pt-or"><select id="pt-or" value={orientation} onChange={(e) => setOrientation(e.target.value as 'auto' | 'portrait' | 'landscape')} disabled={pageSize === 'fit'} className={inputClass}><option value="auto">Automatic</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></Field>
            <Field label="Margin" htmlFor="pt-m"><select id="pt-m" value={margin} onChange={(e) => setMargin(Number(e.target.value))} disabled={pageSize === 'fit'} className={inputClass}><option value={0}>None</option><option value={24}>Small</option><option value={48}>Medium</option></select></Field>
          </div>
        </Card>
      )}

      {tab === 'merge' && pdfs.length > 0 && (
        <Card title={`PDFs to merge (${pdfs.length}): the order here is the order in the result`}>
          <ul className="space-y-2">
            {pdfs.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
                <FileText className="h-5 w-5 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{i + 1}. {p.name}</p><p className="text-xs text-zinc-500">{p.pages} page{p.pages === 1 ? '' : 's'} · {formatBytes(p.size)}</p></div>
                <button type="button" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => setPdfs(move(pdfs, i, i - 1))} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" aria-label={`Move ${p.name} down`} disabled={i === pdfs.length - 1} onClick={() => setPdfs(move(pdfs, i, i + 1))} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setPdfs(pdfs.filter((x) => x.id !== p.id))} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          {pdfs.length < 2 && <p className="mt-3 text-sm text-zinc-500">Add one more PDF to merge.</p>}
        </Card>
      )}

      {(tab === 'split' || tab === 'pages') && src && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-red-500" /><div className="min-w-0"><p className="truncate font-medium">{src.name}</p><p className="text-sm text-zinc-500">{src.pages} page{src.pages === 1 ? '' : 's'} · {formatBytes(src.size)}</p></div></div>
            <button type="button" onClick={() => { setPdfs([]); reset() }} className="rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Choose another</button>
          </div>
          <div className="mt-5 space-y-4">
            {tab === 'split' && (
              <>
                <Segmented label="Split by" value={splitMode} onChange={setSplitMode} options={[{ value: 'every', label: 'Every N pages' }, { value: 'extract', label: 'Pick pages' }]} />
                {splitMode === 'every'
                  ? <Field label="Pages per file" htmlFor="pt-every"><input id="pt-every" value={every} inputMode="numeric" onChange={(e) => setEvery(e.target.value.replace(/\D/g, '').slice(0, 4))} className={inputClass} /></Field>
                  : <Field label="Pages to keep" htmlFor="pt-spec" hint="Examples: 1-3, 5, 8-  ·  odd  ·  even  ·  last. Order is kept, so 3,1,2 reorders."><input id="pt-spec" value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="1-3, 5" className={inputClass} /></Field>}
              </>
            )}
            {tab === 'pages' && (
              <>
                <Segmented label="Action" value={pageAction} onChange={(v) => { setPageAction(v); reset() }} options={[{ value: 'delete', label: 'Delete pages' }, { value: 'rotate', label: 'Rotate pages' }, { value: 'reorder', label: 'Reorder pages' }]} />
                <Field label={pageAction === 'reorder' ? 'New page order' : 'Pages'} htmlFor="pt-spec2" hint={pageAction === 'reorder' ? `Write every page in the order you want, e.g. ${src.pages >= 3 ? '3, 1, 2' : '2, 1'}. Pages you leave out are dropped.` : 'Examples: 2, 4-6, last, odd'}><input id="pt-spec2" value={spec} onChange={(e) => setSpec(e.target.value)} className={inputClass} /></Field>
                {pageAction === 'rotate' && <Field label="Rotate clockwise by" htmlFor="pt-angle"><select id="pt-angle" value={angle} onChange={(e) => setAngle(Number(e.target.value) as 90 | 180 | 270)} className={inputClass}><option value={90}>90°</option><option value={180}>180°</option><option value={270}>270°</option></select></Field>}
              </>
            )}
          </div>
        </Card>
      )}

      {ready && !out && (
        <button type="button" onClick={() => void run()} disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === 'images' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          {tab === 'merge' ? 'Merge PDFs' : tab === 'split' ? 'Split PDF' : tab === 'images' ? 'Create PDF' : pageAction === 'delete' ? 'Delete pages' : pageAction === 'rotate' ? 'Rotate pages' : 'Reorder pages'}
        </button>
      )}

      {out && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-lg font-semibold" data-testid="pdf-tool-result">{out.files.length === 1 ? out.files[0].name : `${out.files.length} PDF files`}</p><p className="text-sm text-zinc-500">{out.note} · {formatBytes(out.files.reduce((s, f) => s + f.blob.size, 0))}</p></div>
            <div className="flex gap-2"><button type="button" onClick={() => void downloadAll()} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"><Download className="h-4 w-4" />{out.files.length > 1 ? 'Download ZIP' : 'Download'}</button><button type="button" onClick={reset} className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Edit again</button></div>
          </div>
        </Card>
      )}

      <Note>Everything happens in your browser: your PDFs and images are never uploaded. Password-protected PDFs cannot be edited (remove the password first). Merging and splitting keep the original text, fonts and images exactly as they were.</Note>
    </div>
  )
}
