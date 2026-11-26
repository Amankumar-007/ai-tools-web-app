import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'

// Triggered daily by Vercel Cron (see vercel.json) to force a fresh fetch of
// trending news/tools regardless of traffic, on top of the hourly ISR ceiling.
export async function GET(req: NextRequest) {
  // Fails closed: without CRON_SECRET nobody can trigger this, rather than everybody.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  const provided = Buffer.from(req.headers.get('authorization') || '')
  const expected = Buffer.from(`Bearer ${cronSecret}`)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    revalidatePath('/trending')
    return NextResponse.json({ revalidated: true, path: '/trending', at: new Date().toISOString() })
  } catch (error) {
    console.error('Failed to revalidate /trending:', error)
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
