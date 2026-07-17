import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Home, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found | TomatoAi',
  description: 'The page you were looking for could not be found. Explore the TomatoAi AI tools directory instead.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-slate-400 mb-4">404</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          This page doesn&apos;t exist
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
          The link may be broken, or the page may have moved. Here are a few places to pick back up.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-sm font-medium hover:opacity-85 transition-opacity"
          >
            <Home size={16} /> Back Home
          </Link>
          <Link
            href="/ai-tools"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <Sparkles size={16} /> Browse AI Tools
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <Search size={16} /> Search
          </Link>
        </div>
      </div>
    </div>
  )
}
