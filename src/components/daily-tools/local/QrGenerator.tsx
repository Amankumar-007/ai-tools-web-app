'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, ImageIcon, X } from 'lucide-react'

import { buildQr, type Fields, type QrKind } from '@/lib/daily-tools/qr'
import { canvasToBlob, downloadBlob, imageSize, loadImage } from '../download'
import { Card, CopyButton, ErrorNote, Field, inputClass, Note, SelectField } from '../ui'

interface FieldDef { id: string; label: string; placeholder?: string; type?: 'text' | 'textarea' | 'select'; options?: Array<[string, string]>; hint?: string }
const KINDS: Array<{ id: QrKind; label: string; fields: FieldDef[]; hint?: string }> = [
  { id: 'url', label: 'Website link', fields: [{ id: 'url', label: 'Web address', placeholder: 'example.com/menu' }] },
  { id: 'upi', label: 'UPI payment', hint: 'Anyone can scan this with GPay, PhonePe, Paytm or any UPI app. Leave the amount empty to let the payer type it.', fields: [{ id: 'pa', label: 'UPI ID', placeholder: 'yourname@okhdfcbank' }, { id: 'pn', label: 'Payee name', placeholder: 'Tomato Store' }, { id: 'am', label: 'Amount in ₹ (optional)', placeholder: '499' }, { id: 'tn', label: 'Note (optional)', placeholder: 'Order 1042' }] },
  { id: 'whatsapp', label: 'WhatsApp chat', fields: [{ id: 'phone', label: 'WhatsApp number', placeholder: '98765 43210' }, { id: 'message', label: 'Pre-filled message (optional)', placeholder: 'Hi, I would like to order…', type: 'textarea' }] },
  { id: 'wifi', label: 'Wi-Fi', hint: 'Guests scan it to join your Wi-Fi without typing the password.', fields: [{ id: 'ssid', label: 'Network name (SSID)' }, { id: 'password', label: 'Password' }, { id: 'security', label: 'Security', type: 'select', options: [['WPA', 'WPA / WPA2 / WPA3'], ['WEP', 'WEP (old)'], ['nopass', 'No password']] }, { id: 'hidden', label: 'Hidden network?', type: 'select', options: [['no', 'No'], ['yes', 'Yes']] }] },
  { id: 'vcard', label: 'Contact card', fields: [{ id: 'name', label: 'Full name' }, { id: 'org', label: 'Company (optional)' }, { id: 'title', label: 'Job title (optional)' }, { id: 'phone', label: 'Phone (optional)', placeholder: '98765 43210' }, { id: 'email', label: 'Email (optional)' }, { id: 'url', label: 'Website (optional)' }] },
  { id: 'text', label: 'Plain text', fields: [{ id: 'text', label: 'Text', type: 'textarea' }] },
  { id: 'email', label: 'Email', fields: [{ id: 'to', label: 'To', placeholder: 'hello@example.com' }, { id: 'subject', label: 'Subject (optional)' }, { id: 'body', label: 'Message (optional)', type: 'textarea' }] },
  { id: 'phone', label: 'Phone call', fields: [{ id: 'phone', label: 'Phone number', placeholder: '98765 43210' }] },
  { id: 'sms', label: 'SMS', fields: [{ id: 'phone', label: 'Phone number' }, { id: 'message', label: 'Message (optional)', type: 'textarea' }] },
  { id: 'geo', label: 'Location', fields: [{ id: 'lat', label: 'Latitude', placeholder: '19.0760' }, { id: 'lng', label: 'Longitude', placeholder: '72.8777' }] },
]

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const lum = (h: string) => { const [r, g, b] = hexToRgb(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
/** WCAG contrast ratio between two #rrggbb colours. */
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

async function drawQr(canvas: HTMLCanvasElement, payload: string, o: { size: number; ecc: 'L' | 'M' | 'Q' | 'H'; fg: string; bg: string; logo: ImageBitmap | HTMLImageElement | null }) {
  await QRCode.toCanvas(canvas, payload, { width: o.size, margin: 2, errorCorrectionLevel: o.logo ? 'H' : o.ecc, color: { dark: o.fg, light: o.bg } })
  if (o.logo) {
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const box = Math.round(canvas.width * 0.22); const x = Math.round((canvas.width - box) / 2); const pad = Math.round(box * 0.12)
    ctx.fillStyle = o.bg; ctx.beginPath()
    if (typeof ctx.roundRect === 'function') ctx.roundRect(x - pad, x - pad, box + pad * 2, box + pad * 2, pad)
    else ctx.rect(x - pad, x - pad, box + pad * 2, box + pad * 2)
    ctx.fill()
    const { w, h } = imageSize(o.logo); const s = Math.min(box / w, box / h)
    ctx.drawImage(o.logo, x + (box - w * s) / 2, x + (box - h * s) / 2, w * s, h * s)
  }
}

export default function QrGenerator() {
  const [kind, setKind] = useState<QrKind>('url')
  const [fields, setFields] = useState<Fields>({ url: 'tomatoai.in', security: 'WPA', hidden: 'no' })
  const [fg, setFg] = useState('#111111'); const [bg, setBg] = useState('#ffffff')
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [size, setSize] = useState(1024)
  const [logo, setLogo] = useState<ImageBitmap | HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const def = KINDS.find((k) => k.id === kind)!

  const result = buildQr(kind, fields)
  const ratio = contrast(fg, bg)
  const inverted = lum(fg) > lum(bg)

  useEffect(() => {
    const c = canvas.current; if (!c || !result.ok) return
    void drawQr(c, result.payload, { size: 280, ecc, fg, bg, logo }).catch(() => setError('Could not draw the code.'))
  }, [result.ok ? result.payload : null, ecc, fg, bg, logo]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (id: string, v: string) => setFields((f) => ({ ...f, [id]: v }))

  async function png() {
    if (!result.ok) return
    const c = document.createElement('canvas')
    await drawQr(c, result.payload, { size, ecc, fg, bg, logo })
    downloadBlob(await canvasToBlob(c, 'image/png'), `qr-${kind}.png`); c.width = 0
  }
  async function svg() {
    if (!result.ok) return
    downloadBlob(await QRCode.toString(result.payload, { type: 'svg', margin: 2, errorCorrectionLevel: ecc, color: { dark: fg, light: bg } }), `qr-${kind}.svg`, 'image/svg+xml')
  }
  const onLogo = useCallback(async (file: File | undefined) => {
    if (!file) return
    try { if (file.size > 5 * 1024 * 1024) throw new Error('The logo is larger than 5 MB.'); setLogo(await loadImage(file)); setError(null) } catch (e) { setError(e instanceof Error ? e.message : 'Could not read the logo.') }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="QR code type">
        {KINDS.map((k) => <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} onClick={() => { setKind(k.id); setError(null) }} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${kind === k.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'}`}>{k.label}</button>)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-6">
          <Card title="Content">
            <div className="space-y-4">
              {def.hint && <p className="text-sm text-zinc-600 dark:text-zinc-400">{def.hint}</p>}
              {def.fields.map((f) => f.type === 'select'
                ? <SelectField key={f.id} label={f.label} value={fields[f.id] ?? f.options![0][0]} onChange={(v) => set(f.id, v)} options={f.options!.map(([value, label]) => ({ value, label }))} />
                : <Field key={f.id} label={f.label} htmlFor={`qr-${f.id}`}>{f.type === 'textarea' ? <textarea id={`qr-${f.id}`} rows={3} value={fields[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)} className={`${inputClass} resize-y`} /> : <input id={`qr-${f.id}`} value={fields[f.id] ?? ''} placeholder={f.placeholder} autoComplete="off" onChange={(e) => set(f.id, e.target.value)} className={inputClass} />}</Field>)}
              {!result.ok && <p role="alert" className="text-sm text-amber-700 dark:text-amber-400">{result.error}</p>}
            </div>
          </Card>
          <Card title="Style">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3"><label htmlFor="qr-fg" className="w-28 text-sm font-medium">Code colour</label><input id="qr-fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-transparent dark:border-zinc-700" /></div>
              <div className="flex items-center gap-3"><label htmlFor="qr-bg" className="w-28 text-sm font-medium">Background</label><input id="qr-bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-transparent dark:border-zinc-700" /></div>
              <SelectField label="Error correction" value={logo ? 'H' : ecc} onChange={(v) => setEcc(v as 'L' | 'M' | 'Q' | 'H')} options={[{ value: 'L', label: 'Low (smallest code)' }, { value: 'M', label: 'Medium (recommended)' }, { value: 'Q', label: 'Quartile' }, { value: 'H', label: 'High (survives damage)' }]} hint={logo ? 'High is used automatically with a logo.' : undefined} />
              <SelectField label="Download size" value={String(size)} onChange={(v) => setSize(Number(v))} options={[{ value: '512', label: '512 px (web)' }, { value: '1024', label: '1024 px (print, small)' }, { value: '2048', label: '2048 px (print, large)' }]} />
            </div>
            {(ratio < 3 || inverted) && <div className="mt-4"><ErrorNote>{inverted ? 'The code is lighter than its background. Many scanners cannot read inverted codes: use a dark code on a light background.' : `Low contrast (${ratio.toFixed(1)}:1). Scanners need at least 3:1: make the code darker or the background lighter.`}</ErrorNote></div>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ImageIcon className="h-4 w-4" />{logo ? 'Change logo' : 'Add a logo in the middle'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg" className="sr-only" onChange={(e) => { void onLogo(e.target.files?.[0]); e.target.value = '' }} /></label>
              {logo && <button type="button" onClick={() => setLogo(null)} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-red-600"><X className="h-4 w-4" />Remove logo</button>}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Your QR code" className="lg:sticky lg:top-28">
            <div className="flex justify-center rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800" style={{ background: bg }}>
              {result.ok ? <canvas ref={canvas} width={280} height={280} className="h-auto w-full max-w-[280px]" aria-label="Generated QR code" data-testid="qr-canvas" /> : <div className="flex h-[280px] w-[280px] items-center justify-center text-center text-sm text-zinc-500">Fill in the form to see your code</div>}
            </div>
            {error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={!result.ok} onClick={() => void png()} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"><Download className="h-4 w-4" />PNG</button>
              <button type="button" disabled={!result.ok} onClick={() => void svg()} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"><Download className="h-4 w-4" />SVG</button>
              {result.ok && <CopyButton text={result.payload} label="Copy text" />}
            </div>
            {result.ok && <p className="mt-3 break-all text-xs text-zinc-500" data-testid="qr-payload">{result.payload.length > 160 ? `${result.payload.slice(0, 160)}…` : result.payload}</p>}
            {logo && <p className="mt-2 text-xs text-zinc-500">The SVG does not include the logo.</p>}
          </Card>
        </div>
      </div>
      <Note>Codes are made on your device and never uploaded; they never expire and do not track scans. Always test a code with your phone before printing, especially payment codes. Print them at least 2 cm wide with a quiet white margin.</Note>
    </div>
  )
}
