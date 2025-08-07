import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set up your environment variables.' },
        { status: 500 }
      );
    }

    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing customerId' },
        { status: 400 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 