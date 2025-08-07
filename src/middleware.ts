import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Publicly accessible routes
  const PUBLIC_ROUTES = ["/", "/login", "/register", "/favicon.ico", "/_next", "/api"];

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return res;
  }

  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|login|register).*)"],
};