import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
}

/**
 * Verifies the Supabase session token from the request.
 * Checks Authorization header (Bearer token) first, then falls back to cookies.
 * Returns the authenticated user or null.
 */
export async function verifyAuth(req: NextRequest): Promise<AuthResult | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try Authorization header first
    const authHeader = req.headers.get('authorization');
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // Fallback to cookie
    if (!token) {
      token = req.cookies.get('sb-access-token')?.value
        || req.cookies.get('sb-lsvporilyjyufxfmxcoy-auth-token')?.value;
    }

    if (!token) {
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Helper to return a standardized 401 response.
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Wraps an API handler with authentication.
 * If the user is not authenticated, returns 401.
 * Otherwise, calls the handler with the authenticated user.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, auth: AuthResult) => Promise<Response>
): Promise<Response> {
  const auth = await verifyAuth(req);

  if (!auth) {
    return unauthorizedResponse();
  }

  return handler(req, auth);
}
