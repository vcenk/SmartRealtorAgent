/**
 * DELETE /api/knowledge/delete
 * Deletes a knowledge_source and its chunks for a given agent.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { verifyAgentOwnership, DEMO_AGENT } from '@/lib/auth-tenant';

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  sourceId: z.string().uuid(),
});

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, sourceId } = parsed.data;

  // Verify ownership
  if (tenantId !== DEMO_AGENT) {
    const { isOwner } = await verifyAgentOwnership(request, tenantId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const supabase = createServiceSupabaseClient();

  // Delete chunks first (FK cascade would handle this, but being explicit)
  await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId).eq('tenant_id', tenantId);

  const { error } = await supabase
    .from('knowledge_sources')
    .delete()
    .eq('id', sourceId)
    .eq('tenant_id', tenantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: sourceId });
}
