import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/adminAuth';
import { getAiToolsFromDb } from '@/services/aiToolsDb';
import AdminDashboardClient from './AdminDashboardClient';
import { createPageMetadata } from '@/metadata-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Master Admin Dashboard | Tomato AI',
    description: 'Manage tools, live visitor sessions, users, database sync, and platform security.',
    path: '/admin/dashboard',
  }),
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  // Enforce server-side security redirection
  if (!session) {
    redirect('/admin/auth/login?redirect=/admin/dashboard');
  }

  const tools = await getAiToolsFromDb();

  return (
    <AdminDashboardClient
      initialTools={tools}
      adminUser={{
        email: session.email,
        name: session.name,
        role: session.role,
      }}
    />
  );
}
