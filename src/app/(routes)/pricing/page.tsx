import {
  billingCurrency,
  planFeatures,
  planPrice,
  PLAN_NAMES,
  type PaidPlanId,
} from '@/lib/billing/plans';
import { billingReady } from '@/lib/billing/razorpay';
import PricingClient, { type PlanCard } from './PricingClient';

// Plans and limits come from src/lib/billing/plans.ts, the same file the quota meter and checkout use,
// so this page can only ever advertise what is actually enforced.
export const revalidate = 300;

const TAGLINES = {
  free: 'Everything you need to try TomatoAI.',
  pro: 'For daily users, students and creators.',
  premium: 'For heavy, all-day use.',
} as const;

export default function PricingPage() {
  const currency = billingCurrency();
  const plans: PlanCard[] = (['free', 'pro', 'premium'] as const).map((id) => ({
    id,
    name: PLAN_NAMES[id],
    tagline: TAGLINES[id],
    features: planFeatures(id),
    prices: id === 'free' ? undefined : { month: planPrice(id as PaidPlanId, 'month', currency), year: planPrice(id as PaidPlanId, 'year', currency) },
  }));

  return <PricingClient plans={plans} currency={currency} billingReady={billingReady()} />;
}
