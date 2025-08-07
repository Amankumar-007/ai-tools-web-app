import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check all environment variables
    const envData = {
      stripePublishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
      stripeSecret: process.env.STRIPE_SECRET_KEY ? 'SET' : null,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : null,
    };

    console.log('Environment Debug Data:', {
      ...envData,
      stripeSecret: envData.stripeSecret ? 'SET (hidden)' : null,
      webhookSecret: envData.webhookSecret ? 'SET (hidden)' : null,
      supabaseAnon: envData.supabaseAnon ? 'SET (hidden)' : null,
    });

    return NextResponse.json(envData);
  } catch (error) {
    console.error('Error in debug-env:', error);
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
} 