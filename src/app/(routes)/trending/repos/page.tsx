import type { Metadata } from 'next'
import ReposClient from './ReposClient'
import JsonLd, { itemListStructuredData, breadcrumbListStructuredData } from '@/components/JsonLd'
import { createPageMetadata } from '@/metadata-utils'
import { getGithubTrendingRepos } from '@/lib/trending'

export const metadata: Metadata = createPageMetadata({
  title: 'Trending GitHub Repositories',
  description: 'Browse the fastest-growing GitHub repositories from the last 7 days, ranked by stars. Updated hourly.',
  keywords: ['trending github repos', 'github trending', 'open source', 'popular repositories', 'new github projects'],
  path: '/trending/repos',
})

export const revalidate = 3600

export default async function TrendingReposPage() {
  const repos = await getGithubTrendingRepos(50)
  const lastUpdated = new Date().toISOString()

  return (
    <>
      <JsonLd
        data={itemListStructuredData(
          repos.map((repo) => ({
            name: repo.fullName,
            url: repo.url,
            description: repo.description,
          }))
        )}
      />
      <JsonLd
        data={breadcrumbListStructuredData([
          { name: 'Home', url: 'https://tomatoai.in' },
          { name: 'Trending', url: 'https://tomatoai.in/trending' },
          { name: 'GitHub Repos', url: 'https://tomatoai.in/trending/repos' },
        ])}
      />
      <ReposClient repos={repos} lastUpdated={lastUpdated} />
    </>
  )
}
