export interface TrendingNewsItem {
  id: number
  title: string
  link: string
  pubDate: string
  source: string
  image: string | null
  snippet: string
  tag: string
}

export interface TrendingRepo {
  id: number
  name: string
  fullName: string
  owner: string
  ownerAvatar: string
  description: string
  url: string
  stars: number
  forks: number
  language: string | null
}

export interface TrendingTool {
  id: string
  name: string
  category: string
  website: string
  description: string
  rank: number
  trendScore: number
  utilityScore: number
  growth: string
  graphData: number[]
  mentions: number
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function stripHtml(str: string): string {
  return decodeHtmlEntities(str.replace(/<[^>]+>/g, '')).trim()
}

// TechCrunch's WordPress REST API (with _embed) exposes each post's real
// featured image, unlike its RSS feed which contains no images at all.
const TECHCRUNCH_AI_CATEGORY_ID = 577047203

async function fetchWithTimeout(url: string, options: any = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

export async function getTrendingNews(): Promise<TrendingNewsItem[]> {
  try {
    // _fields projection cuts the response from ~15MB → ~1MB so it fits
    // within Next.js's 2MB fetch cache limit and completes within the timeout.
    const url = `https://techcrunch.com/wp-json/wp/v2/posts?categories=${TECHCRUNCH_AI_CATEGORY_ID}&per_page=10&_embed=wp:featuredmedia&_fields=id,title,link,date,excerpt,_links,_embedded`
    const res = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'tomatoai-trending/1.0' },
      next: { revalidate: 3600 },
    }, 15000)  // 15s — embedded media makes the response larger
    if (!res.ok) throw new Error(`TechCrunch API ${res.status}`)
    const posts: any[] = await res.json()

    return posts.map((post, idx) => {
      const media = post._embedded?.['wp:featuredmedia']?.[0]
      const image: string | null =
        (media && !media.code && (media.media_details?.sizes?.medium_large?.source_url || media.source_url)) || null

      return {
        id: idx + 1,
        title: decodeHtmlEntities(post.title?.rendered || ''),
        link: post.link || '',
        pubDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
        source: 'TechCrunch AI',
        image,
        snippet: stripHtml(post.excerpt?.rendered || ''),
        tag: 'News',
      }
    })
  } catch (e) {
    console.error('TechCrunch fetch error:', e)
    return []
  }
}

const CURATED_TOOLS: Array<{ id: string; name: string; category: string; website: string; description: string }> = [
  { id: 'deepseek', name: 'DeepSeek R1', category: 'Dev', website: 'deepseek.com', description: 'Open-source reasoning model.' },
  { id: 'lovable', name: 'Lovable', category: 'Dev', website: 'lovable.dev', description: 'Generative UI builder.' },
  { id: 'sora', name: 'Sora', category: 'Creative', website: 'openai.com', description: 'AI video generation.' },
  { id: 'perplexity', name: 'Perplexity', category: 'Productivity', website: 'perplexity.ai', description: 'Real-time search engine.' },
  { id: 'cursor', name: 'Cursor', category: 'IDE', website: 'cursor.com', description: 'The AI-first code editor.' },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'Creative', website: 'elevenlabs.io', description: 'AI voice and sound.' },
  { id: 'claude', name: 'Claude', category: 'Productivity', website: 'anthropic.com', description: 'Fastest and smartest conversational AI.' },
  { id: 'midjourney', name: 'Midjourney', category: 'Creative', website: 'midjourney.com', description: 'Photorealistic AI art generator.' },
  { id: 'bolt', name: 'Bolt.new', category: 'Dev', website: 'bolt.new', description: 'Browser-based AI full-stack editor.' },
  { id: 'v0', name: 'v0 by Vercel', category: 'Dev', website: 'v0.dev', description: 'Generative UI components framework.' },
]

