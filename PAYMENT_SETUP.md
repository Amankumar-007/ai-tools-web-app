# Payment Gateway Setup Guide

This guide will help you set up the payment gateway and subscription system for your AI tools platform.

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (Create these in your Stripe dashboard)
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id_here
STRIPE_PREMIUM_PRICE_ID=price_your_premium_plan_price_id_here
```

## Setup Steps

### 1. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from the API settings
3. Create a `subscriptions` table in your Supabase database:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  price_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Create two subscription products in Stripe:
   - **Pro Plan**: $9.99/month
   - **Premium Plan**: $19.99/month
4. Copy the price IDs for each plan
5. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
6. Copy the webhook signing secret

### 3. Database Schema

The system uses Supabase's built-in auth system and stores subscription data in user metadata. The main subscription data is stored in the `subscriptions` table.

### 4. Testing

1. Use Stripe's test mode for development
2. Test the complete flow:
   - User registration/login
   - Subscription purchase
   - Webhook processing
   - Access control to AI tools

## Features Implemented

- ✅ User authentication with Supabase
- ✅ Subscription management with Stripe
- ✅ Tier-based access control (FREE, PRO, PREMIUM)
- ✅ Webhook handling for subscription events
- ✅ Protected AI tools page
- ✅ Pricing page with subscription options
- ✅ Success page after payment
- ✅ Subscription status checking

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/route.ts
│   │   ├── create-portal-session/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── pricing/page.tsx
│   ├── success/page.tsx
│   └── (routes)/ai-tools/page.tsx
├── components/
│   ├── ProtectedAITools.tsx
│   ├── SubscriptionGuard.tsx
│   └── ProtectedRoute.tsx
└── lib/
    ├── stripe.ts
    └── supabase.ts
```

## Troubleshooting

1. **Webhook not working**: Check the webhook URL and secret
2. **Subscription not updating**: Verify the webhook events are being received
3. **User not found**: Ensure Supabase auth is properly configured
4. **Price ID errors**: Verify the Stripe price IDs are correct

## Security Notes

- Never commit your `.env.local` file
- Use environment variables for all sensitive data
- Test thoroughly in Stripe's test mode before going live
- Implement proper error handling and logging 