/**
 * Admin session tokens (Edge-safe). Strict by design:
 *  - signed with ADMIN_JWT_SECRET, which must be set and at least 32 characters;
 *    there is no built-in default and no "decode without verifying" fallback;
 *  - issuer, audience and algorithm are all pinned;
 *  - short lifetime.
 * If the secret is missing, nothing verifies and the admin area stays locked.
 */

import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_ISSUER = 'tomato-ai';
export const ADMIN_AUDIENCE = 'tomato-admin';
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

export interface AdminPayload {
  email: string;
  role: string;
  name: string;
}

/** `__Host-` pins the cookie to this exact host over HTTPS (no Domain, Path=/, Secure). */
export function adminCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-tomato_admin' : 'tomato_admin';
}

function secretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  return secret && secret.length >= 32 ? new TextEncoder().encode(secret) : null;
}

export function adminAuthConfigured(): boolean {
  return secretKey() !== null;
}

export async function signAdminJwt(payload: AdminPayload): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error('ADMIN_JWT_SECRET is not configured');
  return new SignJWT({ email: payload.email, role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ADMIN_ISSUER)
    .setAudience(ADMIN_AUDIENCE)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(key);
}

export async function verifyAdminJwt(token: string | undefined | null): Promise<AdminPayload | null> {
  const key = secretKey();
  if (!key || !token || token.length > 2048) return null;
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ADMIN_ISSUER, audience: ADMIN_AUDIENCE, algorithms: ['HS256'] });
    if (typeof payload.email !== 'string' || typeof payload.role !== 'string') return null;
    return { email: payload.email, role: payload.role, name: typeof payload.name === 'string' ? payload.name : 'Administrator' };
  } catch {
    return null;
  }
}
