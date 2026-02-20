/**
 * POST /api/knowledge/reindex
 * Re-embeds all chunks for a given knowledge_source.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { chunkText } from '@smartrealtor/rag';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  sourceId: z.string().uuid(),
});

async function embedText(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const resp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return resp.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, sourceId } = parsed.data;
  const supabase = createServiceSupabaseClient();

  // Fetch the source
  const { data: src, error: srcErr } = await supabase
    .from('knowledge_sources')
    .select('id, title, url, content')
    .eq('id', sourceId)
    .eq('tenant_id', tenantId)
    .single();

  if (srcErr || !src) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }

  // Mark pending
  await supabase
    .from('knowledge_sources')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  // Delete old chunks
  await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId);

  // Re-chunk + re-embed
  const chunks = chunkText(
    { tenantId, sourceId, title: src.title as string, text: src.content as string, url: src.url ?? undefined },
    { chunkSize: 500, overlap: 100 },
  );

  let stored = 0;
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.text);
    const { error } = await supabase.from('knowledge_chunks').insert({
      tenant_id: tenantId,
      source_id: sourceId,
      title: chunk.title,
      url: chunk.url ?? null,
      snippet: chunk.text,
      embedding: embedding ? JSON.stringify(embedding) : null,
    });
    if (!error) stored += 1;
  }

  await supabase
    .from('knowledge_sources')
    .update({ status: 'indexed', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  return NextResponse.json({ sourceId, chunksCreated: stored });
}
