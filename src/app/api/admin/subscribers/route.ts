import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { withStore } from '@/lib/growth';

export const runtime = 'nodejs';

/** Spreadsheet programs run cells that start with = + - @ as formulas. Emails come from the public, so neutralise them. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Admin only. `?format=csv` downloads the active subscribers; the default is JSON. */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const subscribers = await withStore((store) => store.subscribers());
  if (!subscribers) return NextResponse.json({ success: false, error: 'Subscriber storage is not available.' }, { status: 503 });

  if (new URL(req.url).searchParams.get('format') === 'csv') {
    const lines = ['email,source,subscribed_at', ...subscribers.map((s) => [csvCell(s.email), csvCell(s.source ?? ''), csvCell(s.createdAt)].join(','))];
    return new Response(lines.join('\r\n') + '\r\n', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="subscribers.csv"', 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.json({ success: true, count: subscribers.length, subscribers }, { headers: { 'Cache-Control': 'no-store' } });
}
