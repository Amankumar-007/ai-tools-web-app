// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { searchQuery } from '@/lib/search'

export async function POST(req: Request) {
  const { query } = await req.json()
  const data = await searchQuery(query)
  return NextResponse.json(data)
}
