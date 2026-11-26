"use client"

import { useState } from "react"
import { Check, Copy, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"

import type { useReadAloud } from "./use-read-aloud"

type Speech = ReturnType<typeof useReadAloud>

/** Under each answer: copy it, or have it read aloud. */
export function MessageActions({ id, text, speech }: { id: string; text: string; speech: Speech }) {
  const [copied, setCopied] = useState(false)
  const speaking = speech.speakingId === id

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { toast.error("Could not copy. Select the text and copy it by hand.") }
  }

  const button = "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
  return (
    <div className="mt-1 flex items-center gap-1 md:-ml-1" data-testid="message-actions">
      <button type="button" onClick={() => void copy()} aria-label="Copy answer" className={button}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
      </button>
      {speech.supported && (
        <button type="button" onClick={() => speech.toggle(id, text)} aria-label={speaking ? "Stop reading aloud" : "Read answer aloud"} aria-pressed={speaking} className={button}>
          {speaking ? <VolumeX className="h-3.5 w-3.5 text-[var(--accent-line)]" /> : <Volume2 className="h-3.5 w-3.5" />}{speaking ? "Stop" : "Listen"}
        </button>
      )}
    </div>
  )
}
