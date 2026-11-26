import { requireAdmin } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { syncAllLocalToolsToSupabase } from '@/services/aiToolsDb';

export async function POST() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const result = await syncAllLocalToolsToSupabase(getAdminDb());
    if (result.error) {
      return NextResponse.json({ success: false, error: 'Sync failed.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.count} tools into Supabase database!`,
      count: result.count,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Sync failed.' }, { status: 500 });
  }
}
