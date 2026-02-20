import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenantId = request.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('id, title, url, chunk_count, status, updated_at')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
