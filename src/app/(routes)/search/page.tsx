"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

type ResultType = "web" | "news" | "images"
type SearchResult = {
  type?: ResultType | string
  link?: string
  title?: string
  snippet?: string
  thumbnail?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get("q") ?? ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch results")
        return res.json()
      })
      .then((data) => {
        setResults(data.organic || [])
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [query])

  // Group results by type
  const groupedResults = results.reduce<Record<ResultType, SearchResult[]>>((acc, result) => {
    const type = (result.type === "news" || result.type === "images" || result.type === "web")
      ? (result.type as ResultType)
      : "web"
    acc[type] = acc[type] || []
    acc[type].push(result)
    return acc
  }, { web: [], news: [], images: [] })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for <span className="text-indigo-600">&quot;{query || "No query"}&quot;</span>
          </h1>
          <p className="mt-2 text-gray-600">
            {isLoading ? "Searching..." : results.length > 0 ? `${results.length} results found` : "No results found"}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Results Sections */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-12">
            {/* Web Results */}
            {groupedResults.web.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Web Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {groupedResults.web.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-indigo-600 hover:underline"
                        >
                          {result.title}
                        </a>
                        <p className="mt-2 text-gray-600">{result.snippet}</p>
                        <p className="mt-1 text-sm text-gray-500">{result.link}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* News Results */}
            {groupedResults.news.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">News</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {groupedResults.news.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-indigo-600 hover:underline"
                        >
                          {result.title}
                        </a>
                        <p className="mt-2 text-gray-600">{result.snippet}</p>
                        <p className="mt-1 text-sm text-gray-500">{result.link}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Image Results */}
            {groupedResults.images.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Images</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {groupedResults.images.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="relative group"
                      >
                        <a href={result.link} target="_blank" rel="noopener noreferrer">
                          <img
                            src={result.thumbnail || result.link}
                            alt={result.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              {result.title}
                            </p>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}