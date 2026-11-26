import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeReferralCode, REFERRAL } from '@/lib/growth/config';
import ReferralLanding from './ReferralLanding';

// Invite links are personal: keep them out of search results, but give them a good preview when shared.
export const metadata: Metadata = {
  title: `You're invited to TomatoAI: ${REFERRAL.refereeBonus} bonus credits`,
  description: `Chat with PDFs and images, use 400+ AI tools, and get ${REFERRAL.refereeBonus} bonus credits when you join with this invite.`,
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalized = normalizeReferralCode(code);
  if (!normalized) notFound();
  return <ReferralLanding code={normalized} bonus={REFERRAL.refereeBonus} />;
}