async function getHnMentionScores(tools: typeof CURATED_TOOLS): Promise<Map<string, { mentions: number; points: number }>> {
  const scores = new Map<string, { mentions: number; points: number }>()
  const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  
  await Promise.all(tools.map(async (tool) => {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(tool.name)}&tags=story&numericFilters=created_at_i%3E${since}&hitsPerPage=20&attributesToRetrieve=points`
      const res = await fetchWithTimeout(url, { next: { revalidate: 3600 } })
      if (!res.ok) return
      const data = await res.json()
      const hits: Array<{ points?: number }> = data.hits || []
      scores.set(tool.name, { mentions: hits.length, points: hits.reduce((sum, h) => sum + (h.points || 0), 0) })
    } catch {
      scores.set(tool.name, { mentions: 0, points: 0 })
    }
  }))
  return scores
}

interface DiscoveredRepo {
  name: string
  category: string
  website: string
  description: string
  stars: number
}

async function searchGithubTrending(query: string, perPage: number): Promise<DiscoveredRepo[]> {
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`
    const res = await fetchWithTimeout(url, {
      headers: { Accept: 'application/vnd.github.v3.field_only+json', 'User-Agent': 'tomatoai-trending' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const data = await res.json()
    return (data.items || []).filter((r: any) => !r.archived && !r.fork).map((r: any) => ({
        name: r.name,
        category: /\b(ide|editor)\b/i.test(`${(r.topics || []).join(' ')} ${r.description || ''}`) ? 'IDE' : 'Dev',
        website: (r.homepage?.startsWith('http') ? r.homepage : r.html_url).replace(/^https?:\/\//, '').replace(/\/$/, ''),
        description: (r.description || `${r.full_name} on GitHub.`).slice(0, 140),
        stars: r.stargazers_count as number,
    }))
  } catch {
    return []
  }
}

// Real market discovery: what AI tools/IDEs/agents are actively gaining
// traction on GitHub right now, via the public Search API (no auth needed).
async function getDiscoveredTools(): Promise<DiscoveredRepo[]> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  // 2 parallel queries (down from 3) to reduce GitHub API round-trips.
  const [agentsAndIdes, llmTools] = await Promise.all([
    searchGithubTrending(`topic:ai-agent topic:ide pushed:>${since}`, 8),
    searchGithubTrending(`topic:llm pushed:>${since}`, 7),
  ])
  const isRelevant = (repo: DiscoveredRepo) => /\b(ai|llm|gpt|agent|model|ml|assistant|copilot|neural)\b/i.test(repo.description)

  const seen = new Set<string>()
  const merged: DiscoveredRepo[] = []
  for (const repo of [...agentsAndIdes, ...llmTools]) {
    const key = repo.name.toLowerCase()
    if (seen.has(key) || CURATED_TOOLS.some((t) => t.name.toLowerCase() === key) || !isRelevant(repo)) continue
    seen.add(key)
    merged.push(repo)
  }
  return merged.sort((a, b) => b.stars - a.stars).slice(0, 10)
}

export async function getGithubTrendingRepos(limit = 30): Promise<TrendingRepo[]> {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const url = `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${Math.min(limit, 100)}`
    const res = await fetchWithTimeout(url, {
      headers: { Accept: 'application/vnd.github.v3.field_only+json', 'User-Agent': 'tomatoai-trending' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const data = await res.json()
    return (data.items || []).filter((r: any) => !r.archived && !r.fork).map((r: any) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner?.login || '',
        ownerAvatar: r.owner?.avatar_url || '',
        description: (r.description || 'No description provided.').slice(0, 160),
        url: r.html_url,
        stars: r.stargazers_count as number,
        forks: r.forks_count as number,
        language: r.language ?? null,
    }))
  } catch (e) {
    console.error('GitHub trending repos fetch error:', e)
    return []
  }
}

export async function getTrendingTools(): Promise<TrendingTool[]> {
  const [hnSignals, discovered] = await Promise.all([
    getHnMentionScores(CURATED_TOOLS),
    getDiscoveredTools(),
  ])

  const signalArr = Array.from(hnSignals.values())
  const maxPoints = Math.max(1, ...signalArr.map((s) => s.points))
  const maxMentions = Math.max(1, ...signalArr.map((s) => s.mentions))
  const hasHnSignal = signalArr.some((s) => s.mentions > 0)

  const curatedScored: TrendingTool[] = CURATED_TOOLS.map((tool) => {
    const { mentions, points } = hnSignals.get(tool.name) || { mentions: 0, points: 0 }
    if (hasHnSignal) {
      return { ...tool, rank: 0, trendScore: Math.round(60 + (points / maxPoints) * 39), utilityScore: Math.round(60 + (mentions / maxMentions) * 39), growth: mentions > 0 ? `${mentions} HN mentions` : 'No recent HN activity', graphData: Array.from({ length: 7 }, (_, d) => Math.max(10, Math.round((points / (d + 2)) % 100))), mentions }
    }
    return { ...tool, rank: 0, trendScore: 50, utilityScore: 50, growth: 'N/A', graphData: Array.from({ length: 7 }, () => 50), mentions: 0 }
  })

  const maxStars = Math.max(1, ...discovered.map((r) => r.stars))
  const discoveredScored: TrendingTool[] = discovered.map((repo) => ({
    id: `gh-${repo.name.toLowerCase()}`,
    name: repo.name,
    category: repo.category,
    website: repo.website,
    description: repo.description,
    rank: 0,
    trendScore: Math.round(55 + (repo.stars / maxStars) * 40),
    utilityScore: Math.round(55 + (repo.stars / maxStars) * 40),
    growth: `★ ${repo.stars.toLocaleString('en-US')} stars`,
    graphData: Array.from({ length: 7 }, (_, d) => Math.max(10, Math.round((repo.stars / maxStars) * 100 - d * 5))),
    mentions: 0,
  }))

  return [...curatedScored, ...discoveredScored]
    .sort((a, b) => b.trendScore - a.trendScore)
    .map((tool, index) => ({ ...tool, rank: index + 1 }))
}
