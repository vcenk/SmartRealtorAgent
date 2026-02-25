/**
 * GET /api/conversations?tenantId=<uuid>
 * Returns all conversations for a tenant as summaries (grouped by conversation_id).
 *
 * GET /api/conversations?tenantId=<uuid>&conversationId=<uuid>
 * Returns the full message thread for a single conversation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { requireTenantOwnership } from '@/lib/auth-helpers';

type MessageRow = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const conversationId = searchParams.get('conversationId');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 422 });
  }

  // Verify tenant ownership (allow demo agent for onboarding)
  const auth = await requireTenantOwnership(request, tenantId, { allowDemo: true });
  if (!auth.authorized) return auth.response;

  const supabase = createServiceSupabaseClient();

  // Single conversation: return full message list
  if (conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('tenant_id', tenantId)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  // All conversations: fetch recent messages and group client-side
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, role, content, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })
    .limit(2000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as MessageRow[];

  // Group by conversation_id
  const map = new Map<string, {
    conversationId: string;
    messageCount: number;
    firstUserMessage: string;
    lastActivity: string;
  }>();

  for (const row of rows) {
    const existing = map.get(row.conversation_id);
    if (!existing) {
      map.set(row.conversation_id, {
        conversationId: row.conversation_id,
        messageCount: 1,
        firstUserMessage: row.role === 'user' ? row.content.slice(0, 120) : '',
        lastActivity: row.created_at,
      });
    } else {
      existing.messageCount++;
      existing.lastActivity = row.created_at;
      if (!existing.firstUserMessage && row.role === 'user') {
        existing.firstUserMessage = row.content.slice(0, 120);
      }
    }
  }

  // Return sorted by last activity desc
  const conversations = [...map.values()].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  );

  return NextResponse.json(conversations);
}
