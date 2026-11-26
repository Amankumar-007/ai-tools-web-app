import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  adminAllowlist,
  adminCookieName,
  adminEmail,
  adminLoginConfigured,
  checkAdminPassword,
  createAdminToken,
  sessionCookieOptions,
} from '@/lib/adminAuth';
import { readJsonLimited } from '@/lib/security/body';
import { clientIp } from '@/lib/security/ip';
import { hit } from '@/lib/security/ratelimit';

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store' };
// Deliberately identical for "no such account" and "wrong password".
const INVALID = { success: false, error: 'Invalid credentials.' };

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export async function POST(request: Request) {
  if (!adminLoginConfigured()) {
    console.error('[security] Admin sign-in attempted but ADMIN_EMAIL / ADMIN_PASSWORD_HASH / ADMIN_JWT_SECRET are not set.');
    return NextResponse.json({ success: false, error: 'Admin sign-in is not configured.' }, { status: 503, headers: NO_STORE });
  }

  const parsed = await readJsonLimited<{ identifier?: unknown; email?: unknown; username?: unknown; password?: unknown }>(request, 4 * 1024);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: parsed.status, headers: NO_STORE });

  const body = parsed.data && typeof parsed.data === 'object' ? parsed.data : {};
  const identifier = String(body.identifier ?? body.email ?? body.username ?? '').trim().toLowerCase().slice(0, 254);
  const password = typeof body.password === 'string' ? body.password.slice(0, 256) : '';
  if (!identifier || !password) {
    return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400, headers: NO_STORE });
  }

  // Two more limits on top of the per-IP one in the middleware:
  //  - per account AND IP: 8 tries/hour, so someone hammering the admin's email from their own address
  //    cannot lock the real admin out of theirs;
  //  - per account overall: 60 tries/hour, which caps a botnet spreading guesses over many IPs (and is
  //    far too few guesses to matter against the 12+ character password the setup script enforces).
  const accountKey = await sha256Hex(identifier);
  const ip = clientIp(request.headers);
  for (const [key, limit] of [[`admin-login:acct-ip:${accountKey}:${ip}`, 8], [`admin-login:acct:${accountKey}`, 60]] as const) {
    const result = await hit(key, limit, 60 * 60);
    if (!result.ok) {
      console.warn('[security] admin login throttled for an account (too many attempts)');
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.', retryAfterSeconds: result.retryAfter },
        { status: 429, headers: { ...NO_STORE, 'Retry-After': String(result.retryAfter) } }
      );
    }
  }

  let admin: { email: string; name: string; role: string } | null = null;

  if (await checkAdminPassword(identifier, password)) {
    admin = { email: adminEmail(), name: 'Administrator', role: 'SUPER_ADMIN' };
  } else if (adminAllowlist().includes(identifier)) {
    // Optional: named Supabase accounts, but only ones explicitly listed in ADMIN_EMAILS.
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', { auth: { persistSession: false } });
      const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      if (!error && data?.user?.email?.toLowerCase() === identifier) {
        admin = { email: identifier, name: 'Administrator', role: 'admin' };
      }
    } catch {
      // Treated as a failed sign-in.
    }
  }

  if (!admin) {
    console.warn(`[security] failed admin login from ${ip}`);
    return NextResponse.json(INVALID, { status: 401, headers: NO_STORE });
  }

  const token = await createAdminToken(admin);
  // The session lives only in an HttpOnly cookie: the token is never returned to page JavaScript.
  const response = NextResponse.json({ success: true, user: admin }, { headers: NO_STORE });
  response.cookies.set({ name: adminCookieName(), value: token, ...sessionCookieOptions() });
  return response;
}
