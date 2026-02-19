import type { Metadata } from 'next'

// Base metadata template
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://tomatoai.in'),
  title: {
    default: 'tomatoTool - Best AI Tools Directory & Reviews 2025',
    template: '%s | tomatoTool'
  },
  description: 'Discover and explore the best AI tools for every need. Compare features, read reviews, and find the perfect AI assistant for productivity, creativity, and automation.',
  keywords: [
    'AI tools',
    'artificial intelligence',
    'AI directory',
    'best AI tools 2025',
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
    'AI marketing tools'
  ],
  authors: [{ name: 'tomatoTool Team' }],
  creator: 'tomatoTool',
  publisher: 'tomatoTool',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'tomatoTool',
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

// Helper function to create page-specific metadata
export function createPageMetadata(config: {
  title: string
  description: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    url?: string
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
  alternates?: {
    canonical?: string
  }
}): Metadata {
  return {
    ...baseMetadata,
    title: {
      default: config.title,
      template: `%s | ${config.title}`
    },
    description: config.description,
    keywords: config.keywords || baseMetadata.keywords,
    openGraph: {
      ...baseMetadata.openGraph,
      title: config.openGraph?.title || config.title,
      description: config.openGraph?.description || config.description,
      url: config.openGraph?.url || `https://tomatoai.in${config.alternates?.canonical || ''}`,
      images: config.openGraph?.images || baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: config.twitter?.title || config.title,
      description: config.twitter?.description || config.description,
      images: config.twitter?.images || baseMetadata.twitter?.images,
    },
    alternates: {
      canonical: config.alternates?.canonical,
    },
  }
}
