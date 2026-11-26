'use client'

/* Previews of local files and remote thumbnails: next/image cannot optimise blob: or data: URLs. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react'
import JSZip from 'jszip'
import { FileText, Loader2, Download, X } from 'lucide-react'
import { FaFileExcel, FaFileImage, FaFileCode, FaFileLines, FaFileWord } from 'react-icons/fa6'
import { SiMarkdown } from 'react-icons/si'

import { closePdf, extractLayout, openPdf, PDF_LIMITS, PdfError, renderPage, type OpenedPdf } from '@/lib/daily-tools/pdf/pipeline'
import { parsePageRanges } from '@/lib/daily-tools/pdf/tools'
import { toDocx, toHtml, toMarkdown, toText, toXlsx } from '@/lib/daily-tools/pdf/writers'
import { baseName, downloadBlob, formatBytes } from '../download'
import FileDrop from '../FileDrop'
import { Card, ErrorNote, Field, inputClass, Note } from '../ui'

type Format = 'docx' | 'xlsx' | 'txt' | 'md' | 'html' | 'images'

const FORMATS: Array<{ id: Format; label: string; sub: string; icon: React.ReactNode; color: string }> = [
  { id: 'docx', label: 'Word', sub: '.docx', icon: <FaFileWord />, color: '#2b579a' },
  { id: 'xlsx', label: 'Excel', sub: '.xlsx', icon: <FaFileExcel />, color: '#217346' },
  { id: 'txt', label: 'Text', sub: '.txt', icon: <FaFileLines />, color: '#64748b' },
  { id: 'md', label: 'Markdown', sub: '.md', icon: <SiMarkdown />, color: '#0f172a' },
  { id: 'html', label: 'HTML', sub: '.html', icon: <FaFileCode />, color: '#e34f26' },
  { id: 'images', label: 'Images', sub: 'PNG / JPG', icon: <FaFileImage />, color: '#a855f7' },
]

interface Result { blob: Blob; name: string; note: string; preview?: string; thumbs?: string[] }

export default function PdfConverter() {
  const [opened, setOpened] = useState<OpenedPdf | null>(null)
  const [format, setFormat] = useState<Format>('docx')
  const [range, setRange] = useState('')
  const [stripHeaders, setStripHeaders] = useState(true)
  const [pageBreaks, setPageBreaks] = useState(true)
  const [pageMarkers, setPageMarkers] = useState(false)
  const [singleSheet, setSingleSheet] = useState(false)
  const [imgType, setImgType] = useState<'image/png' | 'image/jpeg'>('image/png')
  const [scale, setScale] = useState(2)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const openedRef = useRef<OpenedPdf | null>(null)
  const urls = useRef<string[]>([])

  const clearResult = useCallback(() => { urls.current.forEach((u) => URL.revokeObjectURL(u)); urls.current = []; setResult(null) }, [])
  useEffect(() => () => { void closePdf(openedRef.current); urls.current.forEach((u) => URL.revokeObjectURL(u)) }, [])

  const onFiles = useCallback(async (files: File[]) => {
    setError(null); setWarning(null); clearResult()
    setBusy('Opening your PDF…')
    try {
      await closePdf(openedRef.current)
      const o = await openPdf(files[0])
      openedRef.current = o; setOpened(o); setRange('')
    } catch (e) {
      openedRef.current = null; setOpened(null)
      setError(e instanceof PdfError ? e.message : 'Could not open this PDF.')
    } finally { setBusy(null) }
  }, [clearResult])

  async function convert() {
    if (!opened || busy) return
    setError(null); setWarning(null); clearResult()
    const selection = range.trim() === '' ? parsePageRanges('all', opened.pageCount) : parsePageRanges(range, opened.pageCount)
    if (!selection.ok) { setError(selection.error); return }
    const pages = selection.pages
    const stem = baseName(opened.name)
    try {
      if (format === 'images') {
        if (pages.length > PDF_LIMITS.maxImagePages) { setError(`Images can be made for up to ${PDF_LIMITS.maxImagePages} pages at a time. Choose a page range such as 1-${PDF_LIMITS.maxImagePages}.`); return }
        const ext = imgType === 'image/png' ? 'png' : 'jpg'
        const zip = new JSZip(); const thumbs: string[] = []
        for (let i = 0; i < pages.length; i++) {
          setBusy(`Rendering page ${i + 1} of ${pages.length}…`)
          const { blob } = await renderPage(opened, pages[i], { scale, type: imgType, quality: 0.92 })
          zip.file(`${stem}-page-${String(pages[i]).padStart(String(opened.pageCount).length, '0')}.${ext}`, blob)
          if (thumbs.length < 6) { const u = URL.createObjectURL(blob); urls.current.push(u); thumbs.push(u) }
          await new Promise((r) => setTimeout(r, 0))
        }
        if (pages.length === 1) {
          const only = await zip.file(Object.keys(zip.files)[0])!.async('blob')
          setResult({ blob: only, name: `${stem}-page-${pages[0]}.${ext}`, note: `1 page as ${ext.toUpperCase()}`, thumbs })
        } else {
          setBusy('Packing images…')
          setResult({ blob: await zip.generateAsync({ type: 'blob', compression: 'STORE' }), name: `${stem}-images.zip`, note: `${pages.length} ${ext.toUpperCase()} images in a ZIP`, thumbs })
        }
        return
      }

      setBusy(`Reading page 1 of ${pages.length}…`)
      const { pages: laid, scanned } = await extractLayout(opened, pages, { stripHeaders }, (d, t) => setBusy(`Reading page ${d} of ${t}…`))
      if (scanned) setWarning('This PDF looks like a scan or a photo: it has almost no text we can read. Converting scans needs text recognition (OCR), which this tool does not do. Use "Images" to get each page as a picture instead.')
      setBusy('Building your file…')
      const hasTables = laid.some((p) => p.blocks.some((b) => b.type === 'table'))
      if (format === 'docx') {
        const bytes = await toDocx(laid, { title: stem, pageBreaks })
        setResult({ blob: new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), name: `${stem}.docx`, note: `${laid.length} page${laid.length === 1 ? '' : 's'} as an editable Word file${hasTables ? ', tables kept as tables' : ''}` })
      } else if (format === 'xlsx') {
        const bytes = await toXlsx(laid, { singleSheet })
        setResult({ blob: new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), name: `${stem}.xlsx`, note: singleSheet ? 'All pages in one sheet' : `One sheet per page (up to 60)` })
      } else {
        const text = format === 'txt' ? toText(laid, { pageMarkers }) : format === 'md' ? toMarkdown(laid, { pageMarkers }) : toHtml(laid, stem)
        const mime = format === 'html' ? 'text/html' : format === 'md' ? 'text/markdown' : 'text/plain'
        setResult({ blob: new Blob([text], { type: `${mime};charset=utf-8` }), name: `${stem}.${format}`, note: `${text.length.toLocaleString('en-IN')} characters`, preview: text.slice(0, 4000) })
      }
    } catch (e) {
      setError(e instanceof PdfError ? e.message : 'Something went wrong while converting. Try a smaller page range, or a different PDF.')
    } finally { setBusy(null) }
  }

  const fmt = FORMATS.find((f) => f.id === format)!

  return (
    <div className="space-y-6">
      {!opened ? (
        <FileDrop accept="application/pdf,.pdf" maxBytes={PDF_LIMITS.maxBytes} label="Choose a PDF to convert" hint="PDF" onFiles={onFiles} onReject={setError} />
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-600"><FileText className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="truncate font-medium" data-testid="pdf-name">{opened.name}</p><p className="text-sm text-zinc-500">{opened.pageCount} page{opened.pageCount === 1 ? '' : 's'} · {formatBytes(opened.size)}</p></div>
            </div>
            <button type="button" onClick={() => { void closePdf(openedRef.current); openedRef.current = null; setOpened(null); clearResult(); setError(null); setWarning(null) }} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><X className="h-4 w-4" />Choose another</button>
          </div>
        </Card>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}
      {busy && !opened && <p className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}

      {opened && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <Card title="Convert to">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Output format">
              {FORMATS.map((f) => (
                <button key={f.id} type="button" role="radio" aria-checked={format === f.id} onClick={() => { setFormat(f.id); clearResult() }} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-4 text-sm transition-colors ${format === f.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}`}>
                  <span className="text-2xl" style={{ color: f.color }} aria-hidden>{f.icon}</span>
                  <span className="font-semibold">{f.label}</span><span className="text-xs text-zinc-500">{f.sub}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Options">
            <div className="space-y-4">
              <Field label="Pages (optional)" htmlFor="pdf-range" hint="Leave empty for all pages. Examples: 1-3, 5, 8-"><input id="pdf-range" value={range} onChange={(e) => setRange(e.target.value)} placeholder={`1-${opened.pageCount}`} className={inputClass} /></Field>
              {format !== 'images' && <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" checked={stripHeaders} onChange={(e) => setStripHeaders(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Remove repeating headers, footers and page numbers</span></label>}
              {format === 'docx' && <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" checked={pageBreaks} onChange={(e) => setPageBreaks(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Start each PDF page on a new page</span></label>}
              {(format === 'txt' || format === 'md') && <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" checked={pageMarkers} onChange={(e) => setPageMarkers(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Mark where each page starts</span></label>}
              {format === 'xlsx' && <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" checked={singleSheet} onChange={(e) => setSingleSheet(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Put all pages in one sheet</span></label>}
              {format === 'images' && (
                <>
                  <Field label="Image type" htmlFor="img-type"><select id="img-type" value={imgType} onChange={(e) => setImgType(e.target.value as 'image/png' | 'image/jpeg')} className={inputClass}><option value="image/png">PNG (sharp, larger)</option><option value="image/jpeg">JPG (smaller)</option></select></Field>
                  <Field label="Quality" htmlFor="img-scale"><select id="img-scale" value={scale} onChange={(e) => setScale(Number(e.target.value))} className={inputClass}><option value={1}>Standard (72 dpi)</option><option value={2}>High (144 dpi)</option><option value={3}>Print (216 dpi)</option></select></Field>
                </>
              )}
              <button type="button" onClick={() => void convert()} disabled={busy !== null} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span aria-hidden style={{ color: '#fff' }}>{fmt.icon}</span>}
                {busy ?? `Convert to ${fmt.label}`}
              </button>
            </div>
          </Card>
        </div>
      )}

      {warning && <Note>{warning}</Note>}

      {result && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-lg font-semibold" data-testid="pdf-result">{result.name}</p><p className="text-sm text-zinc-500">{result.note} · {formatBytes(result.blob.size)}</p></div>
            <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 dark:bg-white dark:text-black"><Download className="h-4 w-4" />Download</button>
          </div>
          {result.thumbs && <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{result.thumbs.map((u, i) => <img key={u} src={u} alt={`Page ${i + 1} preview`} className="w-full rounded-lg border border-zinc-200 bg-white object-contain dark:border-zinc-700" />)}</div>}
          {result.preview && <pre className="mt-5 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950/50">{result.preview}{result.blob.size > 4000 ? '\n…' : ''}</pre>}
        </Card>
      )}

      <Note>Your PDF is converted inside your browser and is never uploaded. This works best on PDFs with real text (reports, articles, invoices, simple tables). Word and Excel files are built from the text positions, so complex layouts, columns and images will need some tidying; scanned pages need OCR, which this tool does not do. Check the result before you rely on it.</Note>
    </div>
  )
}
