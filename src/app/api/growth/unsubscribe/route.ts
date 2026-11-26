import { withStore } from '@/lib/growth';

export const runtime = 'nodejs';

const page = (message: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title>` +
    `<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;text-align:center"><h1 style="font-size:1.4rem">${message}</h1><p><a href="/">Back to TomatoAI</a></p></body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );

/** One-click unsubscribe link for emails. The token is a long random secret per subscriber. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') || '';
  if (!/^[a-z0-9]{16,64}$/i.test(token)) return page('This unsubscribe link is not valid.', 400);
  const done = await withStore((store) => store.unsubscribe(token));
  if (done === null) return page('Please try again in a little while.', 503);
  return page(done ? "You've been unsubscribed. Sorry to see you go." : 'You are already unsubscribed.');
}
