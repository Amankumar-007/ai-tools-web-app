import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

import JsonLd from '@/components/JsonLd'
import ToolPageAbout from '@/components/ToolPageAbout'
import ToolPageNavbar from '@/components/ToolPageNavbar'
import { ToolTile } from '@/components/daily-tools/icons'
import ToolBody from '@/components/daily-tools/ToolBody'
import { getToolPeers } from '@/lib/daily-tools/hub-data'
import { DAILY_TOOLS, getDailyTool } from '@/lib/daily-tools/registry'
import { keyFacts, TOOLS_UPDATED, toolGraph, toolImageUrl, toolTitle, toolUrl } from '@/lib/daily-tools/seo'
import { createPageMetadata } from '@/metadata-utils'

// Every page is known at build time, so they are pre-rendered (fast, and fully crawlable).
export const dynamicParams = false
export function generateStaticParams() {
  return DAILY_TOOLS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = getDailyTool((await params).slug)
  if (!tool) return {}
  const url = toolUrl(tool.slug)
  const meta = createPageMetadata({ title: toolTitle(tool), description: tool.description, keywords: tool.keywords, path: `/tools/${tool.slug}` })
  return {
    ...meta,
    // Indian English is the audience; one canonical address for every language and region.
    alternates: { ...meta.alternates, languages: { 'en-IN': url, 'x-default': url } },
    // A share card made for each tool (app/og/tools/[slug]), instead of the generic poster.
    openGraph: { ...meta.openGraph, type: 'website', locale: 'en_IN', images: [{ url: toolImageUrl(tool.slug), width: 1200, height: 630, alt: `${tool.name}: ${tool.tagline}` }] },
    twitter: { ...meta.twitter, images: [toolImageUrl(tool.slug)] },
  }
}

export default async function DailyToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const tool = getDailyTool((await params).slug)
  if (!tool) notFound()
  const related = DAILY_TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).concat(DAILY_TOOLS.filter((t) => t.category !== tool.category)).slice(0, 4)

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <JsonLd data={toolGraph(tool)} />
      <div className="print:hidden"><ToolPageNavbar /></div>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-28">
        <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400 print:hidden">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">Home</Link><ChevronRight className="h-3.5 w-3.5" />
          <Link href="/tools" className="hover:text-zinc-900 dark:hover:text-white">Daily Tools</Link><ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-zinc-900 dark:text-white">{tool.name}</span>
        </nav>

        <header className="mb-8 print:mb-4">
          {/* Phones: icon beside the name, then the text across the full width. Wider screens: everything beside the icon. */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 sm:items-start">
            <span className="sm:row-span-2 print:hidden"><ToolTile icon={tool.icon} color={tool.color} size="lg" /></span>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">{tool.name}</h1>
            <div className="col-span-2 mt-2 sm:col-span-1 sm:col-start-2 sm:mt-0">
              <p data-speakable className="max-w-2xl text-base text-zinc-600 sm:mt-2 dark:text-zinc-400">{tool.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tool.kind === 'ai' ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300' : tool.kind === 'online' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>{tool.kind === 'ai' ? 'AI tool · free account' : tool.kind === 'online' ? 'Free · no sign-in' : 'Runs on your device · no sign-in'}</span>
                {tool.edge.map((e) => <span key={e} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">{e}</span>)}
              </div>
            </div>
          </div>
        </header>

        <ToolBody slug={tool.slug} kind={tool.kind} peers={tool.kind === 'ai' ? getToolPeers() : []} />

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8 print:hidden" aria-labelledby="glance">
          <h2 id="glance" className="text-lg font-semibold">{tool.name} at a glance</h2>
          <p data-speakable className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{tool.description}</p>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {keyFacts(tool).map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{fact.label}</dt>
                <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">{fact.label === 'Last updated' ? <time dateTime={TOOLS_UPDATED}>{fact.value}</time> : fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 print:hidden" aria-labelledby="more-tools">
          <h2 id="more-tools" className="mb-4 text-lg font-semibold">More daily tools</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}`} className="flex h-full items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-orange-500/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <ToolTile icon={t.icon} color={t.color} />
                  <span><span className="block text-sm font-medium">{t.name}</span><span className="mt-0.5 block text-xs text-zinc-500">{t.tagline}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className="print:hidden">
        <ToolPageAbout content={{ heading: `About the ${tool.name}`, intro: tool.intro, steps: tool.steps, faqs: tool.faqs }} />
      </div>
    </div>
  )
}
