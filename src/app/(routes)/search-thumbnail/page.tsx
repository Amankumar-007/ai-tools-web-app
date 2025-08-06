'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchThumbnailPage() {
  const [query, setQuery] = useState('')
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setImages([])

    try {
      const finalQuery = `${query.trim()} thumbnail` // Append 'thumbnail'
      const res = await fetch(`/api/search-thumbnail?query=${encodeURIComponent(finalQuery)}`)
      if (!res.ok) throw new Error('Something went wrong')
      const data = await res.json()
      setImages(data)
    } catch (err: any) {
      setError(err.message || 'Error fetching images')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-gray-800 mb-8"
        >
          Thumbnail Search 🔍
        </motion.h1>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-3 mb-10"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. cars, tech, nature..."
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Search
          </button>
        </form>

        {loading && (
          <motion.p
            className="text-center text-gray-500 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Fetching thumbnails...
          </motion.p>
        )}

        {error && (
          <motion.p
            className="text-center text-red-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <AnimatePresence>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
          >
            {images.map((img, i) => (
              <motion.a
                href={img.link}
                key={i}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group block bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
              >
                <Image
                  src={img.thumbnail}
                  alt={img.title || 'Thumbnail'}
                  width={300}
                  height={200}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-2">
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 truncate">
                    {img.title || 'Untitled'}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
