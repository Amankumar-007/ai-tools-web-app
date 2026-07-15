import type { Metadata } from 'next'

export const SITE_NAME = 'TomatoAi'
export const SITE_URL = 'https://tomatoai.in'

// Base metadata template
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TomatoAi India - Best AI Tools Directory & Reviews 2026',
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Discover and explore the best AI tools for every need. Compare features, read reviews, and find the perfect AI assistant for productivity, creativity, and automation.',
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
      canonical,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: config.openGraph?.title || config.title,
      description: config.openGraph?.description || config.description,
      url,
      images: config.openGraph?.images || [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${config.title} | TomatoAi`,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: config.twitter?.title || config.title,
      description: config.twitter?.description || config.description,
      images: config.twitter?.images || ['/twitter-image.jpg'],
    },
    robots: config.noIndex
      ? { index: false, follow: false }
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

// Per-tool metadata for the dynamic /ai-tools/[slug] pages.
export function createToolMetadata(tool: ToolMetadataConfig): Metadata {
  const title = `${tool.name} - AI Tool Review, Pricing & Features`
  const description = `${tool.name} (${tool.category}): ${tool.description} See pricing${tool.pricing ? ` (${tool.pricing})` : ''}, features, and alternatives on TomatoAi.`

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
