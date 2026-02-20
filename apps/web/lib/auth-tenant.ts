/**
 * Server-side and API-route tenant resolution.
 *
 * Supabase stores the auth token in a cookie named:
 *   sb-<project-ref>-auth-token
 * The value is a JSON string containing { access_token, refresh_token, … }.
 *
 * We extract the access_token, verify it with the service client, look up
 * the user's tenant via the `profiles` table, and fall back to the demo
 * tenant when auth is not configured / user is anonymous.
 */
import type { NextRequest } from 'next/server';
import { createServiceSupabaseClient } from './supabase-server';

export const DEMO_TENANT = '11111111-1111-1111-1111-111111111111';

/* ── Helpers ──────────────────────────────────────────────── */
function getProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split('.')[0]; // "abcdefgh" from "abcdefgh.supabase.co"
  } catch {
    return null;
  }
}

function parseAccessToken(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    // Cookie values may be URL-encoded
    const parsed = JSON.parse(decodeURIComponent(raw));
    return (parsed as { access_token?: string }).access_token ?? null;
  } catch {
    return null;
  }
}

async function tenantFromToken(accessToken: string): Promise<string | null> {
  try {
    const supabase = createServiceSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    return (profile?.tenant_id as string | null) ?? null;
  } catch {
    return null;
  }
}

/* ── For server components (uses next/headers) ────────────── */
export async function getTenantId(): Promise<string> {
  const ref = getProjectRef();
  if (!ref) return DEMO_TENANT;
  try {
    // Dynamically import to avoid bundling next/headers in non-RSC contexts
    const { cookies } = await import('next/headers');
    const store = await cookies();
    const raw = store.get(`sb-${ref}-auth-token`)?.value;
    const token = parseAccessToken(raw);
    if (!token) return DEMO_TENANT;
    return (await tenantFromToken(token)) ?? DEMO_TENANT;
  } catch {
    return DEMO_TENANT;
  }
}

/* ── For API route handlers (uses NextRequest.cookies) ───── */
export async function getTenantIdFromRequest(request: NextRequest): Promise<string> {
  const ref = getProjectRef();
  if (!ref) return DEMO_TENANT;
  try {
    const raw = request.cookies.get(`sb-${ref}-auth-token`)?.value;
    const token = parseAccessToken(raw);
    if (!token) return DEMO_TENANT;
    return (await tenantFromToken(token)) ?? DEMO_TENANT;
  } catch {
    return DEMO_TENANT;
  }
}

/* ── Get full user info (for /api/me) ─────────────────────── */
export async function getUserInfo(
  request: NextRequest,
): Promise<{ tenantId: string; userId: string | null; email: string | null }> {
  const ref = getProjectRef();
  if (!ref) return { tenantId: DEMO_TENANT, userId: null, email: null };
  try {
    const raw = request.cookies.get(`sb-${ref}-auth-token`)?.value;
    const token = parseAccessToken(raw);
    if (!token) return { tenantId: DEMO_TENANT, userId: null, email: null };

    const supabase = createServiceSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (!user) return { tenantId: DEMO_TENANT, userId: null, email: null };

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    return {
      tenantId: (profile?.tenant_id as string | null) ?? DEMO_TENANT,
      userId: user.id,
      email: user.email ?? null,
    };
  } catch {
    return { tenantId: DEMO_TENANT, userId: null, email: null };
  }
}
