'use client'

/* The preview pages are blob: images made from the PDF itself: next/image cannot optimise those. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Download, FileText, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react'

import {
  ACCENTS, DEFAULT_STYLE, TEMPLATES, emptyEducation, emptyExperience, emptyProject, emptyResume, normalizeResume, normalizeStyle, resumeFileName, resumeTips, sampleResume,
  type EducationItem, type ExperienceItem, type ProjectItem, type ResumeData, type ResumeStyle, type TemplateId,
} from '@/lib/daily-tools/resume/model'
import { downloadBlob } from '../download'
import { Card, ErrorNote, Field, inputClass, Note, Segmented } from '../ui'

const STORE_KEY = 'tomato_resume_builder_v1'

function TemplateThumb({ id, accent }: { id: TemplateId; accent: string }) {
  const line = 'h-[3px] rounded-full bg-zinc-300 dark:bg-zinc-600'
  const body = (
    <div className="mt-1.5 space-y-[3px]"><div className={`${line} w-full`} /><div className={`${line} w-5/6`} /><div className={`${line} w-full`} /><div className="mt-1.5 h-[3px] w-1/3 rounded-full" style={{ background: accent }} /><div className={`${line} w-full`} /><div className={`${line} w-4/6`} /></div>
  )
  const frame = 'relative h-[84px] w-[62px] overflow-hidden rounded-md border border-zinc-300 bg-white p-1.5 shadow-sm dark:border-zinc-600'
  if (id === 'sidebar') return <div className={frame}><div className="absolute inset-y-0 left-0 w-[34%]" style={{ background: accent }} /><div className="ml-[38%]"><div className="h-[5px] w-4/5 rounded-full" style={{ background: accent }} />{body}</div></div>
  if (id === 'banner') return <div className={frame}><div className="absolute inset-x-0 top-0 h-[22px]" style={{ background: accent }} /><div className="mt-[22px]">{body}</div></div>
  if (id === 'classic' || id === 'executive') return <div className={frame}><div className="mx-auto h-[5px] w-3/5 rounded-full bg-zinc-800" /><div className="mx-auto mt-1 h-[3px] w-4/5 rounded-full bg-zinc-300" /><div className="mt-1 h-px w-full bg-zinc-700" />{body}</div>
  if (id === 'minimal') return <div className={frame}><div className="h-[5px] w-3/5 rounded-full bg-zinc-700" /><div className="mt-1 h-[3px] w-4/5 rounded-full bg-zinc-200" />{body}</div>
  return <div className={frame}><div className="h-[5px] w-3/5 rounded-full" style={{ background: accent }} /><div className="mt-1 h-[3px] w-4/5 rounded-full bg-zinc-300" /><div className="mt-1 h-px w-full" style={{ background: accent }} />{body}</div>
}

function Text({ id, label, value, onChange, placeholder, hint, type = 'text', disabled }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: ReactNode; type?: string; disabled?: boolean }) {
  return <Field label={label} hint={hint} htmlFor={id}><input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete="off" disabled={disabled} className={`${inputClass} disabled:opacity-60`} /></Field>
}
function Area({ id, label, value, onChange, placeholder, hint, rows = 4 }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: ReactNode; rows?: number }) {
  return <Field label={label} hint={hint} htmlFor={id}><textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputClass} resize-y`} /></Field>
}

function move<T>(list: T[], index: number, by: -1 | 1): T[] {
  const j = index + by
  if (j < 0 || j >= list.length) return list
  const copy = [...list]; [copy[index], copy[j]] = [copy[j], copy[index]]
  return copy
}

function ItemShell({ title, index, count, onMove, onRemove, children }: { title: string; index: number; count: number; onMove: (by: -1 | 1) => void; onRemove: () => void; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title || `Item ${index + 1}`}</p>
        <div className="flex gap-1">
          <button type="button" aria-label={`Move item ${index + 1} up`} disabled={index === 0} onClick={() => onMove(-1)} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowUp className="h-4 w-4" /></button>
          <button type="button" aria-label={`Move item ${index + 1} down`} disabled={index === count - 1} onClick={() => onMove(1)} className="rounded-full p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"><ArrowDown className="h-4 w-4" /></button>
          <button type="button" aria-label={`Remove item ${index + 1}`} onClick={onRemove} className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

interface Preview { urls: string[]; pages: number; replaced: boolean }

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(() => sampleResume())
  const [style, setStyle] = useState<ResumeStyle>(DEFAULT_STYLE)
  const [isSample, setIsSample] = useState(true)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const token = useRef(0)
  const urls = useRef<string[]>([])
  const loaded = useRef(false)

  // Restore the last session (this device only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) { const saved = JSON.parse(raw) as { data?: unknown; style?: unknown }; setData(normalizeResume(saved.data)); setStyle(normalizeStyle(saved.style)); setIsSample(false) }
    } catch { /* private mode or damaged: start fresh */ }
    loaded.current = true
    return () => urls.current.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  // Save after edits (never before the first restore finished, so a refresh cannot overwrite saved work with the sample).
  useEffect(() => {
    if (!loaded.current || isSample) return
    const t = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify({ data, style })) } catch { /* storage full or blocked */ } }, 500)
    return () => clearTimeout(t)
  }, [data, style, isSample])

  // Redraw the preview from the real PDF whenever something changes.
  useEffect(() => {
    const mine = ++token.current
    const t = setTimeout(async () => {
      try {
        setBusy(true)
        const { renderResumePdf } = await import('@/lib/daily-tools/resume/render')
        const res = await renderResumePdf(data, style)
        const { openPdf, renderPage, closePdf } = await import('@/lib/daily-tools/pdf/pipeline')
        const opened = await openPdf(new File([res.bytes as BlobPart], 'resume.pdf', { type: 'application/pdf' }))
        const made: string[] = []
        try {
          for (let i = 1; i <= opened.pageCount; i++) {
            const { blob } = await renderPage(opened, i, { scale: 1.5, type: 'image/png', quality: 0.92 })
            made.push(URL.createObjectURL(blob))
            if (token.current !== mine) break
          }
        } finally { await closePdf(opened) }
        if (token.current !== mine) { made.forEach((u) => URL.revokeObjectURL(u)); return }
        urls.current.forEach((u) => URL.revokeObjectURL(u)); urls.current = made
        setPreview({ urls: made, pages: res.pages, replaced: res.replaced }); setError(null)
      } catch { if (token.current === mine) setError('The preview could not be drawn. Your text is safe: try changing the design, or reload the page.') }
      finally { if (token.current === mine) setBusy(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [data, style])

  const edit = useCallback((fn: (d: ResumeData) => ResumeData) => { setIsSample(false); setData(fn) }, [])
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => edit((d) => ({ ...d, [key]: value }))
  const updateExp = (id: string, patch: Partial<ExperienceItem>) => edit((d) => ({ ...d, experience: d.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const updateEdu = (id: string, patch: Partial<EducationItem>) => edit((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const updateProj = (id: string, patch: Partial<ProjectItem>) => edit((d) => ({ ...d, projects: d.projects.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const pickTemplate = (id: TemplateId) => setStyle((s) => ({ ...s, template: id, font: TEMPLATES.find((t) => t.id === id)!.font }))

  async function download(kind: 'pdf' | 'docx') {
    if (exporting) return
    setExporting(kind); setError(null)
    try {
      if (kind === 'pdf') {
        const { renderResumePdf } = await import('@/lib/daily-tools/resume/render')
        const res = await renderResumePdf(data, style)
        downloadBlob(new Blob([res.bytes as BlobPart], { type: 'application/pdf' }), resumeFileName(data, 'pdf'), 'application/pdf')
      } else {
        const { buildResumeDocx } = await import('@/lib/daily-tools/resume/docx')
        const bytes = await buildResumeDocx(data, style)
        downloadBlob(new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), resumeFileName(data, 'docx'))
      }
    } catch { setError('Could not create the file. Please try again.') } finally { setExporting(null) }
  }

  const tips = resumeTips(data, preview?.pages ?? 1)
  const tpl = TEMPLATES.find((t) => t.id === style.template)!

  const editor = (
    <div className="space-y-6">
      {isSample && <Note>This is sample content so you can see each design. Replace it with your own details, or <button type="button" onClick={() => { setData(emptyResume()); setIsSample(false) }} className="font-semibold underline">start with a blank resume</button>.</Note>}

      <Card title="Design">
        <div className="space-y-5">
          <div role="radiogroup" aria-label="Design" className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
            {TEMPLATES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={style.template === t.id} onClick={() => pickTemplate(t.id)} className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 text-xs font-semibold transition-colors ${style.template === t.id ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'}`}>
                <TemplateThumb id={t.id} accent={style.accent} />{t.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-500">{tpl.blurb}</p>
          {tpl.atsNote && <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">{tpl.atsNote}</p>}
          <div>
            <p className="mb-2 text-sm font-medium">Colour</p>
            <div role="radiogroup" aria-label="Accent colour" className="grid w-fit grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:gap-2">
              {ACCENTS.map((a) => <button key={a.hex} type="button" role="radio" aria-checked={style.accent === a.hex} aria-label={a.name} title={a.name} onClick={() => setStyle((s) => ({ ...s, accent: a.hex }))} className={`h-8 w-8 rounded-full border-2 ${style.accent === a.hex ? 'border-zinc-900 ring-2 ring-offset-2 ring-orange-500 dark:border-white dark:ring-offset-zinc-900' : 'border-transparent'}`} style={{ background: a.hex }} />)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div><p className="mb-1.5 text-sm font-medium">Font</p><Segmented label="Font" value={style.font} onChange={(v) => setStyle((s) => ({ ...s, font: v }))} options={[{ value: 'sans', label: 'Clean' }, { value: 'serif', label: 'Classic' }]} /></div>
            <div><p className="mb-1.5 text-sm font-medium">Spacing</p><Segmented label="Spacing" value={style.size} onChange={(v) => setStyle((s) => ({ ...s, size: v }))} options={[{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'roomy', label: 'Roomy' }]} /></div>
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm"><input type="checkbox" checked={style.educationFirst} onChange={(e) => setStyle((s) => ({ ...s, educationFirst: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-orange-500" /><span>Show education before experience <span className="text-zinc-500">(good for freshers and recent graduates)</span></span></label>
        </div>
      </Card>

      <Card title="Your details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Text id="rb-name" label="Full name" value={data.name} onChange={(v) => set('name', v)} placeholder="e.g. Priya Sharma" />
          <Text id="rb-title" label="Job title or headline" value={data.title} onChange={(v) => set('title', v)} placeholder="e.g. Digital Marketing Manager" />
          <Text id="rb-email" label="Email" type="email" value={data.email} onChange={(v) => set('email', v)} placeholder="you@example.com" />
          <Text id="rb-phone" label="Phone" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+91 98765 43210" />
          <Text id="rb-location" label="City" value={data.location} onChange={(v) => set('location', v)} placeholder="Pune, Maharashtra" />
          <Text id="rb-linkedin" label="LinkedIn (optional)" value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/yourname" />
          <div className="sm:col-span-2"><Text id="rb-website" label="Website or portfolio (optional)" value={data.website} onChange={(v) => set('website', v)} placeholder="yoursite.com" /></div>
        </div>
      </Card>

      <Card title="Summary">
        <Area id="rb-summary" label="Two to four lines about you" value={data.summary} onChange={(v) => set('summary', v)} rows={4} placeholder="Who you are, what you are good at, and one result you are proud of." hint={`${data.summary.trim().length} characters. Short and specific beats long and general.`} />
      </Card>

      <Card title="Experience">
        <div className="space-y-4">
          {data.experience.map((e, i) => (
            <ItemShell key={e.id} title={[e.role, e.company].filter(Boolean).join(' at ')} index={i} count={data.experience.length} onMove={(by) => edit((d) => ({ ...d, experience: move(d.experience, i, by) }))} onRemove={() => edit((d) => ({ ...d, experience: d.experience.filter((x) => x.id !== e.id) }))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text id={`${e.id}-role`} label="Job title" value={e.role} onChange={(v) => updateExp(e.id, { role: v })} />
                <Text id={`${e.id}-company`} label="Company" value={e.company} onChange={(v) => updateExp(e.id, { company: v })} />
                <Text id={`${e.id}-loc`} label="City (optional)" value={e.location} onChange={(v) => updateExp(e.id, { location: v })} />
                <div />
                <Text id={`${e.id}-start`} label="Start" value={e.start} onChange={(v) => updateExp(e.id, { start: v })} placeholder="Jun 2021" />
                <div>
                  <Text id={`${e.id}-end`} label="End" value={e.current ? 'Present' : e.end} onChange={(v) => updateExp(e.id, { end: v })} placeholder="Mar 2024" disabled={e.current} />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={e.current} onChange={(ev) => updateExp(e.id, { current: ev.target.checked })} className="h-4 w-4 accent-orange-500" />I work here now</label>
                </div>
              </div>
              <Area id={`${e.id}-bullets`} label="What you did (one point per line)" value={e.bullets} onChange={(v) => updateExp(e.id, { bullets: v })} rows={5} placeholder={'Grew monthly sales by 24% in 6 months\nLed a team of 5 and cut delivery time by 2 days'} hint="Start with a strong verb and add a number: %, rupees, people, time." />
            </ItemShell>
          ))}
          <button type="button" onClick={() => edit((d) => ({ ...d, experience: [...d.experience, emptyExperience()] }))} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Plus className="h-4 w-4" />Add a job</button>
        </div>
      </Card>

      <Card title="Education">
        <div className="space-y-4">
          {data.education.map((e, i) => (
            <ItemShell key={e.id} title={e.degree || e.school} index={i} count={data.education.length} onMove={(by) => edit((d) => ({ ...d, education: move(d.education, i, by) }))} onRemove={() => edit((d) => ({ ...d, education: d.education.filter((x) => x.id !== e.id) }))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text id={`${e.id}-degree`} label="Degree or course" value={e.degree} onChange={(v) => updateEdu(e.id, { degree: v })} placeholder="B.Tech, Computer Science" />
                <Text id={`${e.id}-school`} label="College or school" value={e.school} onChange={(v) => updateEdu(e.id, { school: v })} />
                <Text id={`${e.id}-eloc`} label="City (optional)" value={e.location} onChange={(v) => updateEdu(e.id, { location: v })} />
                <Text id={`${e.id}-year`} label="Year" value={e.year} onChange={(v) => updateEdu(e.id, { year: v })} placeholder="2022" />
                <Text id={`${e.id}-grade`} label="Marks or CGPA (optional)" value={e.grade} onChange={(v) => updateEdu(e.id, { grade: v })} placeholder="CGPA 8.4" />
              </div>
            </ItemShell>
          ))}
          <button type="button" onClick={() => edit((d) => ({ ...d, education: [...d.education, emptyEducation()] }))} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Plus className="h-4 w-4" />Add education</button>
        </div>
      </Card>

      <Card title="Projects (optional)">
        <div className="space-y-4">
          {data.projects.map((p, i) => (
            <ItemShell key={p.id} title={p.name} index={i} count={data.projects.length} onMove={(by) => edit((d) => ({ ...d, projects: move(d.projects, i, by) }))} onRemove={() => edit((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== p.id) }))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Text id={`${p.id}-pname`} label="Project name" value={p.name} onChange={(v) => updateProj(p.id, { name: v })} />
                <Text id={`${p.id}-plink`} label="Link (optional)" value={p.link} onChange={(v) => updateProj(p.id, { link: v })} />
              </div>
              <Area id={`${p.id}-pbullets`} label="What it is and what it achieved (one point per line)" value={p.bullets} onChange={(v) => updateProj(p.id, { bullets: v })} rows={3} />
            </ItemShell>
          ))}
          <button type="button" onClick={() => edit((d) => ({ ...d, projects: [...d.projects, emptyProject()] }))} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Plus className="h-4 w-4" />Add a project</button>
        </div>
      </Card>

      <Card title="Skills, certifications and languages">
        <div className="space-y-4">
          <Area id="rb-skills" label="Skills" value={data.skills} onChange={(v) => set('skills', v)} rows={4} placeholder={'Marketing: SEO, Google Ads, Email\nTools: Excel, Canva, HubSpot'} hint={'One group per line. Write "Group: skill, skill" for a labelled group, or just list skills separated by commas.'} />
          <Area id="rb-certs" label="Certifications (one per line)" value={data.certifications} onChange={(v) => set('certifications', v)} rows={3} placeholder="Google Analytics Certification, 2023" />
          <Text id="rb-langs" label="Languages (separated by commas)" value={data.languages} onChange={(v) => set('languages', v)} placeholder="English, Hindi, Marathi" />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => { setData(sampleResume()); setIsSample(true) }} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><RotateCcw className="h-4 w-4" />Load the sample</button>
        <button type="button" onClick={() => { if (window.confirm('Clear everything and start a blank resume?')) { setData(emptyResume()); setIsSample(false) } }} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Trash2 className="h-4 w-4" />Start blank</button>
      </div>
    </div>
  )

  const previewPane = (
    <div className="space-y-4 lg:sticky lg:top-20">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void download('pdf')} disabled={exporting !== null} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 hover:opacity-90 disabled:opacity-60">{exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Download PDF</button>
        <button type="button" onClick={() => void download('docx')} disabled={exporting !== null} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800">{exporting === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}Download Word</button>
        <span className="text-xs text-zinc-500" data-testid="rb-status" aria-live="polite">{busy ? 'Updating preview…' : preview ? `${preview.pages} page${preview.pages === 1 ? '' : 's'} · A4` : ''}</span>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {preview?.replaced && <Note>Some characters (for example Hindi or Tamil letters) cannot be drawn in the PDF design and show as “?”. Use <strong>Download Word</strong> to keep every letter, or write those parts in English letters.</Note>}
      <div className="space-y-4" data-testid="rb-preview">
        {preview ? preview.urls.map((u, i) => <img key={u} src={u} alt={`Resume page ${i + 1} preview`} className="w-full rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700" />) : <div className="aspect-[1/1.414] w-full animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />}
      </div>
      {tips.length > 0 && (
        <Card title="Suggestions">
          <ul className="space-y-2 text-sm" data-testid="rb-tips">{tips.map((t) => <li key={t} className="flex gap-2"><span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />{t}</li>)}</ul>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="lg:hidden"><Segmented label="View" value={tab} onChange={setTab} options={[{ value: 'edit', label: 'Edit' }, { value: 'preview', label: 'Preview and download' }]} /></div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className={tab === 'edit' ? '' : 'hidden lg:block'}>{editor}</div>
        <div className={tab === 'preview' ? '' : 'hidden lg:block'}>{previewPane}</div>
      </div>
      <Note>Your resume is made inside your browser and is never uploaded. It is saved only on this device, so use the same browser to come back to it. The PDF is real, selectable text (not a picture) and the email and web links are clickable. The PDF designs use standard fonts, so only English and other Western letters are drawn; the Word file keeps every script. Always read the final file once before you send it.</Note>
    </div>
  )
}
