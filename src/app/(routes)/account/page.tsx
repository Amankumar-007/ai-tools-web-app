import { Suspense } from 'react';
import type { Metadata } from 'next';
import AccountClient from './AccountClient';

// Personal page: never indexed.
export const metadata: Metadata = {
  title: 'Your account | TomatoAI',
  description: 'Your plan, daily usage, bonus credits, streak and invite link.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  // AccountClient reads the URL (?checkout=success), which Next requires to sit inside a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <AccountClient />
    </Suspense>
  );
}
