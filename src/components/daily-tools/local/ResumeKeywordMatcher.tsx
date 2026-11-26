'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ClipboardPaste, X } from 'lucide-react'

import { matchKeywords } from '@/lib/daily-tools/resume/keywords'
import { lines, normalizeResume, period, skillGroups, languageList } from '@/lib/daily-tools/resume/model'
import { Card, CopyButton, Field, inputClass, Note } from '../ui'

const STORE_KEY = 'tomato_resume_builder_v1'

/** Turns the Resume Builder's saved resume into plain text for matching. */
function builderText(): string | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const d = normalizeResume((JSON.parse(raw) as { data?: unknown }).data)
    const parts = [d.name, d.title, d.summary, ...d.experience.flatMap((e) => [e.role, e.company, period(e), ...lines(e.bullets)]), ...d.education.flatMap((e) => [e.degree, e.school, e.grade]), ...d.projects.flatMap((p) => [p.name, ...lines(p.bullets)]), ...skillGroups(d.skills).flatMap((g) => [g.label ?? '', ...g.items]), ...lines(d.certifications), ...languageList(d.languages)]
    const text = parts.filter(Boolean).join('\n')
    return text.trim() ? text : null
  } catch { return null }
}

function Gauge({ percent }: { percent: number }) {
  const tone = percent >= 70 ? '#16a34a' : percent >= 40 ? '#d97706' : '#dc2626'
  const r = 52, c = 2 * Math.PI * r
  return (
    <div className="relative h-32 w-32 shrink-0" role="img" aria-label={`${percent} percent of the job's keywords found`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90"><circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-zinc-200 dark:stroke-zinc-800" /><circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke={tone} strokeDasharray={`${(percent / 100) * c} ${c}`} /></svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold tabular-nums" data-testid="km-percent">{percent}%</span><span className="text-[11px] text-zinc-500">keywords found</span></div>
    </div>
  )
}

export default function ResumeKeywordMatcher() {
  const [job, setJob] = useState('')
  const [resume, setResume] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const result = useMemo(() => (job.trim().length >= 40 && resume.trim().length >= 40 ? matchKeywords(resume, job) : null), [job, resume])

  function useBuilder() {
    const text = builderText()
    if (text) { setResume(text); setNote(null) } else setNote('No saved resume found. Make one in the Resume Builder first (it is saved in this browser), or paste your resume text here.')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="1. The job description">
          <Field label="Paste the job post" htmlFor="km-job" hint="Copy the whole description: responsibilities and requirements.">
            <textarea id="km-job" rows={12} value={job} onChange={(e) => setJob(e.target.value.slice(0, 20000))} placeholder="Paste the job description here…" className={`${inputClass} resize-y`} />
          </Field>
        </Card>
        <Card title="2. Your resume">
          <Field label="Paste your resume text" htmlFor="km-resume" hint="Plain text works best. Copy it from your document or PDF.">
            <textarea id="km-resume" rows={12} value={resume} onChange={(e) => setResume(e.target.value.slice(0, 30000))} placeholder="Paste your resume text here…" className={`${inputClass} resize-y`} />
          </Field>
          <button type="button" onClick={useBuilder} className="mt-3 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ClipboardPaste className="h-4 w-4" />Use my Resume Builder resume</button>
          {note && <p className="mt-2 text-xs text-amber-600">{note}</p>}
        </Card>
      </div>

      {!result ? (
        <Card><p className="text-sm text-zinc-500" data-testid="km-empty">Paste both texts (at least a few sentences each) to see which of the job&apos;s keywords your resume already has and which are missing.</p></Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Gauge percent={result.percent} />
            <div>
              <p className="text-lg font-semibold">{result.found.length} of {result.keywords.length} important words found</p>
              <p className="mt-1 text-sm text-zinc-500">Words are weighted by how often the job post repeats them. {result.percent >= 70 ? 'A strong match. Check the missing words below and add any that are true for you.' : result.percent >= 40 ? 'A fair match. Adding the missing words you genuinely have would help.' : 'A weak match for this job. Either this job is a stretch, or your resume uses different words for the same skills.'}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400"><X className="h-4 w-4" />Missing from your resume ({result.missing.length})</p>
              <ul className="flex flex-wrap gap-2" data-testid="km-missing">{result.missing.length ? result.missing.map((k) => <li key={k.term} className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-800 dark:text-amber-200">{k.term}{k.count > 1 ? <span className="ml-1 text-xs opacity-70">×{k.count}</span> : null}</li>) : <li className="text-sm text-zinc-500">Nothing missing.</li>}</ul>
              {result.missing.length > 0 && <div className="mt-3"><CopyButton text={result.missing.map((k) => k.term).join(', ')} label="Copy missing words" /></div>}
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><Check className="h-4 w-4" />Already in your resume ({result.found.length})</p>
              <ul className="flex flex-wrap gap-2" data-testid="km-found">{result.found.length ? result.found.map((k) => <li key={k.term} className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-800 dark:text-emerald-200">{k.term}</li>) : <li className="text-sm text-zinc-500">None yet.</li>}</ul>
            </div>
          </div>
        </Card>
      )}

      <Note>This is a simple word check, the same first step many recruiters and job portals use. It is <strong>not</strong> a score from any real hiring system. Add a missing word only if it is true: use the job&apos;s own wording for skills you really have, and never list tools you cannot use. Everything runs in your browser and nothing is uploaded. For a fuller review of your resume, try the <Link href="/resume-analyzer" className="font-semibold underline">Resume Analyzer</Link>.</Note>
    </div>
  )
}
