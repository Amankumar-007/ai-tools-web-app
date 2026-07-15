"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Globe, Paperclip, Plus, Send, Lightbulb, Square } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

// Helper function to get readable model name
const getModelName = (modelId: string): string => {
  const modelNames: Record<string, string> = {
    "tencent/hy3:free": "Tencent Hunyuan 3",
    "nvidia/nemotron-3-ultra-550b-a55b:free": "Nemotron 3 Ultra 550B",
    "poolside/laguna-m.1:free": "Laguna M.1",
    "nvidia/nemotron-3-super-120b-a12b:free": "Nemotron 3 Super 120B",
    "cohere/north-mini-code:free": "Cohere North Mini Code",
    "poolside/laguna-xs-2.1:free": "Laguna XS 2.1",
    "nvidia/nemotron-3-nano-30b-a3b:free": "Nemotron 3 Nano 30B",
    "openai/gpt-oss-120b:free": "GPT OSS 120B",
    "google/gemma-4-31b-it:free": "Gemma 4 31B IT",
    "openai/gpt-oss-20b:free": "GPT OSS 20B",
    "qwen/qwen3-coder:free": "Qwen 3 Coder",
    "meta-llama/llama-3.2-3b-instruct:free": "Llama 3.2 3B Instruct",
    "nousresearch/hermes-3-llama-3.1-405b:free": "Hermes 3 Llama 3.1 405B",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": "Dolphin Mistral 24B Venice",
    "meta-llama/llama-3.3-70b-instruct:free": "Llama 3.3 70B Instruct",
    "liquid/lfm-2.5-1.2b-thinking:free": "LFM 2.5 1.2B Thinking",
    "liquid/lfm-2.5-1.2b-instruct:free": "LFM 2.5 1.2B Instruct",
  }
  return modelNames[modelId] || modelId.split("/")[1]?.replace(":free", "") || modelId.replace(":free", "")
}

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
      transition={{ duration: 0.1 }}
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
  onModelSelect?: () => void
  onStop?: () => void
  placeholder?: string
  submitting?: boolean
  disabled?: boolean
  selectedModel?: string
  value?: string
  onChange?: (value: string) => void
  textareaRef?: any
}

export default function AiInput({
  onSubmit,
  onSubmitWithMode,
  onFileSelect,
  onModelSelect,
  onStop,
  placeholder,
  submitting,
  disabled,
  selectedModel,
  value: controlledValue,
  onChange: controlledOnChange,
  textareaRef: externalTextareaRef
}: AiInputProps) {
  const [internalValue, setInternalValue] = useState("")
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const { textareaRef: internalTextareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
  })

  const textareaRef = externalTextareaRef || internalTextareaRef

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

  const handleSubmit = () => {
    if (!value.trim() || submitting || disabled) return;

    const queryValue = value.trim();
    const q = encodeURIComponent(queryValue);

    // Save to localStorage so it can be restored if user is redirected to login
    localStorage.setItem('pending_prompt', queryValue);

    if (onSubmitWithMode) {
      onSubmitWithMode(queryValue, showSearch)
    } else if (onSubmit) {
      onSubmit(queryValue)
    } else {
      // Default behavior: route based on toggle
      if (showSearch) {
        router.push(`/search?q=${q}`)
      } else {
        router.push(`/tomato-ai/chat?q=${q}`)
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
  return (
    <div className="w-full py-4">
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
                  if (e.key === "Enter" && !e.shiftKey) {
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
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
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
                      transition={{ duration: 0.2 }}
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
