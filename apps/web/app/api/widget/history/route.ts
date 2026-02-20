/**
 * GET /api/widget/history?tenantId=...&conversationId=...
 * Returns the last N messages for a conversation (public — verified by tenantId check).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const tenantId = searchParams.get('tenantId');
  const conversationId = searchParams.get('conversationId');

  if (!tenantId || !conversationId) {
    return NextResponse.json({ error: 'tenantId and conversationId required' }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  // Verify tenant exists
  const { data: tenant } = await supabase.from('tenants').select('id').eq('id', tenantId).single();
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('tenant_id', tenantId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? [], {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
