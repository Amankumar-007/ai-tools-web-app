/**
 * Which limits apply to which API route.
 *
 * Every number can be scaled with RL_SCALE (e.g. RL_SCALE=0.5 halves them all,
 * RL_SCALE=3 triples them) without touching code.
 */

export type Window = { limit: number; seconds: number };

export type Policy = {
  id: string;
  /** Limits for a signed-in user (keyed by user id). */
  user: Window[];
  /** Limits for an anonymous caller (keyed by IP). */
  anon: Window[];
  /** Largest request body accepted, in bytes. */
  maxBody: number;
  /** Anyone may call it (still rate limited). When false a valid user token is required. */
  public: boolean;
  /** Counts toward the site-wide daily AI budget. */
  ai?: boolean;
};

const MIN = 60;
const DAY = 86_400;
const KB = 1024;
const MB = 1024 * KB;

function scale(): number {
  const n = Number(process.env.RL_SCALE);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

const w = (limit: number, seconds: number): Window => ({ limit: Math.max(1, Math.round(limit * scale())), seconds });

/** Site-wide ceiling on AI requests per day: a hard stop on runaway spend. */
export function globalAiDailyCap(): number {
  const n = Number(process.env.AI_GLOBAL_DAILY_CAP);
  return Number.isFinite(n) && n > 0 ? n : 20_000;
}

/** Per-IP ceiling across every API route, checked before anything else. */
export function floodWindow(): Window {
  return w(300, MIN);
}

export const ADMIN_LOGIN_PATH = '/api/admin/auth/login';

const AI_ROUTES = [
  '/api/chatgpt', '/api/chat', '/api/generate', '/api/generate-prompt', '/api/summarize', '/api/roadmap',
  '/api/structure-resume', '/api/analyze-resume', '/api/optimize-resume', '/api/generate-resume',
  '/api/analyze-image', '/api/analyze-tools', '/api/text-tools',
];
const SEARCH_ROUTES = ['/api/search', '/api/search-thumbnail', '/api/category-tools', '/api/ai-search', '/api/n8n-templates'];

/** Routes callable without signing in (the rest require a valid Supabase user token). */
const PUBLIC_ROUTES = [/* read-only list of the public template files */ '/api/n8n-templates', '/api/linkedin-video', '/api/x-video', '/api/chatgpt', '/api/analyze-tools', '/api/search-thumbnail', '/api/ai-search', '/api/category-tools', '/api/admin/', '/api/cron/'];

const matches = (path: string, routes: string[]) => routes.some((r) => path === r || path.startsWith(r.endsWith('/') ? r : `${r}/`));

export function policyFor(path: string): Policy {
  const isPublic = matches(path, PUBLIC_ROUTES);

  if (path === ADMIN_LOGIN_PATH) {
    // Per IP. The route adds a second, per-account limit on top.
    return { id: 'admin-login', user: [w(5, 15 * MIN)], anon: [w(5, 15 * MIN)], maxBody: 4 * KB, public: true };
  }
  if (path.startsWith('/api/admin/')) {
    return { id: 'admin', user: [w(300, MIN)], anon: [w(300, MIN)], maxBody: 64 * KB, public: true };
  }
  if (path.startsWith('/api/cron/')) {
    return { id: 'cron', user: [w(10, MIN)], anon: [w(10, MIN)], maxBody: 1 * KB, public: true };
  }
  if (path === '/api/chatgpt') {
    return { id: 'chat', user: [w(20, MIN), w(300, DAY)], anon: [w(4, MIN), w(10, DAY)], maxBody: 4_200_000, public: true, ai: true };
  }
  if (path === '/api/linkedin-video') {
    // Public (no sign-in), so it is limited tightly per IP: each call makes one request to LinkedIn on our behalf.
    return { id: 'linkedin-video', user: [w(10, MIN), w(100, DAY)], anon: [w(4, MIN), w(25, DAY)], maxBody: 2 * KB, public: true };
  }
  if (path === '/api/x-video') {
    // Public (no sign-in), so it is limited tightly per IP: each call makes one request to X on our behalf.
    return { id: 'x-video', user: [w(10, MIN), w(100, DAY)], anon: [w(4, MIN), w(25, DAY)], maxBody: 2 * KB, public: true };
  }
  if (path === '/api/daily-tools/run') {
    // Daily Tools (AI): sign-in required so the daily quota can be metered per person. Body allows a result to be refined.
    return { id: 'daily-ai', user: [w(12, MIN), w(200, DAY)], anon: [w(3, MIN)], maxBody: 160 * KB, public: false, ai: true };
  }
  if (path === '/api/context/describe') {
    return { id: 'describe', user: [w(30, MIN), w(600, DAY)], anon: [w(30, MIN)], maxBody: 2 * MB, public: false, ai: true };
  }
  if (matches(path, ['/api/structure-resume', '/api/analyze-resume', '/api/optimize-resume', '/api/generate-resume', '/api/summarize'])) {
    return { id: 'ai-doc', user: [w(10, MIN), w(120, DAY)], anon: [w(3, MIN), w(10, DAY)], maxBody: 400 * KB, public: isPublic, ai: true };
  }
  if (matches(path, AI_ROUTES)) {
    return { id: 'ai', user: [w(15, MIN), w(200, DAY)], anon: [w(3, MIN), w(10, DAY)], maxBody: 64 * KB, public: isPublic, ai: true };
  }
  if (path === '/api/upload-image') {
    return { id: 'upload', user: [w(8, MIN), w(80, DAY)], anon: [w(2, MIN)], maxBody: 8 * MB, public: false };
  }
  if (path === '/api/razorpay/webhook') {
    // Called by Razorpay's servers (no browser, no sign-in): authenticated by its signature inside the route.
    return { id: 'razorpay-webhook', user: [w(120, MIN)], anon: [w(120, MIN)], maxBody: 256 * KB, public: true };
  }
  if (path.startsWith('/api/billing/')) {
    return { id: 'billing', user: [w(10, MIN), w(60, DAY)], anon: [w(5, MIN)], maxBody: 2 * KB, public: false };
  }
  if (path === '/api/growth/unsubscribe') {
    // Opened from a link in an email, so no sign-in; the token in the link is the secret.
    return { id: 'unsubscribe', user: [w(10, MIN)], anon: [w(10, MIN)], maxBody: 1 * KB, public: true };
  }
  if (path === '/api/growth/subscribe') {
    return { id: 'subscribe', user: [w(10, MIN)], anon: [w(5, MIN), w(20, DAY)], maxBody: 2 * KB, public: true };
  }
  if (path.startsWith('/api/growth/')) {
    return { id: 'growth', user: [w(60, MIN)], anon: [w(20, MIN)], maxBody: 2 * KB, public: false };
  }
  if (path === '/api/track') {
    // Anonymous page-view pings for the admin's live view: no sign-in, tiny body, rate limited per IP, nothing personal accepted.
    return { id: 'track', user: [w(30, MIN)], anon: [w(30, MIN)], maxBody: 2 * KB, public: true };
  }
  if (matches(path, SEARCH_ROUTES)) {
    return { id: 'search', user: [w(30, MIN), w(1000, DAY)], anon: [w(15, MIN), w(300, DAY)], maxBody: 64 * KB, public: isPublic };
  }
  return { id: 'api', user: [w(60, MIN)], anon: [w(40, MIN)], maxBody: 100 * KB, public: isPublic };
}
