/**
 * GET /api/leads?tenantId=<uuid>
 * Returns all leads for an agent.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { verifyAgentOwnership, DEMO_AGENT } from '@/lib/auth-tenant';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 422 });
  }

  // Verify ownership (demo agent is publicly accessible)
  if (tenantId !== DEMO_AGENT) {
    const { isOwner } = await verifyAgentOwnership(request, tenantId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .select('id, payload, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
