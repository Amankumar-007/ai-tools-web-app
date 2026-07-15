import fs from 'fs'
import path from 'path'

export interface DirectoryTool {
  id: number
  slug: string
  name: string
  category: string
  website: string
  pricing: string
  description: string
  features: string[]
}

let cache: DirectoryTool[] | null = null

// Reads the same dataset the /ai-tools listing page fetches client-side
// (public/data/ai-tools.json), so tool detail pages and the sitemap stay
// in sync with what's actually shown in the directory.
export function getAllTools(): DirectoryTool[] {
  if (cache) return cache
  const filePath = path.join(process.cwd(), 'public', 'data', 'ai-tools.json')
  const raw = fs.readFileSync(filePath, 'utf8')
  cache = JSON.parse(raw) as DirectoryTool[]
  return cache
}

export function getToolBySlug(slug: string): DirectoryTool | undefined {
  return getAllTools().find((tool) => tool.slug === slug)
}
