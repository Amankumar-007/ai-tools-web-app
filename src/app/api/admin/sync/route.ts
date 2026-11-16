import { NextResponse } from 'next/server';
import { syncAllLocalToolsToSupabase } from '@/services/aiToolsDb';

export async function POST() {
  try {
    const result = await syncAllLocalToolsToSupabase();
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.count} tools into Supabase database!`,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
