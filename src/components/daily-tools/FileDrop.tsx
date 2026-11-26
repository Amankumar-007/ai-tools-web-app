'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export interface FileDropProps {
  /** Comma separated MIME types / extensions, e.g. "application/pdf,.pdf". */
  accept: string
  multiple?: boolean
  maxBytes: number
  maxFiles?: number
  label: string
  hint?: string
  onFiles: (files: File[]) => void
  onReject?: (message: string) => void
}

const mb = (n: number) => `${Math.round(n / 1024 / 1024)} MB`

/** Does the file match the accept list? (MIME exact, "image/*" wildcard, or ".ext".) The browser's picker filter alone is not enough: drag and drop bypasses it. */
export function matchesAccept(file: { name: string; type: string }, accept: string): boolean {
  const rules = accept.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean)
  const name = file.name.toLowerCase(); const type = (file.type || '').toLowerCase()
  return rules.some((r) => (r.startsWith('.') ? name.endsWith(r) : r.endsWith('/*') ? type.startsWith(r.slice(0, -1)) : type === r))
}

/** Click-or-drop file box. Everything is validated here (type, size, count) before the tool ever sees a file. */
export default function FileDrop({ accept, multiple = false, maxBytes, maxFiles = 30, label, hint, onFiles, onReject }: FileDropProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const take = useCallback((list: FileList | File[]) => {
    const all = Array.from(list)
    if (all.length === 0) return
    const wrongType = all.filter((f) => !matchesAccept(f, accept))
    const tooBig = all.filter((f) => f.size > maxBytes)
    const empty = all.filter((f) => f.size === 0)
    const good = all.filter((f) => matchesAccept(f, accept) && f.size <= maxBytes && f.size > 0)
    const problems: string[] = []
    if (wrongType.length) problems.push(`${wrongType.length === 1 ? `"${wrongType[0].name}" is` : `${wrongType.length} files are`} not a supported type.`)
    if (tooBig.length) problems.push(`${tooBig.length === 1 ? `"${tooBig[0].name}" is` : `${tooBig.length} files are`} larger than ${mb(maxBytes)}.`)
    if (empty.length) problems.push(`${empty.length === 1 ? `"${empty[0].name}" is` : `${empty.length} files are`} empty.`)
    let accepted = multiple ? good : good.slice(0, 1)
    if (accepted.length > maxFiles) { problems.push(`Only the first ${maxFiles} files were added.`); accepted = accepted.slice(0, maxFiles) }
    if (problems.length) onReject?.(problems.join(' '))
    if (accepted.length) onFiles(accepted)
    if (input.current) input.current.value = ''
  }, [accept, maxBytes, maxFiles, multiple, onFiles, onReject])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }}
      className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${over ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-300 bg-white hover:border-orange-500/60 dark:border-zinc-700 dark:bg-zinc-900/50'}`}
    >
      <input ref={input} id={id} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => e.target.files && take(e.target.files)} data-testid="file-input" />
      <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-2 focus-within:outline-none">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400"><UploadCloud className="h-6 w-6" aria-hidden /></span>
        <span className="text-base font-medium">{label}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">or drag and drop here{hint ? ` · ${hint}` : ''}</span>
        <span className="mt-1 text-xs text-zinc-500">Up to {mb(maxBytes)}{multiple ? ` each, ${maxFiles} files` : ''}. Your files never leave this device.</span>
      </label>
    </div>
  )
}
