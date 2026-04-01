/**
 * In-memory sliding window rate limiter.
 * Tracks requests per IP using a Map with automatic cleanup.
 */

interface RateLimitEntry {
  timestamps: number[];
  lastCleanup: number;
}

// Global store — persists across requests in the same server process
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function globalCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL) return;
  lastGlobalCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of rateLimitStore) {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // timestamp when the oldest request expires
  retryAfterMs: number; // ms until user can make a new request
}

// Default configs for different route types
export const RATE_LIMITS = {
  /** For AI-heavy routes (chatgpt, generate, summarize, etc.) */
  AI_ROUTES: { maxRequests: 30, windowMs: 60 * 1000 } as RateLimitConfig,
  /** For search/lightweight routes */
  SEARCH_ROUTES: { maxRequests: 60, windowMs: 60 * 1000 } as RateLimitConfig,
  /** For payment/checkout routes */
  CHECKOUT_ROUTES: { maxRequests: 10, windowMs: 60 * 1000 } as RateLimitConfig,
  /** For file upload routes */
  UPLOAD_ROUTES: { maxRequests: 15, windowMs: 60 * 1000 } as RateLimitConfig,
} as const;

/**
 * Check if a request from the given identifier is within the rate limit.
 * @param identifier - Usually the IP address or user ID
 * @param config - Rate limit configuration
 * @returns RateLimitResult with whether the request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const { maxRequests, windowMs } = config;

  // Periodic global cleanup
  globalCleanup(windowMs);

  // Get or create entry for this identifier
  let entry = rateLimitStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(identifier, entry);
  }

  // Remove timestamps outside the current window
  const windowStart = now - windowMs;
  entry.timestamps = entry.timestamps.filter(t => t > windowStart);

  // Check if within limit
  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetTime = oldestInWindow + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfterMs: resetTime - now,
    };
  }

  // Add current request timestamp
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetTime: entry.timestamps[0] + windowMs,
    retryAfterMs: 0,
  };
}

/**
 * Get the client's IP address from a Next.js request.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * Returns a 429 Too Many Requests Response with appropriate headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down.',
      retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    }
  );
}
