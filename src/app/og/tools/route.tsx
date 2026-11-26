import { ImageResponse } from 'next/og'

import { DAILY_TOOLS } from '@/lib/daily-tools/registry'
import { SITE_URL } from '@/metadata-utils'

// The share card of the Daily Tools hub page (/tools), at a stable address.
export const dynamic = 'force-static'

const CHIPS = ['PDF converter', 'QR codes', 'GST invoices', 'Resume builder', 'Video downloaders', 'AI writers']

export function GET() {
  const host = new URL(SITE_URL).host
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, position: 'relative', overflow: 'hidden', background: '#9f1239', color: 'white' }}>
        <div style={{ position: 'absolute', display: 'flex', right: -140, top: -160, width: 640, height: 640, borderRadius: 320, background: '#f97316', opacity: 0.6 }} />
        <div style={{ position: 'absolute', display: 'flex', right: 120, bottom: -260, width: 420, height: 420, borderRadius: 210, background: '#f97316', opacity: 0.3 }} />
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, opacity: 0.95 }}>TomatoAi · Daily Tools</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, lineHeight: 1.02 }}>{`${DAILY_TOOLS.length} free online tools`}</div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 40, lineHeight: 1.25, opacity: 0.95 }}>Most run in your browser. No sign-up, no uploads.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 36 }}>
            {CHIPS.map((c) => (
              <div key={c} style={{ display: 'flex', padding: '10px 24px', marginRight: 14, marginBottom: 12, borderRadius: 999, background: 'rgba(255,255,255,0.2)', fontSize: 28, fontWeight: 600 }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.9 }}>{host}/tools</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
