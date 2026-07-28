import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Cog,
  Wallet,
  Globe,
  Tag,
  Layers,
} from 'lucide-react'
import ToolPageNavbar from '@/components/ToolPageNavbar'
import Footer from '@/components/footer'
import ToolFaqAccordion from '@/components/ToolFaqAccordion'
import JsonLd, { breadcrumbListStructuredData, softwareApplicationStructuredData, faqPageStructuredData } from '@/components/JsonLd'
import { createToolMetadata } from '@/metadata-utils'
import { getAllTools, getToolBySlug, getToolContent, getToolLogoUrl } from '@/lib/tools'

export const revalidate = 86400

// Rotating accent palette shared by feature/use-case tiles, matching the
// colored-icon-square language used elsewhere on the site (e.g. /about).
const ACCENTS = [
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', ring: 'group-hover:border-blue-500/30 dark:group-hover:border-blue-500/20' },
  { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', ring: 'group-hover:border-pink-500/30 dark:group-hover:border-pink-500/20' },
  { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'group-hover:border-indigo-500/30 dark:group-hover:border-indigo-500/20' },
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', ring: 'group-hover:border-violet-500/30 dark:group-hover:border-violet-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/20' },
  { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'group-hover:border-orange-500/30 dark:group-hover:border-orange-500/20' },
]

const PRICING_BADGE: Record<string, string> = {
  Free: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Freemium: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  Paid: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
}

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

  const content = getToolContent(slug)
  const logoUrl = getToolLogoUrl(tool.website)
  const pricingBadge = PRICING_BADGE[tool.pricing] || PRICING_BADGE.Freemium

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
      {content?.faqs && content.faqs.length > 0 && (
        <JsonLd data={faqPageStructuredData(content.faqs)} />
      )}

      <ToolPageNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/ai-tools"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to AI Tools Directory
        </Link>

        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/60 dark:border-white/5 bg-gradient-to-br from-[#eef2f9] via-[#f3f6fb] to-[#fbfbfd] dark:from-[#121826] dark:via-[#141b2b] dark:to-[#0f1420] p-6 sm:p-10 mb-10 shadow-sm">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white dark:bg-white shadow-md border border-slate-200/60 dark:border-white/10 flex items-center justify-center p-4 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`${tool.name} logo`} className="w-full h-full object-contain" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  <Tag size={11} /> {tool.category}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${pricingBadge}`}>
                  <Wallet size={11} /> {tool.pricing}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {tool.name}
              </h1>
            </div>
          </div>

          <p className="relative text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mt-6 max-w-2xl">
            {tool.description}
          </p>

          <div className="relative flex flex-wrap items-center gap-4 mt-8">
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 text-sm font-semibold hover:opacity-85 transition-opacity shadow-sm"
            >
              Visit Website <ArrowUpRight size={14} />
            </a>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Globe size={14} /> {hostname}
            </span>
          </div>
        </section>

        {/* ===================== AT A GLANCE ===================== */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-12">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={15} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Pricing</p>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">{tool.pricing}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Layers size={15} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Category</p>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">{tool.category}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Globe size={15} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Website</p>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">{hostname}</p>
          </div>
        </div>

        {tool.features?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
              Key Features
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {tool.features.map((feature, i) => {
                const accent = ACCENTS[i % ACCENTS.length]
                return (
                  <li
                    key={feature}
                    className={`group flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3.5 transition-colors ${accent.ring}`}
                  >
                    <span className={`w-8 h-8 rounded-lg ${accent.bg} ${accent.text} flex items-center justify-center shrink-0`}>
                      <CheckCircle2 size={15} />
                    </span>
                    <span className="font-medium">{feature}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {content && (
          <>
            <div className="grid md:grid-cols-2 gap-5 mb-12">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2.5">
                  What is {tool.name}?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content.overview}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Cog size={18} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2.5">
                  How {tool.name} works
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content.howItWorks}</p>
              </div>
            </div>

            <div className="mb-12 rounded-3xl border border-emerald-200/60 dark:border-emerald-500/15 bg-emerald-50/40 dark:bg-emerald-500/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet size={18} />
                </span>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Is {tool.name} free?
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content.freeTierInfo}</p>
            </div>

            {content.useCases.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
                  What can you use {tool.name} for?
                </h2>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {content.useCases.map((useCase, i) => {
                    const accent = ACCENTS[(i + 2) % ACCENTS.length]
                    return (
                      <li
                        key={useCase}
                        className={`group flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3.5 transition-colors ${accent.ring}`}
                      >
                        <span className={`w-8 h-8 rounded-lg ${accent.bg} ${accent.text} flex items-center justify-center shrink-0`}>
                          <CheckCircle2 size={15} />
                        </span>
                        <span className="pt-1.5">{useCase}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {(content.pros.length > 0 || content.cons.length > 0) && (
              <div className="mb-12 grid sm:grid-cols-2 gap-5">
                {content.pros.length > 0 && (
                  <div className="rounded-3xl border border-emerald-200/60 dark:border-emerald-500/15 bg-emerald-50/30 dark:bg-emerald-500/[0.03] p-6">
                    <h2 className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Pros
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {content.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.cons.length > 0 && (
                  <div className="rounded-3xl border border-rose-200/60 dark:border-rose-500/15 bg-rose-50/30 dark:bg-rose-500/[0.03] p-6">
                    <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
                      <XCircle size={16} /> Cons
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {content.cons.map((con) => (
                        <li key={con} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                          <XCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {content.faqs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <HelpCircle size={18} className="text-slate-400 dark:text-slate-500" />
                  Frequently asked questions
                </h2>
                <ToolFaqAccordion faqs={content.faqs} />
              </div>
            )}
          </>
        )}

        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
              Similar {tool.category} Tools
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ai-tools/${r.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                >
                  <div className="w-11 h-11 rounded-xl border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 bg-white dark:bg-[#0B0F1A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getToolLogoUrl(r.website)} alt={r.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{r.name}</p>
                      <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 shrink-0 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{r.description}</p>
                  </div>
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
