import type { Metadata } from 'next'

export const SITE_NAME = 'TomatoAi'

// The single source of truth for the canonical origin. Every canonical tag,
// sitemap entry, OG url and JSON-LD `url` derives from this — if it disagrees
// with the host the CDN actually serves, every URL on the site becomes a
// "canonical points to redirect" / "3XX in sitemap" issue.
//
// The apex (tomatoai.in) 307-redirects to www on Vercel, so www is canonical.
// To flip to the apex later: make tomatoai.in the primary domain in Vercel,
// then set NEXT_PUBLIC_SITE_URL=https://tomatoai.in — nothing else changes.
//
// NEXT_PUBLIC_SITE_URL is also read by the OpenRouter helpers as an
// HTTP-Referer, where a localhost value is legitimate — so only an https
// origin is accepted here. That keeps a dev machine's localhost value from
// ever leaking into a canonical tag or the sitemap.
const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '')

export const SITE_URL = configuredOrigin?.startsWith('https://')
  ? configuredOrigin
  : 'https://www.tomatoai.in'

// Base metadata template
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Find Best AI Tool for Your Work - TomatoAi India Directory & Reviews',
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Find the best AI tools for your work. Search, rank, and explore our comprehensive directory of AI tools, trending GitHub repos, news, and more for productivity and automation.',
  keywords: [
    'AI tools',
    'artificial intelligence',
    'AI directory',
    'best AI tools 2026',
    'AI software',
    'machine learning tools',
    'AI productivity',
    'AI automation',
    'AI assistants',
    'AI reviews',
    'ChatGPT alternatives',
    'AI writing tools',
    'AI image generators',
    'AI video editors',
    'AI code assistants',
    'AI marketing tools',
  ],
  authors: [{ name: 'TomatoAi Team' }],
  creator: 'TomatoAi',
  publisher: 'TomatoAi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'TomatoAi India',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tomatoai',
    creator: '@tomatoai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

interface PageMetadataConfig {
  title: string
  description: string
  keywords?: string[]
  path: string
  noIndex?: boolean
  openGraph?: {
    title?: string
    description?: string
    images?: Array<{
      url: string
      width: number
      height: number
      alt: string
    }>
  }
  twitter?: {
    title?: string
    description?: string
    images?: string[]
  }
}

// Shared helper every route uses to build consistent, page-specific metadata
// (title, description, keywords, canonical, OG, Twitter).
export function createPageMetadata(config: PageMetadataConfig): Metadata {
  const canonical = config.path === '/' ? '/' : `/${config.path.replace(/^\/+/, '')}`
  const url = `${SITE_URL}${canonical === '/' ? '' : canonical}`

  // Next.js resolves `title.template` inheritance inconsistently across
  // nested layouts that mix static `metadata` exports with `generateMetadata`
  // functions (some pages ended up double-branded, others un-branded).
  // Using `absolute` sidesteps that entirely: every page controls its exact
  // final title.
  const brandedTitle = /tomatoai/i.test(config.title) ? config.title : `${config.title} | ${SITE_NAME}`

  return {
    title: { absolute: brandedTitle },
    description: config.description,
    keywords: config.keywords || baseMetadata.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: config.openGraph?.title || config.title,
      description: config.openGraph?.description || config.description,
      url,
      images: config.openGraph?.images || [
        {
          url: '/ab.png',
          width: 1536,
          height: 1024,
          alt: `${config.title} | TomatoAi`,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: config.twitter?.title || config.title,
      description: config.twitter?.description || config.description,
      images: config.twitter?.images || ['/ab.png'],
    },
    // `noindex, follow` rather than `noindex, nofollow`: these pages (login,
    // register, checkout success…) shouldn't rank, but they still link back
    // into the site, and `nofollow` throws that internal link signal away and
    // gets flagged as a "noindex and nofollow page".
    robots: config.noIndex
      ? { index: false, follow: true }
      : baseMetadata.robots,
  }
}

interface ToolMetadataConfig {
  name: string
  slug: string
  category: string
  description: string
  pricing?: string
}

// Search engines truncate around these lengths, and Ahrefs/Screaming Frog
// flag anything past them. Titles are measured *including* the " | TomatoAi"
// suffix that createPageMetadata appends.
const MAX_TITLE_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 158
const BRAND_SUFFIX_LENGTH = ` | ${SITE_NAME}`.length

// Trims to the last whole word that fits, so a generated description never
// gets cut mid-word.
function clampToWordBoundary(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= max) return collapsed
  const cut = collapsed.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:-]+$/, '')}…`
}

// Per-tool metadata for the dynamic /ai-tools/[slug] pages.
export function createToolMetadata(tool: ToolMetadataConfig): Metadata {
  // Tool names vary from "Claude" to "Luma Dream Machine", so the descriptive
  // title only gets used when the whole thing still fits inside the limit.
  const fullTitle = `${tool.name} Review - Pricing & Features`
  const title =
    fullTitle.length + BRAND_SUFFIX_LENGTH <= MAX_TITLE_LENGTH
      ? fullTitle
      : `${tool.name} Review`

  // Only the tool's own blurb is variable-length, so the pricing tail is
  // budgeted for first and always survives — truncating the blurb instead of
  // losing the most useful part of the snippet.
  const prefix = `${tool.name} (${tool.category}): `
  const suffix = tool.pricing ? ` Pricing: ${tool.pricing}, plus features and alternatives.` : ' Features and alternatives.'
  const description =
    prefix +
    clampToWordBoundary(tool.description, MAX_DESCRIPTION_LENGTH - prefix.length - suffix.length) +
    suffix

  return createPageMetadata({
    title,
    description,
    path: `/ai-tools/${tool.slug}`,
    keywords: [
      tool.name,
      `${tool.name} review`,
      `${tool.name} pricing`,
      `${tool.name} alternatives`,
      tool.category,
      'AI tools',
      'AI tools directory',
    ],
  })
}
