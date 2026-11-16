import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import AdminLoginClient from './AdminLoginClient';
import { createPageMetadata } from '@/metadata-utils';

export const metadata: Metadata = createPageMetadata({
  title: 'Admin Authentication Gateway | Tomato AI',
  description: 'Secure admin authentication gateway for managing Tomato AI tools, categories, users, and platform analytics.',
  path: '/admin/auth/login',
});

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070913] flex items-center justify-center text-white text-xs">Loading Security Gateway...</div>}>
      <AdminLoginClient />
    </Suspense>
  );
}
