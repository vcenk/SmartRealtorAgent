import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { appendConversationMessageSkill, executeSkill, type DbAdapter } from '@smartrealtor/skills';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const schema = z.object({
  tenantId: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const dbAdapter = (): DbAdapter => {
  const supabase = createServiceSupabaseClient();
  return {
    searchKnowledge: async () => [],
    upsertLead: async () => ({ leadId: 'noop' }),
    async appendConversationMessage({ tenantId, conversationId, role, content }) {
      const { data, error } = await supabase
        .from('messages')
        .insert({ tenant_id: tenantId, conversation_id: conversationId, role, content })
        .select('id')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { messageId: data.id as string };
    },
  };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = schema.parse(await request.json());
  const data = await executeSkill(
    appendConversationMessageSkill,
    { role: payload.role, content: payload.content },
    {
      tenantId: payload.tenantId,
      conversationId: payload.conversationId,
      permissions: ['conversation:write'],
      db: dbAdapter(),
    },
  );

  return NextResponse.json(data);
}
