import { DAILY_TOOLS, toolsByCategory } from '@/lib/daily-tools/registry'
import { llmsIndex } from '@/lib/daily-tools/seo'

// A short, plain-text map of the site for AI assistants (see llmstxt.org). Built from the same registry as the pages.
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsIndex(DAILY_TOOLS, toolsByCategory()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800', 'X-Content-Type-Options': 'nosniff' },
  })
}
