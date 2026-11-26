import { MetadataRoute } from 'next'
import { SITE_URL } from '@/metadata-utils'

/**
 * Crawl rules.
 *
 * Search engines need `/_next/static/` (the site's CSS and JavaScript) to render a page the way a visitor sees it, so it
 * is explicitly allowed. Blocking all of `/_next/` (as an older version of this file did) makes Google see an unstyled,
 * script-less page, which hurts ranking and the "mobile friendly" checks. Only private and API paths are blocked.
 *
 * AI search and answer engines (ChatGPT, Claude, Perplexity, Gemini, Apple, Meta...) are welcome: the tool pages are
 * written to be quoted, and /llms.txt gives them a map. SEO-scraper bots are blocked.
 */

const PRIVATE_PATHS = [
  '/api/', '/admin/', '/auth/', '/login', '/signup', '/dashboard', '/profile', '/settings', '/account', '/r/',
  '/temp/', '/private/', '/*.json$', '/search?q=*', '/filter/*',
]

const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'GoogleOther', 'anthropic-ai', 'Claude-Web', 'ClaudeBot',
  'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Applebot', 'Applebot-Extended', 'Meta-ExternalAgent',
  'Meta-ExternalFetcher', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'CCBot',
]

const SCRAPERS = ['AhrefsBot', 'MJ12bot', 'DotBot', 'BlexBot', 'BacklinkCrawler', 'SemrushBot', 'SEOkicks-Robot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everyone else, including Googlebot, Bingbot, DuckDuckBot, YandexBot and Baiduspider.
      { userAgent: '*', allow: ['/', '/_next/static/', '/_next/image'], disallow: PRIVATE_PATHS },
      // Answer engines: same rules, plus the plain-text maps written for them.
      { userAgent: AI_CRAWLERS, allow: ['/', '/llms.txt', '/llms-full.txt', '/_next/static/', '/_next/image'], disallow: PRIVATE_PATHS },
      // SEO and backlink scrapers add load and no readers.
      { userAgent: SCRAPERS, disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
