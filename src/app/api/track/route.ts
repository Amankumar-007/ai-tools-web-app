import { NextResponse } from 'next/server';
import { recordLiveVisitor } from '@/lib/visitorTracker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, userEmail } = body;
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
            || request.headers.get('x-real-ip') 
            || '127.0.0.1';
            
    const userAgent = request.headers.get('user-agent') || '';
    
    recordLiveVisitor(ip, path || '/', userAgent, userEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
