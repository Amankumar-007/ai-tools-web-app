import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSubscriptionRecord, updateSubscriptionRecord, updateUserSubscription } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('Stripe is not configured. Please set up your environment variables.');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.log('Webhook signature verification failed.', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('Received event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !stripe) return;
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
  const userId = customer.metadata.supabase_user_id;

  if (!userId) {
    console.error('No user ID found in customer metadata');
    return;
  }

  // Determine subscription tier based on price ID
  const priceId = subscription.items.data[0].price.id;
  let subscriptionTier = 'FREE';
  
  if (priceId.includes('pro') || priceId === process.env.STRIPE_PRO_PRICE_ID) {
    subscriptionTier = 'PRO';
  } else if (priceId.includes('premium') || priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    subscriptionTier = 'PREMIUM';
  }

  // Create subscription record in Supabase
  await createSubscriptionRecord({
    user_id: userId,
    stripe_customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    price_id: priceId,
    status: subscription.status,
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });

  // Update user subscription info
  await updateUserSubscription(userId, {
    subscription_tier: subscriptionTier,
    subscription_status: subscription.status,
    stripe_customer_id: customer.id,
    subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!(invoice as any).subscription || !stripe) return;
  
  const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.supabase_user_id;

  if (!userId) return;

  // Update subscription status to active
  await updateSubscriptionRecord(subscription.id, {
    status: 'active',
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });

  // Update user status
  await updateUserSubscription(userId, {
    subscription_tier: 'FREE', // Keep existing tier
    subscription_status: 'active',
    subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!stripe) return;
  
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.supabase_user_id;

  if (!userId) return;

  const priceId = subscription.items.data[0].price.id;
  let subscriptionTier = 'FREE';
  
  if (priceId.includes('pro') || priceId === process.env.STRIPE_PRO_PRICE_ID) {
    subscriptionTier = 'PRO';
  } else if (priceId.includes('premium') || priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    subscriptionTier = 'PREMIUM';
  }

  // Update subscription record
  await updateSubscriptionRecord(subscription.id, {
    status: subscription.status,
    price_id: priceId,
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });

  // Update user subscription
  await updateUserSubscription(userId, {
    subscription_tier: subscriptionTier,
    subscription_status: subscription.status,
    subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!stripe) return;
  
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  const userId = customer.metadata.supabase_user_id;

  if (!userId) return;

  // Update subscription record
  await updateSubscriptionRecord(subscription.id, {
    status: 'canceled',
  });

  // Downgrade user to free plan
  await updateUserSubscription(userId, {
    subscription_tier: 'FREE',
    subscription_status: 'canceled',
    subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });
} 