'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

import type { ToolPeer } from '@/lib/daily-tools/categories'

function Skeleton() {
  return <div className="h-96 animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" aria-label="Loading tool" />
}

/** Each on-device tool is its own chunk, so opening one never downloads the others (the PDF engine alone is large). */
const AiToolRunner = dynamic(() => import('./AiToolRunner'), { loading: Skeleton })

const LOCAL: Record<string, ComponentType> = {
  'pdf-converter': dynamic(() => import('./local/PdfConverter'), { loading: Skeleton }),
  'pdf-tools': dynamic(() => import('./local/PdfTools'), { loading: Skeleton }),
  'favicon-generator': dynamic(() => import('./local/FaviconGenerator'), { loading: Skeleton }),
  'image-converter': dynamic(() => import('./local/ImageConverter'), { loading: Skeleton }),
  'qr-code-generator': dynamic(() => import('./local/QrGenerator'), { loading: Skeleton }),
  'youtube-thumbnail-downloader': dynamic(() => import('./local/YoutubeThumbnail'), { loading: Skeleton }),
  'linkedin-video-downloader': dynamic(() => import('./local/LinkedInDownloader'), { loading: Skeleton }),
  'x-video-downloader': dynamic(() => import('./local/XVideoDownloader'), { loading: Skeleton }),
  'resume-builder': dynamic(() => import('./local/ResumeBuilder'), { loading: Skeleton }),
  'resume-keyword-matcher': dynamic(() => import('./local/ResumeKeywordMatcher'), { loading: Skeleton }),
  'invoice-generator': dynamic(() => import('./local/InvoiceGenerator'), { loading: Skeleton }),
  'day-planner': dynamic(() => import('./local/DayPlanner'), { loading: Skeleton }),
  'emi-calculator': dynamic(() => import('./local/EmiCalculator'), { loading: Skeleton }),
  'sip-calculator': dynamic(() => import('./local/SipCalculator'), { loading: Skeleton }),
  'gst-calculator': dynamic(() => import('./local/GstCalculator'), { loading: Skeleton }),
  'percentage-calculator': dynamic(() => import('./local/PercentageCalculator'), { loading: Skeleton }),
  'bill-splitter': dynamic(() => import('./local/BillSplitter'), { loading: Skeleton }),
  'bmi-calorie-calculator': dynamic(() => import('./local/BmiCalculator'), { loading: Skeleton }),
  'age-date-calculator': dynamic(() => import('./local/AgeDateCalculator'), { loading: Skeleton }),
  'unit-converter': dynamic(() => import('./local/UnitConverter'), { loading: Skeleton }),
  'password-generator': dynamic(() => import('./local/PasswordTool'), { loading: Skeleton }),
  'text-toolkit': dynamic(() => import('./local/TextToolkit'), { loading: Skeleton }),
}

export const LOCAL_SLUGS = Object.keys(LOCAL)

export default function ToolBody({ slug, kind, peers }: { slug: string; kind: 'ai' | 'local' | 'online'; peers: ToolPeer[] }) {
  if (kind === 'ai') return <AiToolRunner slug={slug} peers={peers} />
  const Tool = LOCAL[slug]
  return Tool ? <Tool /> : null
}
