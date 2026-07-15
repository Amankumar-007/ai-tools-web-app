import type { Metadata } from 'next'
import TrendingClient from './TrendingClient'
import JsonLd, { itemListStructuredData, breadcrumbListStructuredData } from '@/components/JsonLd'
import { createPageMetadata } from '@/metadata-utils'
import { getTrendingNews, getTrendingTools, getGithubTrendingRepos } from '@/lib/trending'

export const metadata: Metadata = createPageMetadata({
  title: 'Trending AI Tools & News',
  description: 'Discover the fastest-growing AI products and the latest AI news. We track real Hacker News discussion signal and developer activity to find the next AI super tools. Updated daily.',
  keywords: ['AI tools', 'trending AI', 'artificial intelligence news', 'AI product directory', 'best AI tools', 'ChatGPT', 'DeepSeek', 'AI updates'],
  path: '/trending',
})

// Hourly ISR ceiling; a daily Vercel Cron job (see /api/cron/refresh-trending)
// also force-revalidates this page once a day regardless of traffic.
export const revalidate = 3600

export default async function TrendingPage() {
  const [initialNews, initialTools, allRepos] = await Promise.all([
    getTrendingNews(),
    getTrendingTools(),
    getGithubTrendingRepos(30),
  ])
  const lastUpdated = new Date().toISOString()

  return (
    <>
      <JsonLd
        data={itemListStructuredData(
          initialTools.map((tool) => ({
            name: tool.name,
            url: `https://${tool.website}`,
            description: tool.description,
          }))
        )}
      />
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: 'Home', url: 'https://tomatoai.in' },
          { name: 'Trending', url: 'https://tomatoai.in/trending' },
        ])}
      />
      <TrendingClient
        initialTools={initialTools}
        initialNews={initialNews}
        initialRepos={allRepos.slice(0, 6)}
        totalRepoCount={allRepos.length}
        lastUpdated={lastUpdated}
      />
    </>
  )
}
