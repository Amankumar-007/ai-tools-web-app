import { toolsByCategory } from '@/lib/daily-tools/registry'
import { llmsFull } from '@/lib/daily-tools/seo'

// Every Daily Tool page as plain text (answer, facts, steps, FAQs): one file an AI assistant can read in full.
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFull(toolsByCategory()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800', 'X-Content-Type-Options': 'nosniff' },
  })
}
