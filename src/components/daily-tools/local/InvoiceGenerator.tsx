'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react'

import { formatINR, rupeesInWords } from '@/lib/daily-tools/calc/format'
import { formatDate, parseDate, todayLocal } from '@/lib/daily-tools/calc/dates'
import { calculateInvoice, isInvoiceNo, LIMITS, STATE_CODES, supplyType, validateGstin, validateItem, type InvoiceItem, type Supply } from '@/lib/daily-tools/invoice'
import { buildInvoicePdf, type InvoiceData, type Party } from '@/lib/daily-tools/invoice-pdf'
import { buildQr, UPI_ID } from '@/lib/daily-tools/qr'
import { downloadBlob } from '../download'
import { useLocalStorage } from '../hooks'
import { Card, ErrorNote, Field, inputClass, Note, parseNum, Segmented, Stat } from '../ui'

interface Row { id: string; description: string; hsn: string; qty: string; rate: string; discount: string; gst: string }
interface Profile { seller: Party; bank: string; upiId: string; notes: string; lastNumber: string; remember: boolean }

const EMPTY_PARTY: Party = { name: '', address: '', gstin: '', state: '', phone: '', email: '' }
const DEFAULT_PROFILE: Profile = { seller: EMPTY_PARTY, bank: '', upiId: '', notes: 'Thank you for your business.', lastNumber: '', remember: true }
const GST_RATES = ['0', '3', '5', '12', '18', '28', '40']
let seq = 0
const newRow = (over: Partial<Row> = {}): Row => ({ id: `r${++seq}`, description: '', hsn: '', qty: '1', rate: '', discount: '0', gst: '18', ...over })

/** INV-2026-009 -> INV-2026-010 (keeps the width of the trailing number). */
export function nextInvoiceNumber(prev: string, year: number): string {
  const m = /^(.*?)(\d+)$/.exec(prev.trim())
  if (!m) return `INV-${year}-001`
  return `${m[1]}${String(Number(m[2]) + 1).padStart(m[2].length, '0')}`
}

const stateOptions = Object.entries(STATE_CODES).map(([code, name]) => ({ code, label: `${name} (${code})` })).sort((a, b) => a.label.localeCompare(b.label))

function PartyFields({ title, party, onChange, gstinOptional = true }: { title: string; party: Party; onChange: (p: Party) => void; gstinOptional?: boolean }) {
  const g = party.gstin.trim() === '' ? null : validateGstin(party.gstin)
  const set = (k: keyof Party, v: string) => onChange({ ...party, [k]: v })
  return (
    <div className="space-y-3">
      <Field label={`${title} name`} htmlFor={`${title}-name`}><input id={`${title}-name`} value={party.name} maxLength={80} onChange={(e) => set('name', e.target.value)} className={inputClass} autoComplete="off" /></Field>
      <Field label="Address" htmlFor={`${title}-addr`}><textarea id={`${title}-addr`} rows={2} value={party.address} maxLength={240} onChange={(e) => set('address', e.target.value)} className={`${inputClass} resize-y`} /></Field>
      <Field label={`GSTIN${gstinOptional ? ' (optional)' : ''}`} htmlFor={`${title}-gstin`} hint={g ? (g.ok ? <span className="text-emerald-600">Valid · {g.state}</span> : <span className="text-red-600">{g.error}</span>) : undefined}><input id={`${title}-gstin`} value={party.gstin} maxLength={15} onChange={(e) => { const v = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); const r = v.length === 15 ? validateGstin(v) : null; onChange({ ...party, gstin: v, state: r?.ok ? r.stateCode : party.state }) }} placeholder="27AAPFU0939F1ZV" className={`${inputClass} font-mono uppercase`} autoComplete="off" /></Field>
      <Field label="State" htmlFor={`${title}-state`}><select id={`${title}-state`} value={party.state} onChange={(e) => set('state', e.target.value)} className={inputClass}><option value="">Choose a state…</option>{stateOptions.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}</select></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Phone" htmlFor={`${title}-ph`}><input id={`${title}-ph`} value={party.phone} maxLength={20} onChange={(e) => set('phone', e.target.value)} className={inputClass} inputMode="tel" /></Field><Field label="Email" htmlFor={`${title}-em`}><input id={`${title}-em`} value={party.email} maxLength={80} onChange={(e) => set('email', e.target.value)} className={inputClass} inputMode="email" /></Field></div>
    </div>
  )
}

