"use client"

import { useEffect, useState } from "react"
import { Download, ImageIcon } from "lucide-react"

import { getItem } from "@/lib/ai-context/store"

/**
 * An image from the user's context store, shown inside a chat message. Falls
 * back to a name chip when the image is gone (e.g. browser data was cleared).
 */
export function StoredImage({
  uid,
  id,
  name,
  version = 0,
  variant = "bubble",
}: {
  uid: string
  id: string
  name: string
  /** Bump to re-read the store (e.g. after anonymous items move to a signed-in user). */
  version?: number
  /** "bubble": inside the user's coloured message. "plain": a picture the assistant made, with a download button. */
  variant?: "bubble" | "plain"
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setMissing(false)
    getItem(uid, id)
      .then((item) => {
        if (cancelled) return
        if (item?.kind === "image") {
          objectUrl = URL.createObjectURL(item.blob)
          setUrl(objectUrl)
        } else {
          setUrl(null)
          setMissing(true)
        }
      })
      .catch(() => { if (!cancelled) setMissing(true) })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [uid, id, version])

  const plain = variant === "plain"
  if (missing) {
    return (
      <span className={plain ? "mb-3 flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300" : "mb-3 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs"}>
        <ImageIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{name} (no longer on this device)</span>
      </span>
    )
  }
  if (!url) return <span className={plain ? "mb-3 block h-64 w-64 max-w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10" : "mb-3 block h-24 w-40 animate-pulse rounded-lg bg-white/15"} aria-hidden="true" />
  if (plain) {
    const extension = /svg/.test(url) ? "svg" : "png"
    return (
      <span className="mb-3 inline-block max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="block max-h-[28rem] max-w-full rounded-xl border border-zinc-200 object-contain dark:border-white/10" />
        <a href={url} download={`${name.replace(/[^\w.-]+/g, "-").slice(0, 60) || "image"}.${extension}`} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10">
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </span>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="mb-3 max-h-72 max-w-full rounded-lg object-contain" />
}
