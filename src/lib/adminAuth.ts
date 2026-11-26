import 'server-only';

import { scrypt, timingSafeEqual, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_SECONDS,
  adminAuthConfigured,
  adminCookieName,
  signAdminJwt,
  verifyAdminJwt,
  type AdminPayload,
} from '@/lib/security/admin-session';

export type { AdminPayload };
export { adminAuthConfigured, adminCookieName };

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;

/**
 * Admin credentials come from the environment, never from source code:
 *   ADMIN_EMAIL          the administrator's login
 *   ADMIN_PASSWORD_HASH  scrypt hash made with `node scripts/admin-setup.cjs`
 *   ADMIN_JWT_SECRET     random secret, 32+ characters, signs the session cookie
 *   ADMIN_EMAILS         optional: extra Supabase accounts allowed to sign in as admin
 */
export function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

export function adminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function adminLoginConfigured(): boolean {
  return adminAuthConfigured() && Boolean(adminEmail()) && Boolean(process.env.ADMIN_PASSWORD_HASH);
}

// A real-looking hash that never matches, so unknown accounts cost the same time as wrong passwords.
const DUMMY_HASH = `scrypt$16384$8$1$${randomBytes(16).toString('base64')}$${randomBytes(64).toString('base64')}`;

/** Verify `password` against a `scrypt$N$r$p$salt$hash` string in constant time. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const N = Number(n), R = Number(r), P = Number(p);
  if (![N, R, P].every(Number.isInteger) || N < 2 || N > 2 ** 20) return false;
  try {
    const expected = Buffer.from(hash, 'base64');
    const derived = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, { N, r: R, p: P, maxmem: 256 * 1024 * 1024 });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Check the env-configured admin. Always does the hashing work, whatever the identifier. */
export async function checkAdminPassword(identifier: string, password: string): Promise<boolean> {
  const wanted = adminEmail();
  const id = identifier.trim().toLowerCase();
  const match = Boolean(wanted) && id === wanted;
  const valid = await verifyPassword(password, match ? process.env.ADMIN_PASSWORD_HASH || DUMMY_HASH : DUMMY_HASH);
  return match && valid;
}

export async function createAdminToken(payload: AdminPayload): Promise<string> {
  return signAdminJwt(payload);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  };
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const store = await cookies();
    return await verifyAdminJwt(store.get(adminCookieName())?.value);
  } catch {
    return null;
  }
}

/**
 * Call at the top of every admin route handler. Returns a 401 response when the caller is
 * not a signed-in admin, otherwise null. The middleware checks too; this is the second lock.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (session) return null;
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
