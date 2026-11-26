// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { searchQuery } from '@/lib/search'
import { readJsonLimited } from '@/lib/security/body'

export const runtime = 'edge'

export async function POST(req: Request) {
  const read = await readJsonLimited<{ query?: unknown }>(req, 4 * 1024)
  if (!read.ok) return NextResponse.json({ error: read.error }, { status: read.status })
  const query = typeof read.data?.query === 'string' ? read.data.query.trim().slice(0, 300) : ''
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  const data = await searchQuery(query)
  return NextResponse.json(data)
}
