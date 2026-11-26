import { ImageResponse } from 'next/og'

import { DAILY_TOOLS, getDailyTool } from '@/lib/daily-tools/registry'
import { SITE_URL } from '@/metadata-utils'

/**
 * The picture shown when a tool is shared on WhatsApp, LinkedIn, X, Slack or in search results: a 1200 x 630 card in the
 * tool's own colour with its name and promise. Made at build time for every tool, at a stable address
 * (/og/tools/<slug>) that the page metadata, the schema and the sitemap all point to.
 */

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return DAILY_TOOLS.map((t) => ({ slug: t.slug }))
}

function darken(hex: string, amount: number): string {
  const n = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#f97316'
  const c = (i: number) => Math.round(parseInt(n.slice(i, i + 2), 16) * (1 - amount)).toString(16).padStart(2, '0')
  return `#${c(1)}${c(3)}${c(5)}`
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const tool = getDailyTool((await params).slug)
  if (!tool) return new Response('Not found', { status: 404 })
  const name = tool.name
  const badge = tool.kind === 'ai' ? 'Free AI tool' : tool.kind === 'online' ? 'Free, no sign-in' : 'Free, runs in your browser'
  const initials = name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const host = new URL(SITE_URL).host

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, position: 'relative', overflow: 'hidden', background: darken(tool.color, 0.42), color: 'white' }}>
        {/* Flat shapes, not a gradient: a gradient makes the PNG four times bigger and chat apps then refuse to show it. */}
        <div style={{ position: 'absolute', display: 'flex', right: -140, top: -160, width: 640, height: 640, borderRadius: 320, background: tool.color, opacity: 0.55 }} />
        <div style={{ position: 'absolute', display: 'flex', right: 120, bottom: -260, width: 420, height: 420, borderRadius: 210, background: tool.color, opacity: 0.3 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', padding: '12px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', fontSize: 30, fontWeight: 600 }}>{badge}</div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, opacity: 0.9 }}>TomatoAi · Daily Tools</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 170, height: 170, borderRadius: 44, background: 'rgba(255,255,255,0.2)', fontSize: 84, fontWeight: 800, marginRight: 52 }}>{initials}</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: name.length > 26 ? 62 : 76, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
            <div style={{ display: 'flex', marginTop: 22, fontSize: 36, lineHeight: 1.25, opacity: 0.92 }}>{tool.tagline}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 30, opacity: 0.9 }}>
          <div style={{ display: 'flex' }}>{host}/tools</div>
          <div style={{ display: 'flex' }}>{tool.kind === 'ai' ? 'Free account · Made for India' : 'No sign-up · Made for India'}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
