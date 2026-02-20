/**
 * POST /api/knowledge/reindex
 * Re-fetches (for URL sources) or re-chunks the stored content,
 * re-embeds, and replaces all chunks for a given knowledge_source.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { scrapePage } from '@/lib/scraper';
import { embedText, storeChunks } from '../ingest/route';

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  sourceId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, sourceId } = parsed.data;
  const supabase = createServiceSupabaseClient();

  const { data: src, error: srcErr } = await supabase
    .from('knowledge_sources')
    .select('id, title, url, content')
    .eq('id', sourceId)
    .eq('tenant_id', tenantId)
    .single();

  if (srcErr || !src) {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }

  await supabase
    .from('knowledge_sources')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId);

  // If source has a URL, re-fetch for fresh content; otherwise use stored content
  let text = src.content as string;
  let title = src.title as string;
  if (src.url) {
    try {
      const page = await scrapePage(src.url as string);
      text = page.structuredText;
      title = page.title || title;
      // Update stored content with fresh scrape
      await supabase
        .from('knowledge_sources')
        .update({ content: text.slice(0, 100_000), title })
        .eq('id', sourceId);
    } catch { /* fall back to stored content */ }
  }

  const stored = await storeChunks(supabase, {
    tenantId, sourceId, title, text, url: src.url as string | undefined,
  });

  await supabase
    .from('knowledge_sources')
    .update({ status: 'indexed', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  return NextResponse.json({ sourceId, chunksCreated: stored });
}

// Re-export embedText so crawl route can use it without re-declaring
export { embedText };
