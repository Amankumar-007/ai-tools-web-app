"use client"

import { FileText, ImageIcon, Loader2, X } from "lucide-react"

import type { PendingAttachment } from "./use-attachments"

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Files waiting to be sent with the next message. */
export function AttachmentChips({
  items,
  onRemove,
}: {
  items: PendingAttachment[]
  onRemove: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <ul className="mb-2 flex flex-wrap gap-2" aria-label="Attached files">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex max-w-[240px] items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 pl-1.5 pr-1 text-sm dark:border-white/10 dark:bg-white/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
            {item.status === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Reading file" />
            ) : item.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            ) : item.kind === "image" ? (
              <ImageIcon className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">{item.name}</span>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {item.status === "processing" ? "Reading…" : item.scanned ? "Scanned PDF · read as images" : formatSize(item.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
