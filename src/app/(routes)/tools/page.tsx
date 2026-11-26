import type { Metadata } from 'next'

import JsonLd, { faqPageStructuredData } from '@/components/JsonLd'
import ToolPageNavbar from '@/components/ToolPageNavbar'
import ToolsHub from '@/components/daily-tools/ToolsHub'
import { getHubTools } from '@/lib/daily-tools/hub-data'
import { DAILY_TOOLS } from '@/lib/daily-tools/registry'
import { HUB_FAQS, hubGraph, hubImageUrl } from '@/lib/daily-tools/seo'
import { createPageMetadata, SITE_URL } from '@/metadata-utils'

const hubMeta = createPageMetadata({
  title: `${DAILY_TOOLS.length} Free Online Tools: PDF Converter, QR Code, Invoice, LinkedIn & More`,
  description: 'Free tools that run in your browser: PDF to Word and Excel, favicon and QR code makers, image compressor, GST invoice with UPI QR, LinkedIn video downloader, planners, AI writers and calculators.',
  keywords: ['free online tools', 'PDF to Word converter', 'favicon generator', 'QR code generator', 'GST invoice generator', 'LinkedIn video downloader', 'image compressor', 'EMI calculator', 'Hinglish translator'],
  path: '/tools',
})

export const metadata: Metadata = {
  ...hubMeta,
  alternates: { ...hubMeta.alternates, languages: { 'en-IN': `${SITE_URL}/tools`, 'x-default': `${SITE_URL}/tools` } },
  openGraph: { ...hubMeta.openGraph, locale: 'en_IN', images: [{ url: hubImageUrl, width: 1200, height: 630, alt: 'TomatoAi Daily Tools: free online tools' }] },
  twitter: { ...hubMeta.twitter, images: [hubImageUrl] },
}

const EDGES = [
  { title: 'Your files never leave your device', text: 'PDF, image, favicon, QR and invoice tools run inside your browser, so contracts, photos and bank details are never uploaded.' },
  { title: 'Built for India', text: 'GST invoices with UPI QR, UPI and WhatsApp QR codes, rupees in lakh and crore, Indian BMI cut-offs, and Indian letter formats.' },
  { title: 'Hinglish and 11 Indian languages', text: 'Every AI tool can answer in Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi or Urdu.' },
  { title: 'Refine in one click', text: 'Make a result shorter, friendlier or more formal, or switch its language, then send it to another tool.' },
  { title: 'Share anything', text: 'Copy a link that reopens the exact numbers, send results on WhatsApp, download them or print them cleanly.' },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <JsonLd data={[hubGraph(DAILY_TOOLS), faqPageStructuredData(HUB_FAQS)]} />
      <ToolPageNavbar />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
        <header className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-medium leading-tight tracking-tight md:text-5xl">{DAILY_TOOLS.length} free tools that actually do the work</h1>
          <p data-speakable className="mt-4 text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
            Convert PDFs, make favicons and QR codes, compress images, save LinkedIn videos, send GST invoices, plan your week and write with AI. Most run entirely in your browser, so your files stay yours.
          </p>
          <p className="mt-3 hidden text-sm text-zinc-500 md:block">Tip: press <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs dark:border-zinc-700">Ctrl</kbd> + <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs dark:border-zinc-700">K</kbd> anywhere on the site to jump straight to any tool.</p>
        </header>

        <ToolsHub tools={getHubTools()} />

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8" aria-labelledby="why">
          <h2 id="why" className="text-xl font-medium tracking-tight">What makes these different</h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EDGES.map((e) => <li key={e.title}><h3 className="text-sm font-semibold">{e.title}</h3><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{e.text}</p></li>)}
          </ul>
          <p className="mt-6 text-xs text-zinc-500">AI tools need a free account and use your daily AI allowance. All other tools are unlimited and never need one.</p>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-medium tracking-tight">Frequently asked questions</h2>
          <dl className="mt-5 grid gap-6 md:grid-cols-2">
            {HUB_FAQS.map((f) => <div key={f.question}><dt className="text-sm font-semibold">{f.question}</dt><dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{f.answer}</dd></div>)}
          </dl>
        </section>
      </main>
    </div>
  )
}
