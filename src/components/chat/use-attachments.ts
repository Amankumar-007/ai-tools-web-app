"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { MAX_FILES_PER_MESSAGE, processFile, type ProcessedFile } from "@/lib/ai-context/file-processing"
import { LIMITS } from "@/lib/ai-context/types"

export type PendingAttachment = {
  id: string
  name: string
  size: number
  kind: "image" | "document"
  status: "processing" | "ready"
  /** Scanned PDF: its pages will be read as images. */
  scanned?: boolean
  previewUrl?: string
  processed?: ProcessedFile
}

/** Image bytes (before base64) one message may carry; keeps the request under host body limits. */
const IMAGE_BYTES_PER_MESSAGE = Math.floor(LIMITS.pixelBudgetBytes * 0.72)

function imageStats(processed: ProcessedFile): { count: number; bytes: number } {
  if (processed.kind === "image") return { count: 1, bytes: processed.image.blob.size }
  return {
    count: processed.pageImages.length,
    bytes: processed.pageImages.reduce((sum, page) => sum + page.blob.size, 0),
  }
}

let counter = 0
const nextId = () => `pending_${Date.now().toString(36)}_${counter++}`

/**
 * Files the user has chosen for the next message. Each file is read in the
 * background (PDF text, DOCX text, image downscaling…); nothing is stored or sent
 * until the message is submitted.
 */
export function useAttachments() {
  const [items, setItems] = useState<PendingAttachment[]>([])
  const itemsRef = useRef<PendingAttachment[]>([])
  const alive = useRef(new Set<string>())

  const commit = useCallback((next: PendingAttachment[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  const revoke = (item: PendingAttachment) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  }

  const addFiles = useCallback(async (incoming: File[]) => {
    const files = incoming.filter((file) => file && file.name !== undefined)
    if (files.length === 0) return

    const room = MAX_FILES_PER_MESSAGE - itemsRef.current.length
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_FILES_PER_MESSAGE} files per message.`)
      return
    }
    if (files.length > room) toast.error(`Only ${MAX_FILES_PER_MESSAGE} files fit in one message; adding the first ${room}.`)

    const added: Array<{ file: File; id: string }> = []
    for (const file of files.slice(0, room)) {
      const duplicate = itemsRef.current.some((item) => item.name === file.name && item.size === file.size)
      if (duplicate || added.some((entry) => entry.file.name === file.name && entry.file.size === file.size)) {
        toast.info(`${file.name} is already attached.`)
        continue
      }
      added.push({ file, id: nextId() })
    }
    if (added.length === 0) return

    commit([
      ...itemsRef.current,
      ...added.map(({ file, id }): PendingAttachment => {
        alive.current.add(id)
        return { id, name: file.name, size: file.size, kind: file.type.startsWith("image/") ? "image" : "document", status: "processing" }
      }),
    ])

    await Promise.all(
      added.map(async ({ file, id }) => {
        try {
          const processed = await processFile(file)
          if (!alive.current.has(id)) return // removed while processing

          // Keep the whole message within the image count / size the server accepts.
          const others = itemsRef.current.filter((item) => item.id !== id && item.processed)
          const used = others.reduce(
            (sum, item) => {
              const stats = imageStats(item.processed!)
              return { count: sum.count + stats.count, bytes: sum.bytes + stats.bytes }
            },
            { count: 0, bytes: 0 }
          )
          const mine = imageStats(processed)
          if (used.count + mine.count > LIMITS.maxPixelImages || used.bytes + mine.bytes > IMAGE_BYTES_PER_MESSAGE) {
            throw new Error("That message already has a lot of images. Send it first, then attach more.")
          }

          const previewUrl = processed.kind === "image" ? URL.createObjectURL(processed.image.blob) : undefined
          if (!alive.current.has(id)) {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            return
          }
          commit(
            itemsRef.current.map((item) =>
              item.id === id
                ? { ...item, status: "ready", kind: processed.kind, previewUrl, processed, scanned: processed.kind === "document" ? processed.scanned : undefined }
                : item
            )
          )
          if (processed.kind === "document" && processed.truncated) {
            toast.info(
              processed.scanned
                ? `${file.name} is a scan, so the first ${processed.pageImages.length} pages will be read.`
                : `${file.name} is very long, so only the first part is kept.`
            )
          }
        } catch (error) {
          alive.current.delete(id)
          commit(itemsRef.current.filter((item) => item.id !== id))
          toast.error(error instanceof Error ? error.message : `Could not attach ${file.name}.`)
        }
      })
    )
  }, [commit])

  const remove = useCallback((id: string) => {
    alive.current.delete(id)
    const target = itemsRef.current.find((item) => item.id === id)
    if (target) revoke(target)
    commit(itemsRef.current.filter((item) => item.id !== id))
  }, [commit])

  const clear = useCallback(() => {
    alive.current.clear()
    itemsRef.current.forEach(revoke)
    commit([])
  }, [commit])

  useEffect(() => () => {
    alive.current.clear()
    itemsRef.current.forEach(revoke)
  }, [])

  return {
    items,
    busy: items.some((item) => item.status === "processing"),
    ready: items.filter((item) => item.status === "ready" && item.processed),
    addFiles,
    remove,
    clear,
  }
}
