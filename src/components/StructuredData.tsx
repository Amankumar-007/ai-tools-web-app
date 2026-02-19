'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'Product' | 'Article' | 'BreadcrumbList' | 'FAQPage' | 'HowTo'
  data: Record<string, any>
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data of the same type
    const existingScript = document.querySelector(`script[data-structured-data="${type}"]`)
    if (existingScript) {
      existingScript.remove()
    }

    // Create and inject new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-structured-data', type)
    script.textContent = JSON.stringify(data, null, 2)
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector(`script[data-structured-data="${type}"]`)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [type, data])

  return null
}

// Predefined structured data templates
export const WebSiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'tomatoTool',
  alternateName: 'tomatoTool - AI Tools Directory',
  url: 'https://tomatoai.in',
  description: 'Discover and explore the best AI tools for every need. Compare features, read reviews, and find the perfect AI assistant for productivity, creativity, and automation.',
  inLanguage: 'en-US',
  isAccessibleForFree: true,
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://tomatoai.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'tomatoTool',
    url: 'https://tomatoai.in'
  }
}

export const OrganizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'tomatoTool',
  alternateName: 'tomatoTool AI Tools Directory',
  url: 'https://tomatoai.in',
  logo: 'https://tomatoai.in/logo.png',
  description: 'Leading AI tools directory helping users discover and compare the best artificial intelligence software and tools.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@tomatoai.in',
    availableLanguage: ['English']
  },
  sameAs: [
    'https://twitter.com/tomatoai',
    'https://facebook.com/tomatoai',
    'https://linkedin.com/company/tomatoai',
    'https://instagram.com/tomatoai'
  ]
}

export const BreadcrumbListStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})

export const FAQPageStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
})

export const ArticleStructuredData = (article: {
  headline: string
  description: string
  image: string
  author: string
  datePublished: string
  dateModified?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.headline,
  description: article.description,
  image: article.image,
  author: {
    '@type': 'Person',
    name: article.author
  },
  publisher: {
    '@type': 'Organization',
    name: 'tomatoTool',
    logo: {
      '@type': 'ImageObject',
      url: 'https://tomatoai.in/logo.png'
    }
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://tomatoai.in'
  }
})

export const ProductStructuredData = (product: {
  name: string
  description: string
  image: string
  category: string
  offers?: {
    price: string
    priceCurrency: string
    availability: string
  }
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.image,
  category: product.category,
  brand: {
    '@type': 'Brand',
    name: product.name
  },
  ...(product.offers && {
    offers: {
      '@type': 'Offer',
      price: product.offers.price,
      priceCurrency: product.offers.priceCurrency,
      availability: `https://schema.org/${product.offers.availability}`
    }
  })
})
