/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Supabase access token to API requests.
 */
import { supabase } from '@/lib/supabase-browser';

/**
 * Fetch wrapper that automatically includes the Supabase auth token.
 * Use this for all /api/* calls that require authentication.
 * Falls back to a regular fetch if no session is available.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  } catch (error) {
    console.warn('Failed to get auth session for API call:', error);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
