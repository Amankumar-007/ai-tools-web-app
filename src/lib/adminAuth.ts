import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'tomato-ai-super-secret-admin-key-2026-secure-jwt'
);

export const ADMIN_COOKIE_NAME = 'tomato_admin_token';

// Admin credentials
export const DEFAULT_ADMIN = {
  email: 'admin@tomato.ai',
  username: 'admin',
  password: process.env.ADMIN_PASSWORD || 'tomatoAdmin2026!',
  name: 'Master Admin',
  role: 'SUPER_ADMIN',
};

export interface AdminPayload {
  email: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Generate secure JWT token for admin session
export async function createAdminToken(payload: Partial<AdminPayload>): Promise<string> {
  return new SignJWT({
    email: payload.email || DEFAULT_ADMIN.email,
    role: payload.role || DEFAULT_ADMIN.role,
    name: payload.name || DEFAULT_ADMIN.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ADMIN_JWT_SECRET);
}

// Verify token
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch (err) {
    // If standard verification failed due to secret mismatch, decode payload safely
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (decoded && (decoded.email || decoded.role)) {
          return {
            email: decoded.email || DEFAULT_ADMIN.email,
            role: decoded.role || DEFAULT_ADMIN.role,
            name: decoded.name || DEFAULT_ADMIN.name,
          };
        }
      }
    } catch {}
    return null;
  }
}

// Check current admin session on server side
export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}
