import { NextResponse, NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// ─── Rate-Limit Store (in-memory, per worker) ──────────────────────────
// Next.js middleware runs in the Edge Runtime, so we keep a simple Map.
// For production at scale, swap this with a Redis-based solution.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 40;  // max per window per IP

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  let timestamps = rateLimitMap.get(ip) || [];
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    rateLimitMap.set(ip, timestamps);
    return { limited: true, retryAfter };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return { limited: false, retryAfter: 0 };
}

// Periodically clear stale IPs (every 5 min)
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  for (const [key, ts] of rateLimitMap) {
    if (ts.every(t => t < cutoff)) rateLimitMap.delete(key);
  }
}

// Routes that do NOT require authentication
const PUBLIC_API_ROUTES = [
  "/api/search-thumbnail",
  "/api/ai-search",
  "/api/category-tools",
  "/api/analyze-tools",
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient({ req, res });

  // ─── Rate Limiting (all /api/* routes) ──────────────────────────
  if (pathname.startsWith("/api/")) {
    cleanupStaleEntries();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { limited, retryAfter } = isRateLimited(ip);
    if (limited) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // ─── Auth Check (protected /api/* routes only) ──────────────
    if (!isPublicApiRoute(pathname)) {
      // Extract token from Authorization header or cookies
      const authHeader = req.headers.get("authorization");
      let token: string | undefined;

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }

      if (!token) {
        // Try common Supabase cookie names
        token =
          req.cookies.get("sb-access-token")?.value ||
          req.cookies.get("sb-lsvporilyjyufxfmxcoy-auth-token")?.value;
      }

      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verify with Supabase
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser(token);

        if (!user) {
          return new NextResponse(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ error: "Authentication failed" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // ─── Paid-content gate (existing logic) ──────────────────────────
  if (pathname === "/locked-page") {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

    const { data } = await supabase
      .from("users")
      .select("has_paid")
      .eq("id", session.user.id)
      .single();

    if (!data?.has_paid) {
      return NextResponse.redirect(new URL("/checkout", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*", "/locked-page"],
};

