// Server component: renders JSON-LD directly into the SSR'd HTML <head>/<body>
import { SITE_URL } from '@/metadata-utils'
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
  url: SITE_URL,
  description: 'Discover and explore the best AI tools for every need. Compare features, read reviews, and find the perfect AI assistant for productivity, creativity, and automation.',
  inLanguage: 'en-US',
  isAccessibleForFree: true,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TomatoAi India',
    url: SITE_URL,
  },
}

export const OrganizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TomatoAi India',
  alternateName: 'TomatoAi AI Tools Directory',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
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

// Structured data for a tool detail page.
//
// The previous version emitted a top-level SoftwareApplication whose Offer had
// `price: undefined` next to `priceCurrency: 'USD'` — JSON.stringify drops the
// undefined key, leaving an Offer with a currency but no price, which is an
// invalid Offer and flagged every tool page as a rich-results error.
//
// It is also modelled as a review page rather than as the application itself.
// We review third-party tools, we don't publish them, and we have no genuine
// ratings or reviews to cite — so claiming a top-level SoftwareApplication
// (whose rich result requires `aggregateRating` and `review`) can only ever
// fail validation, and inventing those values would breach Google's
// structured-data policy. Describing the page as an ItemPage *about* the
// application states the same facts truthfully and validates cleanly.
export const softwareApplicationStructuredData = (tool: {
  name: string
  description: string
  category: string
  url: string
  pageUrl?: string
  pricing?: string
}) => {
  // Only assert a price we can actually stand behind: "Free" and "Freemium"
  // both have a genuine $0 entry point. "Paid" tools have a price we don't
  // track, so no Offer is emitted rather than a made-up one.
  const hasFreeTier = tool.pricing === 'Free' || tool.pricing === 'Freemium'

  const application: Record<string, any> = {
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    // schema.org expects a known application category here; the site's own
    // finer-grained label ("AI Chat", "Video Editing", …) belongs in the
    // subcategory field.
    applicationCategory: 'WebApplication',
    applicationSubCategory: tool.category,
    operatingSystem: 'Web',
    url: tool.url,
    ...(hasFreeTier
      ? {
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            ...(tool.pricing === 'Freemium'
              ? { description: 'Free tier available, with paid plans for additional usage' }
              : {}),
          },
        }
      : {}),
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: `${tool.name} review, pricing and features`,
    description: tool.description,
    ...(tool.pageUrl ? { url: tool.pageUrl } : {}),
    about: application,
    isPartOf: {
      '@type': 'WebSite',
      name: 'TomatoAi India',
      url: SITE_URL,
    },
  }
}
