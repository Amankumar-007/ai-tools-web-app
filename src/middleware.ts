import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: any) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data } = await supabase
    .from("users")
    .select("has_paid")
    .eq("id", user.id)
    .single();

  if (!data?.has_paid) {
    return NextResponse.redirect(new URL("/checkout", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/locked-page"],
};
