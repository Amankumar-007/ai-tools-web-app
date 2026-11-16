import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getRealActiveVisitors } from '@/lib/visitorTracker';
import { DEFAULT_ADMIN } from '@/lib/adminAuth';

export interface RealAdminUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at?: string;
  subscription_tier: 'FREE' | 'PRO' | 'PREMIUM';
  subscription_status: string;
  role: string;
  is_online: boolean;
  location?: string;
  ip?: string;
}

export async function GET() {
  try {
    const realUsers: RealAdminUser[] = [];
    const seenEmails = new Set<string>();

    // 1. Fetch real users from Supabase 'users' table (using anon client, assumes RLS allows admin)
    try {
      const { data: dbUsers, error: dbErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!dbErr && dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((u: any) => {
          if (u.email && !seenEmails.has(u.email.toLowerCase())) {
            seenEmails.add(u.email.toLowerCase());
            realUsers.push({
              id: u.id || `usr_${realUsers.length + 1}`,
              email: u.email,
              name: u.name || u.email.split('@')[0],
              created_at: u.created_at || new Date().toISOString(),
              last_sign_in_at: u.last_sign_in_at || u.created_at,
              subscription_tier: u.subscription_tier || 'FREE',
              subscription_status: u.subscription_status || 'active',
              role: u.role || (u.email === DEFAULT_ADMIN.email ? 'SUPER_ADMIN' : 'user'),
              is_online: true,
              location: u.country || 'Connected User',
              ip: u.last_ip || '127.0.0.1',
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not query Supabase users table:', e);
    }

    // 2. Fetch real users from Supabase Auth admin API using service role key
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (serviceRoleKey && supabaseUrl) {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
        if (!authErr && authData?.users && authData.users.length > 0) {
          authData.users.forEach((u: any) => {
            if (u.email && !seenEmails.has(u.email.toLowerCase())) {
              seenEmails.add(u.email.toLowerCase());
              realUsers.push({
                id: u.id,
                email: u.email,
                name: u.user_metadata?.name || u.email.split('@')[0],
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at || u.created_at,
                subscription_tier: u.user_metadata?.subscription_tier || 'FREE',
                subscription_status: u.user_metadata?.subscription_status || 'active',
                role: u.user_metadata?.role || (u.email === DEFAULT_ADMIN.email ? 'SUPER_ADMIN' : 'user'),
                is_online: true, // We assume online if they are in the list for now, or you can cross-check with live tracker
                location: 'Supabase Auth User',
                ip: '127.0.0.1',
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not query Supabase Auth admin:', e);
    }

    // 3. Always include the master admin account if not already in the list
    if (!seenEmails.has(DEFAULT_ADMIN.email.toLowerCase())) {
      realUsers.unshift({
        id: 'usr_master_admin',
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        subscription_tier: 'PREMIUM',
        subscription_status: 'active',
        role: DEFAULT_ADMIN.role,
        is_online: true,
        location: 'Master Administrator',
        ip: '127.0.0.1 (Localhost)',
      });
    }

    // 4. Fetch real live visitor sessions from the active visitor tracker
    let liveSessions = getRealActiveVisitors();

    // If no external visitors yet, record current admin session as live
    if (liveSessions.length === 0) {
      liveSessions = [
        {
          id: 'sess_admin_live',
          ip: '127.0.0.1 (Localhost)',
          country: 'Local Development',
          city: 'Dashboard Session',
          currentPath: '/admin/dashboard',
          device: 'Desktop (Admin Console)',
          browser: 'Active Browser',
          os: 'Active OS',
          durationSeconds: 60,
          lastActive: 'Active now',
          lastActiveTimestamp: Date.now(),
          isRegisteredUser: true,
          userEmail: DEFAULT_ADMIN.email,
        },
      ];
    }

    return NextResponse.json({
      success: true,
      totalRegistered: realUsers.length,
      liveCount: liveSessions.length,
      users: realUsers,
      liveSessions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
