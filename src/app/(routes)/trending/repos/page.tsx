import type { Metadata } from 'next'
import ReposClient from './ReposClient'
import JsonLd, { itemListStructuredData, breadcrumbListStructuredData } from '@/components/JsonLd'
import { createPageMetadata, SITE_URL } from '@/metadata-utils'
import { getGithubTrendingRepos } from '@/lib/trending'

export const metadata: Metadata = createPageMetadata({
  title: 'Trending GitHub Repositories',
  description: 'Browse the fastest-growing GitHub repositories from the last 7 days, ranked by stars gained. Spot new AI libraries and developer tools early. Updated hourly.',
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
          { name: 'Home', url: SITE_URL },
          { name: 'Trending', url: `${SITE_URL}/trending` },
          { name: 'GitHub Repos', url: `${SITE_URL}/trending/repos` },
        ])}
      />
      <ReposClient repos={repos} lastUpdated={lastUpdated} />
    </>
  )
}
