import { NextResponse, NextRequest } from "next/server";
import { clientIp } from "@/lib/security/ip";
import { checkSameOrigin } from "@/lib/security/origin";
import { ADMIN_LOGIN_PATH, floodWindow, globalAiDailyCap, policyFor } from "@/lib/security/policies";
import { hit, type RateResult } from "@/lib/security/ratelimit";
import { adminCookieName, verifyAdminJwt } from "@/lib/security/admin-session";
import { bearerToken, verifyUserToken } from "@/lib/security/user-auth";
import { planLimits } from "@/lib/billing/plans";

/**
 * Every /api request passes through here, in this order:
 *   1. path normalised (so `/api/%61dmin/…` cannot dodge a rule)
 *   2. per-IP flood limit
 *   3. same-origin check for anything that changes state
 *   4. request-size limit
 *   5. admin gate for /api/admin/*
 *   6. sign-in check for routes that require it
 *   7. per-route rate limits (per user when signed in, per IP otherwise) + site-wide AI budget
 * Identity headers (`x-tomato-*`) are always overwritten here, so route handlers can trust them.
 */

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function json(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) {
  return new NextResponse(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function log(event: string, details: Record<string, unknown>) {
  console.warn(`[security] ${JSON.stringify({ event, ...details })}`);
}

function tooMany(result: RateResult, message = "Too many requests. Please slow down.") {
  return json(429, { error: message, retryAfterSeconds: result.retryAfter }, {
    "Retry-After": String(result.retryAfter),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": "0",
  });
}

function safeDecode(pathname: string): string | null {
  try {
    const decoded = decodeURIComponent(pathname);
    // Encoded slashes / backslashes / control characters have no business in our routes.
    if (/[\\\u0000-\u001f]/.test(decoded) || decoded.includes("//")) return null;
    return decoded;
  } catch {
    return null;
  }
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function handleApi(req: NextRequest, path: string): Promise<NextResponse> {
  const ip = clientIp(req.headers);
  const method = req.method;

  // 2. Flood guard: one cheap check before any heavier work.
  const flood = floodWindow();
  const floodResult = await hit(`rl:flood:${ip}`, flood.limit, flood.seconds);
  if (!floodResult.ok) {
    if (floodResult.count === floodResult.limit + 1) log("flood", { ip, path });
    return tooMany(floodResult);
  }

  const policy = policyFor(path);
  // Cron and Razorpay's webhook are called server-to-server (no browser), so the browser Origin check cannot apply.
  // The webhook proves itself with Razorpay's signature; cron with its secret.
  const isCron = path.startsWith("/api/cron/") || path === "/api/razorpay/webhook";

  // 3. Same-origin: state-changing requests must come from our own pages.
  if (!isCron && MUTATING.has(method)) {
    const verdict = checkSameOrigin(req.headers, req.headers.get("host"));
    if (!verdict.ok) {
      log("origin-rejected", { ip, path, reason: verdict.reason });
      return json(403, { error: "Forbidden." });
    }
  } else if (path.startsWith("/api/admin/") && req.headers.get("sec-fetch-site") === "cross-site") {
    return json(403, { error: "Forbidden." });
  }

  // 4. Size: reject early on the declared length, and refuse bodies of unknown length.
  if (MUTATING.has(method)) {
    const declared = req.headers.get("content-length");
    if (declared !== null) {
      const bytes = Number(declared);
      if (!Number.isFinite(bytes) || bytes < 0) return json(400, { error: "Bad request." });
      if (bytes > policy.maxBody) return json(413, { error: "Request is too large." });
    } else if ((req.headers.get("transfer-encoding") || "").toLowerCase().includes("chunked")) {
      return json(411, { error: "A Content-Length header is required." });
    }
  }

  // 5. Admin APIs need a valid admin session (login and logout excepted).
  const isAdminApi = path.startsWith("/api/admin/");
  if (isAdminApi && path !== ADMIN_LOGIN_PATH && path !== "/api/admin/auth/logout") {
    const admin = await verifyAdminJwt(req.cookies.get(adminCookieName())?.value);
    if (!admin) {
      log("admin-denied", { ip, path });
      return json(401, { success: false, error: "Unauthorized" });
    }
  }

  // 6. Who is calling? Invalid tokens count as anonymous; protected routes then answer 401.
  const token = bearerToken(req.headers) || req.cookies.get("sb-access-token")?.value || null;
  const user = token && !isAdminApi ? await verifyUserToken(token) : null;
  if (!policy.public && !user) {
    return json(401, { error: token ? "Invalid or expired token" : "Authentication required" });
  }

  // 7. Rate limits for this kind of route.
  const identity = user ? `u:${user.uid}` : `ip:${ip}`;
  // Paid plans get proportionally higher request limits (these sit above the daily plan quotas, which are
  // enforced separately and exactly in the route handlers).
  const boost = user ? planLimits(user.plan).burstMultiplier : 1;
  for (const window of user ? policy.user : policy.anon) {
    const result = await hit(`rl:${policy.id}:${identity}:${window.seconds}`, window.limit * boost, window.seconds);
    if (!result.ok) {
      if (result.count === result.limit + 1) log("rate-limited", { policy: policy.id, who: user ? "user" : "ip", ip, path });
      return tooMany(result);
    }
  }
  if (policy.ai) {
    const cap = globalAiDailyCap();
    const global = await hit("rl:global-ai:86400", cap, 86_400);
    if (!global.ok) {
      log("ai-budget-exhausted", { cap });
      return json(503, { error: "The AI service is at capacity right now. Please try again later." }, { "Retry-After": String(global.retryAfter) });
    }
  }

  // Forward the request with trusted identity headers (never the client's own).
  const headers = new Headers(req.headers);
  for (const name of [...headers.keys()]) if (name.toLowerCase().startsWith("x-tomato-")) headers.delete(name);
  headers.set("x-tomato-ip", ip);
  if (user) {
    headers.set("x-tomato-uid", user.uid);
    headers.set("x-tomato-plan", user.plan);
    if (user.planEnd) headers.set("x-tomato-plan-end", String(user.planEnd));
  }

  const response = NextResponse.next({ request: { headers } });
  if (method !== "GET" || isAdminApi) response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function middleware(req: NextRequest) {
  try {
    const rawPath = req.nextUrl.pathname;
    const path = safeDecode(rawPath);
    if (path === null) return json(400, { error: "Bad request." });

    // Admin pages: the dashboard HTML is not served without a valid admin session.
    if (path === "/admin" || path.startsWith("/admin/")) {
      if (path.startsWith("/admin/auth/login")) {
        const res = NextResponse.next();
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      const admin = await verifyAdminJwt(req.cookies.get(adminCookieName())?.value);
      if (!admin) {
        const login = new URL("/admin/auth/login", req.url);
        if (/^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(path) && path !== "/admin") login.searchParams.set("redirect", path);
        return NextResponse.redirect(login);
      }
      const res = NextResponse.next();
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    if (path.startsWith("/api/")) return await handleApi(req, path);

    // ─── Paid-content gate (existing behaviour) ──────────────────────────
    if (path === "/locked-page") {
      const res = NextResponse.next();
      const { createMiddlewareClient } = await import("@supabase/auth-helpers-nextjs");
      const supabase = createMiddlewareClient({ req, res });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));
      const { data } = await supabase.from("users").select("has_paid").eq("id", session.user.id).single();
      if (!data?.has_paid) return NextResponse.redirect(new URL("/checkout", req.url));
      return res;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Unhandled Edge Middleware Error:", error);
    if (req.nextUrl.pathname.startsWith("/api/")) return json(500, { error: "Internal Server Error" });
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/admin", "/locked-page"],
};
