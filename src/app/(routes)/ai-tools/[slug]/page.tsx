import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import ToolPageNavbar from '@/components/ToolPageNavbar'
import Footer from '@/components/footer'
import JsonLd, { breadcrumbListStructuredData, softwareApplicationStructuredData } from '@/components/JsonLd'
import { createToolMetadata } from '@/metadata-utils'
import { getAllTools, getToolBySlug } from '@/lib/tools'

export const revalidate = 86400

export async function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return {}
  return createToolMetadata(tool)
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) notFound()

  const hostname = (() => {
    try {
      return new URL(tool.website).hostname
    } catch {
      return tool.website
    }
  })()

  const related = getAllTools()
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A]">
      <JsonLd
        data={softwareApplicationStructuredData({
          name: tool.name,
          description: tool.description,
          category: tool.category,
          url: tool.website,
          pricing: tool.pricing,
        })}
      />
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: 'Home', url: 'https://tomatoai.in' },
          { name: 'AI Tools', url: 'https://tomatoai.in/ai-tools' },
          { name: tool.name, url: `https://tomatoai.in/ai-tools/${tool.slug}` },
        ])}
      />

      <ToolPageNavbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <Link
          href="/ai-tools"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to AI Tools Directory
        </Link>

        <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {tool.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              {tool.name}
            </h1>
          </div>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Visit {hostname} <ArrowUpRight size={14} />
          </a>
        </div>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10">
          {tool.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Pricing
            </h2>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{tool.pricing}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Category
            </h2>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{tool.category}</p>
          </div>
        </div>

        {tool.features?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Key Features
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {tool.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 rounded-xl border border-slate-100 dark:border-slate-800 px-4 py-3"
                >
                  <CheckCircle2 size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Similar {tool.category} Tools
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ai-tools/${r.slug}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <p className="font-medium text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
