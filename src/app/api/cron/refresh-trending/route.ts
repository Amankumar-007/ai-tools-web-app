import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

// Triggered daily by Vercel Cron (see vercel.json) to force a fresh fetch of
// trending news/tools regardless of traffic, on top of the hourly ISR ceiling.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    revalidatePath('/trending')
    return NextResponse.json({ revalidated: true, path: '/trending', at: new Date().toISOString() })
  } catch (error) {
    console.error('Failed to revalidate /trending:', error)
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