export default function InvoiceGenerator() {
  const [profile, setProfile, ready] = useLocalStorage<Profile>('tomato_invoice_profile_v1', DEFAULT_PROFILE)
  const [seller, setSeller] = useState<Party>(EMPTY_PARTY)
  const [buyer, setBuyer] = useState<Party>(EMPTY_PARTY)
  const [bank, setBank] = useState(''); const [upiId, setUpiId] = useState(''); const [notes, setNotes] = useState('Thank you for your business.')
  const [number, setNumber] = useState(''); const [date, setDate] = useState(''); const [dueDate, setDueDate] = useState('')
  const [gstMode, setGstMode] = useState<'gst' | 'none'>('gst')
  const [roundOff, setRoundOff] = useState(true); const [withQr, setWithQr] = useState(true); const [remember, setRemember] = useState(true)
  const [rows, setRows] = useState<Row[]>([newRow({ description: '', rate: '' })])
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [note, setNote] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Fill defaults once the saved profile (if any) has loaded and the clock is readable.
  useEffect(() => {
    if (!ready || loaded) return
    const t = todayLocal(); const today = formatDate(t)
    setSeller({ ...EMPTY_PARTY, ...profile.seller }); setBank(profile.bank); setUpiId(profile.upiId); setNotes(profile.notes); setRemember(profile.remember)
    setNumber(nextInvoiceNumber(profile.lastNumber, t.y)); setDate(today); setLoaded(true)
  }, [ready, loaded, profile])

  const items: InvoiceItem[] = useMemo(() => rows.map((r) => ({ description: r.description, hsn: r.hsn.trim(), qty: parseNum(r.qty), rate: parseNum(r.rate), discountPct: r.discount.trim() === '' ? 0 : parseNum(r.discount), gstRate: parseNum(r.gst) })), [rows])
  const sellerCode = seller.state; const placeCode = buyer.state
  const supply: Supply = gstMode === 'none' ? 'none' : supplyType(sellerCode, placeCode)
  const totals = useMemo(() => { try { return { t: calculateInvoice(items, supply, roundOff), e: null as string | null } } catch (e) { return { t: null, e: e instanceof RangeError ? e.message : 'Check the items.' } } }, [items, supply, roundOff])

  const upiOk = UPI_ID.test(upiId.trim())
  const setRow = (id: string, patch: Partial<Row>) => setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  async function generate() {
    setError(null); setNote(null)
    const problems: string[] = []
    if (!seller.name.trim()) problems.push('Enter your business name.')
    if (!buyer.name.trim()) problems.push('Enter the customer name.')
    if (!isInvoiceNo(number)) problems.push('Invoice number: up to 16 letters, digits, / - _ . (no spaces).')
    if (!parseDate(date)) problems.push('Choose a valid invoice date.')
    if (dueDate && !parseDate(dueDate)) problems.push('Choose a valid due date.')
    for (const [label, p] of [['Your', seller], ['Customer', buyer]] as const) if (p.gstin.trim() && !validateGstin(p.gstin).ok) problems.push(`${label} GSTIN is not valid.`)
    if (gstMode === 'gst' && !sellerCode) problems.push('Choose your state (or enter your GSTIN) so the right tax (CGST+SGST or IGST) is applied.')
    if (gstMode === 'gst' && !placeCode) problems.push("Choose the customer's state (place of supply).")
    items.forEach((it, i) => { const e = validateItem(it, i + 1); if (e) problems.push(e) })
    if (problems.length) { setError(problems[0] + (problems.length > 1 ? ` (and ${problems.length - 1} more)` : '')); return }

    setBusy(true)
    try {
      const total = calculateInvoice(items, supply, roundOff).grand
      let qrPng: Uint8Array | undefined
      if (withQr && upiOk) {
        const q = buildQr('upi', { pa: upiId.trim(), pn: seller.name, am: total > 0 ? String(total) : '', tn: number })
        if (q.ok) {
          // Decode the base64 directly: fetch() of a data: URL is blocked by the site's content security policy.
          const dataUrl = await QRCode.toDataURL(q.payload, { margin: 2, scale: 6, errorCorrectionLevel: 'M' })
          qrPng = Uint8Array.from(atob(dataUrl.split(',')[1]), (c) => c.charCodeAt(0))
        }
      }
      const data: InvoiceData = {
        title: supply === 'none' ? 'Invoice' : 'Tax Invoice', number: number.trim(), date, dueDate, placeOfSupply: STATE_CODES[placeCode] ?? '',
        seller, buyer, items, supply, roundOff, notes, bank, upiId: upiOk ? upiId.trim() : '', currencyLabel: 'INR',
      }
      const { bytes, replaced } = await buildInvoicePdf(data, qrPng)
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `Invoice-${number.trim().replace(/[^\w.-]/g, '-')}.pdf`)
      if (remember) setProfile({ seller, bank, upiId, notes, lastNumber: number.trim(), remember: true })
      else setProfile({ ...DEFAULT_PROFILE, remember: false })
      setNumber(nextInvoiceNumber(number, todayLocal().y))
      setNote(replaced ? 'Invoice downloaded. Note: the PDF font supports English letters only, so any Hindi or other-script letters were replaced with "?". Write names in English for the PDF.' : 'Invoice downloaded. The next invoice number is ready.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create the PDF.') } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="From (your business)"><PartyFields title="Your business" party={seller} onChange={setSeller} /></Card>
        <Card title="Bill to (customer)"><PartyFields title="Customer" party={buyer} onChange={setBuyer} /></Card>
      </div>

      <Card title="Invoice details">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Invoice number" htmlFor="inv-no"><input id="inv-no" value={number} maxLength={16} onChange={(e) => setNumber(e.target.value)} className={inputClass} /></Field>
          <Field label="Invoice date" htmlFor="inv-date"><input id="inv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></Field>
          <Field label="Due date (optional)" htmlFor="inv-due"><input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Segmented label="Tax" value={gstMode} onChange={setGstMode} options={[{ value: 'gst', label: 'Charge GST' }, { value: 'none', label: 'No GST (unregistered)' }]} />
          <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={roundOff} onChange={(e) => setRoundOff(e.target.checked)} className="h-4 w-4 accent-orange-500" />Round off to whole rupees</label>
        </div>
        {gstMode === 'gst' && sellerCode && placeCode && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400" data-testid="supply-note">{supply === 'intra' ? <>Same state ({STATE_CODES[sellerCode]}): <strong>CGST + SGST</strong> will be charged.</> : <>Supply from {STATE_CODES[sellerCode]} to {STATE_CODES[placeCode]}: <strong>IGST</strong> will be charged.</>}</p>}
      </Card>

      <Card title={`Items (${rows.length}/${LIMITS.maxItems})`}>
        <ul className="space-y-4">
          {rows.map((r, i) => {
            const t = totals.t?.lines[i]
            return (
              <li key={r.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="grid gap-3 sm:grid-cols-6">
                  <div className="sm:col-span-6"><Field label={`Item ${i + 1}`} htmlFor={`${r.id}-d`}><input id={`${r.id}-d`} value={r.description} maxLength={200} onChange={(e) => setRow(r.id, { description: e.target.value })} placeholder="Description of goods or service" className={inputClass} /></Field></div>
                  <Field label="HSN/SAC" htmlFor={`${r.id}-h`}><input id={`${r.id}-h`} value={r.hsn} maxLength={8} inputMode="numeric" onChange={(e) => setRow(r.id, { hsn: e.target.value.replace(/\D/g, '') })} className={inputClass} /></Field>
                  <Field label="Qty" htmlFor={`${r.id}-q`}><input id={`${r.id}-q`} value={r.qty} inputMode="decimal" onChange={(e) => setRow(r.id, { qty: e.target.value.replace(/[^\d.]/g, '').slice(0, 10) })} className={inputClass} /></Field>
                  <Field label="Rate (₹)" htmlFor={`${r.id}-r`}><input id={`${r.id}-r`} value={r.rate} inputMode="decimal" onChange={(e) => setRow(r.id, { rate: e.target.value.replace(/[^\d.]/g, '').slice(0, 12) })} className={inputClass} /></Field>
                  <Field label="Discount %" htmlFor={`${r.id}-x`}><input id={`${r.id}-x`} value={r.discount} inputMode="decimal" onChange={(e) => setRow(r.id, { discount: e.target.value.replace(/[^\d.]/g, '').slice(0, 6) })} className={inputClass} /></Field>
                  {gstMode === 'gst' && <Field label="GST %" htmlFor={`${r.id}-g`}><select id={`${r.id}-g`} value={GST_RATES.includes(r.gst) ? r.gst : 'custom'} onChange={(e) => setRow(r.id, { gst: e.target.value === 'custom' ? '' : e.target.value })} className={inputClass}>{GST_RATES.map((g) => <option key={g} value={g}>{g}%</option>)}<option value="custom">Other…</option></select></Field>}
                  <div className="flex items-end justify-between gap-2 sm:col-span-1">{t && <span className="pb-2 text-sm font-semibold tabular-nums">{formatINR(t.total, true)}</span>}<button type="button" aria-label={`Remove item ${i + 1}`} disabled={rows.length === 1} onClick={() => setRows((cur) => cur.filter((x) => x.id !== r.id))} className="mb-1 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 disabled:opacity-30 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button></div>
                </div>
                {gstMode === 'gst' && !GST_RATES.includes(r.gst) && <div className="mt-3 max-w-[10rem]"><Field label="Custom GST %" htmlFor={`${r.id}-gc`}><input id={`${r.id}-gc`} value={r.gst} inputMode="decimal" onChange={(e) => setRow(r.id, { gst: e.target.value.replace(/[^\d.]/g, '').slice(0, 6) })} className={inputClass} /></Field></div>}
              </li>
            )
          })}
        </ul>
        <button type="button" disabled={rows.length >= LIMITS.maxItems} onClick={() => setRows((cur) => [...cur, newRow()])} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"><Plus className="h-4 w-4" />Add item</button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Payment and notes">
          <div className="space-y-3">
            <Field label="UPI ID (adds a Scan-to-pay QR)" htmlFor="inv-upi" hint={upiId.trim() ? (upiOk ? <span className="text-emerald-600">Looks right</span> : <span className="text-red-600">That is not a valid UPI ID (like name@bank).</span>) : undefined}><input id="inv-upi" value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} placeholder="yourname@okhdfcbank" className={inputClass} autoComplete="off" /></Field>
            {upiOk && <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={withQr} onChange={(e) => setWithQr(e.target.checked)} className="h-4 w-4 accent-orange-500" />Print the payment QR (amount pre-filled)</label>}
            <Field label="Bank details (optional)" htmlFor="inv-bank"><textarea id="inv-bank" rows={2} value={bank} maxLength={300} onChange={(e) => setBank(e.target.value)} placeholder="Bank, account number, IFSC" className={`${inputClass} resize-y`} /></Field>
            <Field label="Notes / terms" htmlFor="inv-notes"><textarea id="inv-notes" rows={2} value={notes} maxLength={400} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-y`} /></Field>
            <label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Remember my business details on this device (saved only in this browser)</span></label>
          </div>
        </Card>

        <Card title="Summary">
          {totals.e ? <p className="text-sm text-zinc-500">{totals.e}</p> : totals.t && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Taxable value" value={formatINR(totals.t.taxable, true)} />
                <Stat label={supply === 'none' ? 'GST' : supply === 'intra' ? 'CGST + SGST' : 'IGST'} value={formatINR(totals.t.gst, true)} />
              </div>
              <div className="mt-3"><Stat label="Invoice total" value={formatINR(totals.t.grand, true)} sub={totals.t.grand > 0 && totals.t.grand < 1e12 ? rupeesInWords(totals.t.grand) : undefined} /></div>
            </>
          )}
          {error && <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>}
          {note && <p className="mt-4 text-sm text-emerald-600" role="status">{note}</p>}
          <button type="button" onClick={() => void generate()} disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{busy ? 'Creating PDF…' : 'Download invoice (PDF)'}</button>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><FileText className="h-3.5 w-3.5" />Created on your device. Nothing is uploaded or stored on our servers.</p>
        </Card>
      </div>
      <Note>This tool does the arithmetic and layout of a GST invoice, and checks GSTIN format and checksum. It does not verify that a GSTIN is registered, choose the correct GST rate or HSN code for your goods, file returns, or generate e-invoice IRN / e-way bills. Confirm rates and compliance with your accountant. The PDF uses English letters; amounts show as &quot;Rs.&quot;.</Note>
    </div>
  )
}
