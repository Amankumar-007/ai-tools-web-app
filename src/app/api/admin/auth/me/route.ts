import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ authenticated: true, user: session }, { headers: { 'Cache-Control': 'no-store' } });
}
