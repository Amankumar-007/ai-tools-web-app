import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase as anonClient } from '@/lib/supabase';

let serviceClient: SupabaseClient | null = null;

/**
 * Database client for admin writes.
 *
 * With SUPABASE_SERVICE_ROLE_KEY set this is a service-role client: it bypasses row-level security,
 * so the table can be locked down to read-only for browsers (see supabase-hardening.sql). The key
 * exists only on the server and is never sent to a browser.
 * Without it, falls back to the public client so existing setups keep working.
 */
export function getAdminDb(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!key || !url) return anonClient;
  serviceClient ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return serviceClient;
}
