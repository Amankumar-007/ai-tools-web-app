"use client"

import { useRef, type ReactNode } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { FileCode2, FileText, FileType2, ImageIcon, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { ACCEPT } from "@/lib/ai-context/file-processing"

type Kind = keyof typeof ACCEPT

const OPTIONS: Array<{ kind: Kind; label: string; hint: string; icon: ReactNode }> = [
  { kind: "image", label: "Photos & images", hint: "Analyse photos, screenshots, charts", icon: <ImageIcon className="h-4 w-4" /> },
  { kind: "pdf", label: "PDF", hint: "Read, summarise and ask about a PDF", icon: <FileText className="h-4 w-4" /> },
  { kind: "document", label: "Document", hint: "Word (.docx), text, Markdown", icon: <FileType2 className="h-4 w-4" /> },
  { kind: "data", label: "Data & code", hint: "CSV, JSON, HTML, source files", icon: <FileCode2 className="h-4 w-4" /> },
]

/**
 * The "+" button: opens a menu of what can be attached, then the matching file
 * picker. Files go to `onFiles`; nothing is read or sent here.
 */
export function AttachMenu({
  onFiles,
  disabled,
  className,
  iconClassName = "h-5 w-5",
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
  className?: string
  iconClassName?: string
}) {
  const inputs = useRef<Partial<Record<Kind, HTMLInputElement | null>>>({})

  return (
    <>
      {OPTIONS.map(({ kind }) => (
        <input
          key={kind}
          ref={(node) => { inputs.current[kind] = node }}
          type="file"
          multiple
          accept={ACCEPT[kind]}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = "" // allow picking the same file again
            if (files.length) onFiles(files)
          }}
        />
      ))}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Attach files"
            title="Attach files"
            className={cn(
              "group flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 dark:data-[state=open]:bg-white/10",
              className
            )}
          >
            <Plus className={cn("transition-transform duration-200 group-data-[state=open]:rotate-45", iconClassName)} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="start"
            sideOffset={10}
            collisionPadding={12}
            className="z-[10000] w-[min(290px,calc(100vw-24px))] rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] outline-none dark:border-white/10 dark:bg-[#1b1b1d]"
          >
            <DropdownMenu.Label className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[.14em] text-zinc-500 dark:text-zinc-400">
              Add to chat
            </DropdownMenu.Label>
            {OPTIONS.map(({ kind, label, hint, icon }) => (
              <DropdownMenu.Item
                key={kind}
                onSelect={() => inputs.current[kind]?.click()}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-800 outline-none transition-colors data-[highlighted]:bg-zinc-100 dark:text-zinc-100 dark:data-[highlighted]:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  {icon}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
                </span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </>
  )
}
