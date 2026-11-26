"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { motionFade, motionSpring } from "@/lib/motion";
import { Globe, Paperclip, Plus, Send, Lightbulb, Square } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import LightningToggle from "@/components/ui/lightning-toggle"
import { AttachMenu } from "@/components/chat/attach-menu"
import { AttachmentChips } from "@/components/chat/attachment-chips"
import type { PendingAttachment } from "@/components/chat/use-attachments"
import { getModelLabel } from "@/lib/ai-context/model-labels"

// Readable model name (shared with the rest of the chat UI)
const getModelName = getModelLabel

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

const MIN_HEIGHT = 65
const MAX_HEIGHT = 164

const AnimatedPlaceholder = ({ showSearch }: { showSearch: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.p
      key={showSearch ? "search" : "ask"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={motionFade}
      className="pointer-events-none w-[150px] text-sm absolute text-black/70 dark:text-white/70"
    >
      {showSearch ? "Search the web..." : "Ask Tomato Ai..."}
    </motion.p>
  </AnimatePresence>
)

type AiInputProps = {
  onSubmit?: (text: string) => void
  onSubmitWithMode?: (text: string, isSearch: boolean) => void
  onFileSelect?: (file: File | null) => void
  /**
   * Multi-file attachments owned by the parent (minimal variant). When set, the
   * "+" button opens the attach menu and files are paste/drop targets too.
   */
  attachments?: PendingAttachment[]
  onFilesSelected?: (files: File[]) => void
  onRemoveAttachment?: (id: string) => void
  /** Attachments are still being read: typing is fine, sending waits. */
  busy?: boolean
  onModelSelect?: () => void
  onStop?: () => void
  onLightningSelect?: () => void
  lightningActive?: boolean
  placeholder?: string
  submitting?: boolean
  disabled?: boolean
  selectedModel?: string
  value?: string
  onChange?: (value: string) => void
  textareaRef?: any
  variant?: "default" | "minimal"
}

export default function AiInput({
  onSubmit,
  onSubmitWithMode,
  onFileSelect,
  attachments,
  onFilesSelected,
  onRemoveAttachment,
  busy,
  onModelSelect,
  onStop,
  onLightningSelect,
  lightningActive,
  placeholder,
  submitting,
  disabled,
  selectedModel,
  value: controlledValue,
  onChange: controlledOnChange,
  textareaRef: externalTextareaRef,
  variant = "default"
}: AiInputProps) {
  const [internalValue, setInternalValue] = useState("")
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const textareaMinHeight = variant === "minimal" ? 42 : MIN_HEIGHT
  const { textareaRef: internalTextareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: textareaMinHeight,
    maxHeight: MAX_HEIGHT,
  })

  const textareaRef = externalTextareaRef || internalTextareaRef

  useEffect(() => {
    const textarea = textareaRef.current as HTMLTextAreaElement | null
    if (!textarea) return
    textarea.style.height = `${textareaMinHeight}px`
    textarea.style.height = `${Math.max(textareaMinHeight, Math.min(textarea.scrollHeight, MAX_HEIGHT))}px`
  }, [value, textareaRef, textareaMinHeight])

  const [showSearch, setShowSearch] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handelClose = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
    setImagePreview(null)
    setFileName(null)
    if (onFileSelect) onFileSelect(null)
  }

  const handelChange = (e: any) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      if (file.type.startsWith('image/')) {
        setImagePreview(URL.createObjectURL(file))
        setFileName(null)
      } else {
        setImagePreview(null)
        setFileName(file.name)
      }
      if (onFileSelect) onFileSelect(file)
    }
  }

  const attachmentCount = attachments?.length ?? 0
  const canSend = Boolean(value.trim()) || attachmentCount > 0
  const [dragging, setDragging] = useState(false)

  const handleSubmit = () => {
    if (!canSend || submitting || disabled || busy) return;

    const queryValue = value.trim();
    const q = encodeURIComponent(queryValue);

    if (onSubmitWithMode) {
      onSubmitWithMode(queryValue, showSearch)
    } else if (onSubmit) {
      onSubmit(queryValue)
    } else {
      // Default behavior: route based on toggle
      localStorage.setItem('pending_prompt', queryValue)
      if (showSearch) {
        router.push(`/search?q=${q}`)
      } else {
        router.push(`/tomato-ai?q=${q}`)
      }
    }
    // Clear the input and reset height
    if (controlledOnChange) {
      controlledOnChange("")
    } else {
      setInternalValue("")
    }
    adjustHeight(true)

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setImagePreview(null)
    setFileName(null)
    if (onFileSelect) onFileSelect(null)
  }


  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (variant === "minimal") {
    const acceptsFiles = (event: React.DragEvent) => Boolean(onFilesSelected) && Array.from(event.dataTransfer.types).includes("Files")
    return (
      <div
        onDragOver={(event) => { if (acceptsFiles(event)) { event.preventDefault(); setDragging(true) } }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }}
        onDrop={(event) => {
          if (!acceptsFiles(event)) return
          event.preventDefault()
          setDragging(false)
          onFilesSelected?.(Array.from(event.dataTransfer.files))
        }}
        className={cn(
          "w-full rounded-[28px] border border-zinc-300/80 bg-white/95 p-2 shadow-[0_12px_35px_rgba(17,17,17,0.12)] backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 focus-within:border-[var(--accent-line)] focus-within:shadow-[0_14px_42px_color-mix(in_srgb,var(--accent)_18%,transparent)] dark:border-white/20 dark:bg-[#1b1b1d]/95 dark:shadow-[0_14px_44px_rgba(0,0,0,0.28)]",
          dragging && "border-[var(--accent-line)] ring-2 ring-[var(--accent-line)]"
        )}
      >
        {attachments && attachments.length > 0 && onRemoveAttachment && (
          <div className="px-2 pt-1">
            <AttachmentChips items={attachments} onRemove={onRemoveAttachment} />
          </div>
        )}
        {!onFilesSelected && (imagePreview || fileName) && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
            {imagePreview ? <Image src={imagePreview} alt="Attachment preview" width={32} height={32} className="h-8 w-8 rounded-md object-cover" /> : <Paperclip className="h-4 w-4 shrink-0" />}
            <span className="min-w-0 flex-1 truncate">{fileName || "Image attached"}</span>
            <button type="button" onClick={handelClose} aria-label="Remove attachment" className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"><Plus className="h-4 w-4 rotate-45" /></button>
          </div>
        )}
        <div className="px-3 pt-1">
          <textarea
            value={value}
            ref={textareaRef}
            rows={1}
            placeholder={placeholder || (showSearch ? "Search the web..." : "Ask TomatoAI anything...")}
            aria-label={showSearch ? "Search the web" : "Message TomatoAI"}
            onChange={(event) => { controlledOnChange ? controlledOnChange(event.target.value) : setInternalValue(event.target.value); adjustHeight() }}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); handleSubmit() } }}
            onPaste={(event) => {
              // Pasting a screenshot or copied file attaches it instead of inserting text.
              const files = Array.from(event.clipboardData.files)
              if (onFilesSelected && files.length > 0) {
                event.preventDefault()
                onFilesSelected(files)
              }
            }}
            disabled={submitting || disabled}
            className="block max-h-40 min-h-[42px] w-full resize-none bg-transparent px-2 py-2 text-base leading-6 text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-1">
          {onFilesSelected ? (
            <AttachMenu onFiles={onFilesSelected} disabled={disabled} />
          ) : (
            <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10" title="Attach file">
              <input type="file" accept="image/*,.pdf,.txt,.md,.csv,.json" ref={fileInputRef} onChange={handelChange} className="sr-only" aria-label="Attach file" />
              <Plus className="h-5 w-5" />
            </label>
          )}
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setShowSearch(!showSearch)} aria-label={showSearch ? "Turn off web search" : "Search the web"} aria-pressed={showSearch} title="Search the web" className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-white/10", showSearch ? "text-[var(--accent-line)]" : "text-zinc-500 dark:text-zinc-300")}><Globe className="h-[19px] w-[19px]" /></button>
            {onLightningSelect && <button type="button" onClick={onLightningSelect} aria-label="Toggle lightning mode" aria-pressed={Boolean(lightningActive)} title="Lightning mode" className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-white/10", lightningActive ? "text-amber-500" : "text-zinc-500 dark:text-zinc-300")}><Lightbulb className="h-[19px] w-[19px]" /></button>}
            {onModelSelect && <button type="button" onClick={onModelSelect} aria-label="Choose AI model" title={selectedModel ? getModelName(selectedModel) : "Choose AI model"} className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"><span className="text-xs font-semibold tracking-wide">AI</span></button>}
            <button type="button" onClick={submitting ? onStop : handleSubmit} disabled={!submitting && (!canSend || disabled || busy)} aria-label={submitting ? "Stop generating" : busy ? "Reading your files…" : "Send message"} title={busy && !submitting ? "Reading your files…" : undefined} className={cn("ml-1 flex h-10 w-10 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 active:scale-95", submitting || (canSend && !busy) ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]" : "bg-zinc-100 text-zinc-400 dark:bg-[#303034] dark:text-zinc-400")}>
              {submitting ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-2">
      <div className="relative bg-white dark:bg-neutral-900 max-w-3xl border border-black/10 dark:border-white/10 rounded-[22px] p-1 w-full mx-auto shadow-[0_18px_35px_rgba(0,0,0,0.07),_0_3px_10px_rgba(0,0,0,0.035)] dark:shadow-[0_18px_35px_rgba(0,0,0,0.35),_0_3px_10px_rgba(0,0,0,0.15)]">
        <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          >
            <div className="relative">
              <Textarea
                id="ai-input-04"
                value={value}
                placeholder={placeholder || ""}
                className=" w-full rounded-2xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white resize-none focus-visible:ring-0 leading-[1.2]"
                ref={textareaRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                onChange={(e) => {
                  if (controlledOnChange) {
                    controlledOnChange(e.target.value)
                  } else {
                    setInternalValue(e.target.value)
                  }
                  adjustHeight()
                }}
                disabled={submitting || disabled}
              />
              {!value && (
                <div className="absolute left-4 top-3">
                  <AnimatedPlaceholder showSearch={showSearch} />
                </div>
              )}
            </div>
          </div>

          <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              {onLightningSelect && (
                <LightningToggle active={Boolean(lightningActive)} onToggle={onLightningSelect} />
              )}
              {onModelSelect && (
                <button
                  type="button"
                  onClick={onModelSelect}
                  className="rounded-full p-2 bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors relative group"
                  title="Select AI Model"
                >
                  <Lightbulb className="w-4 h-4" />
                  {selectedModel && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {getModelName(selectedModel)}
                    </div>
                  )}
                </button>
              )}
              <label
                className={cn(
                  "cursor-pointer relative rounded-full p-2 bg-black/5 dark:bg-white/5",
                  imagePreview
                    ? "bg-[#ff3f17]/15 border border-[#ff3f17] text-[#ff3f17]"
                    : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                <input
                  type="file"
                  accept="image/*,.pdf,.txt,.md,.csv,.json"
                  ref={fileInputRef}
                  onChange={handelChange}
                  className="hidden"
                />
                <Paperclip
                  className={cn(
                    "w-4 h-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors",
                    imagePreview && "text-[#ff3f17]"
                  )}
                />
                {(imagePreview || fileName) && (
                  <div className="absolute w-[100px] h-[100px] top-14 -left-4 bg-white dark:bg-black rounded-2xl shadow-lg">
                    {imagePreview ? (
                      <Image
                        className="object-cover rounded-2xl w-full h-full"
                        src={imagePreview}
                        height={100}
                        width={100}
                        alt="preview"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Paperclip className="w-6 h-6 mb-1 text-gray-500" />
                        <span className="text-[10px] leading-tight line-clamp-2 text-gray-600 dark:text-gray-300 break-all">
                          {fileName}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handelClose}
                      className="bg-[#e8e8e8] text-[#464646] hover:bg-red-500 hover:text-white transition-colors absolute -top-2 -right-2 shadow-md rounded-full w-6 h-6 flex items-center justify-center z-10"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                )}
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch)
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
                  showSearch
                    ? "bg-[#ff3f17]/15 border-[#ff3f17] text-[#ff3f17]"
                    : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 8,
                      scale: 1.04,
                      transition: motionSpring,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-4 h-4",
                        showSearch ? "text-[#ff3f17]" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={motionFade}
                      className="text-sm overflow-hidden whitespace-nowrap text-[#ff3f17] flex-shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              {submitting && onStop ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="rounded-full p-2 transition-colors bg-[#ff3f17]/15 text-[#ff3f17] hover:bg-[#ff3f17]/25"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    value
                      ? "bg-[#ff3f17]/15 text-[#ff3f17]"
                      : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                  )}
                  disabled={submitting || disabled}
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
