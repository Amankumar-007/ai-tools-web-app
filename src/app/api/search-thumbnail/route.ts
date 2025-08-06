// app/api/search-thumbnail/route.ts

import { NextResponse } from 'next/server'
import { searchThumbnails } from '@/lib/searchImages'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const results = await searchThumbnails(query)
    return NextResponse.json(results)
  } catch (err) {
    console.error('Thumbnail error:', err)
    return NextResponse.json({ error: 'Failed to search images' }, { status: 500 })
  }
}
