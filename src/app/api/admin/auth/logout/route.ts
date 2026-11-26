import { NextResponse } from 'next/server';
import { adminCookieName, sessionCookieOptions } from '@/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set({ name: adminCookieName(), value: '', ...sessionCookieOptions(), maxAge: 0, expires: new Date(0) });
  return response;
}
