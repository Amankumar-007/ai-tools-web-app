"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface VideoData {
  title: string
  description: string
  url: string
}

interface HoverExpandProps {
  videos: VideoData[]
  initialSelectedIndex?: number
  thumbnailHeight?: number
  modalImageSize?: number
  maxThumbnails?: number
}

// Extract YouTube ID from URL
function getYouTubeVideoID(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export default function HoverExpand({
  videos,
  initialSelectedIndex = 0,
  thumbnailHeight = 200,
  modalImageSize = 400,
  maxThumbnails = 11,
}: HoverExpandProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.body.classList.add("overflow-hidden")
      document.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.classList.remove("overflow-hidden")
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.classList.remove("overflow-hidden")
    }
  }, [isModalOpen])

  return (
    <div className="relative">
      <div className="mx-auto flex w-fit gap-1 rounded-md pb-20 pt-10 md:gap-2">
        {videos.slice(0, maxThumbnails).map((video, i) => {
          const videoId = getYouTubeVideoID(video.url)
          const thumbnailUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : ""

          return (
            <div
              key={`video-container-${i}`}
              className={`group relative h-52 overflow-hidden rounded-2xl transition-all duration-300 ${
                selectedIndex === i ? "w-64" : "w-4 sm:w-5 md:w-8 xl:w-12"
              }`}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseLeave={() => setSelectedIndex(i)}
              onClick={() => {
                setSelectedIndex(i)
                setIsModalOpen(true)
              }}
            >
              <motion.div
                layoutId={`image-${i}`}
                className="absolute inset-0 size-full"
              >
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  className="size-full object-cover transition-transform duration-300"
                />
              </motion.div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-content-center bg-white/40 backdrop-blur-sm dark:bg-black/40"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="cursor-pointer overflow-hidden rounded-2xl bg-black"
            >
              <motion.div
                layoutId={`image-${selectedIndex}`}
                className="relative size-96"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${
                    getYouTubeVideoID(videos[selectedIndex].url) ?? ""
                  }?autoplay=1`}
                  title={videos[selectedIndex].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute left-0 top-0 size-full rounded-xl"
                ></iframe>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
