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

    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Check if user already has a Stripe customer ID
    let customerId = null;

    // Try to find existing customer by email
    if (userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail || `user-${userId}@example.com`,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session with a simple one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Tools Access',
              description: 'Access to all AI tools for one month',
            },
            unit_amount: 999, // $9.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment instead of subscription
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/ai-tools`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 