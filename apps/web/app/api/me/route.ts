/**
 * GET /api/me
 * Returns the current user's info including their owned agents.
 * Safe to call from any client component.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo, getUserAgents, DEMO_TENANT } from '@/lib/auth-tenant';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { userId, email } = await getUserInfo(request);
  const { agents } = await getUserAgents(request);

  // For backwards compatibility, also return tenantId
  // activeAgentId is the first agent the user owns, or demo if none
  const activeAgentId = agents.length > 0 ? agents[0].id : DEMO_TENANT;

  return NextResponse.json({
    userId,
    email,
    tenantId: activeAgentId, // backwards compatibility
    activeAgentId,
    agents,
  });
}
