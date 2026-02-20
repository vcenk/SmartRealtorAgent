/**
 * GET /api/me
 * Returns the current user's tenantId + email, resolved from their Supabase
 * auth cookie. Safe to call from any client component.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth-tenant';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const info = await getUserInfo(request);
  return NextResponse.json(info);
}
