import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession, DEFAULT_ADMIN } from '@/lib/adminAuth';
import { getAiToolsFromDb } from '@/services/aiToolsDb';
import AdminDashboardClient from './AdminDashboardClient';
import { createPageMetadata } from '@/metadata-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Master Admin Dashboard | Tomato AI',
  description: 'Manage tools, live visitor sessions, users, database sync, and platform security.',
  path: '/admin/dashboard',
});

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
        email: session.email || DEFAULT_ADMIN.email,
        name: session.name || DEFAULT_ADMIN.name,
        role: session.role || DEFAULT_ADMIN.role,
      }}
    />
  );
}
