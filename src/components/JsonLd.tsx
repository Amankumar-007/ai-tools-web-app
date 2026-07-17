// Server component: renders JSON-LD directly into the SSR'd HTML <head>/<body>
// so crawlers that don't execute JS still see structured data (unlike the old
// client-side useEffect + DOM-injection approach).
export default function JsonLd({ data }: { data: Record<string, any> | Record<string, any>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export const WebSiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TomatoAi India',
  alternateName: 'TomatoAi - AI Tools Directory',
  url: 'https://tomatoai.in',
  description: 'Discover and explore the best AI tools for every need. Compare features, read reviews, and find the perfect AI assistant for productivity, creativity, and automation.',
  inLanguage: 'en-US',
  isAccessibleForFree: true,
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://tomatoai.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TomatoAi India',
    url: 'https://tomatoai.in',
  },
}

export const OrganizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TomatoAi India',
  alternateName: 'TomatoAi AI Tools Directory',
  url: 'https://tomatoai.in',
  logo: 'https://tomatoai.in/logo.png',
  description: 'Leading AI tools directory helping users discover and compare the best artificial intelligence software and tools.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@tomatoai.in',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://twitter.com/tomatoai',
    'https://facebook.com/tomatoai',
    'https://linkedin.com/company/tomatoai',
    'https://instagram.com/tomatoai',
  ],
}

export const breadcrumbListStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const faqPageStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

export const itemListStructuredData = (items: Array<{ name: string; url: string; description?: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    url: item.url,
    ...(item.description ? { description: item.description } : {}),
  })),
})

export const howToStructuredData = (guide: {
  name: string
  description: string
  totalTime?: string
  steps: Array<{ name: string; text: string }>
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: guide.name,
  description: guide.description,
  ...(guide.totalTime ? { totalTime: guide.totalTime } : {}),
  step: guide.steps.map((step) => ({
    '@type': 'HowToStep',
    name: step.name,
    text: step.text,
  })),
})

export const softwareApplicationStructuredData = (tool: {
  name: string
  description: string
  category: string
  url: string
  pricing?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: tool.name,
  description: tool.description,
  applicationCategory: tool.category,
  url: tool.url,
  offers: {
    '@type': 'Offer',
    price: tool.pricing === 'Free' ? '0' : undefined,
    priceCurrency: 'USD',
    category: tool.pricing || 'Freemium',
  },
})
