import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { leadsUpsertSkill, executeSkill, type DbAdapter } from '@smartrealtor/skills';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const schema = z.object({
  tenantId: z.string(),
  leadPayload: z.record(z.unknown()),
});

const dbAdapter = (): DbAdapter => {
  const supabase = createServiceSupabaseClient();
  return {
    searchKnowledge: async () => [],
    async upsertLead({ tenantId, payload }) {
      const { data, error } = await supabase
        .from('leads')
        .insert({ tenant_id: tenantId, payload })
        .select('id')
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return { leadId: data.id as string };
    },
    appendConversationMessage: async () => ({ messageId: 'noop' }),
  };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { tenantId, leadPayload } = schema.parse(await request.json());
  const data = await executeSkill(
    leadsUpsertSkill,
    { leadPayload },
    {
      tenantId,
      permissions: ['lead:write'],
      db: dbAdapter(),
    },
  );

  return NextResponse.json(data);
}
