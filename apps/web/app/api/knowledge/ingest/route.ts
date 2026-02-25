/**
 * POST /api/knowledge/ingest
 * Ingests a single knowledge source (URL or raw text) for an agent.
 * Pipeline: fetch + parse → extract JSON-LD → chunk → embed → store.
 *
 * For multi-page site crawling use POST /api/knowledge/crawl instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { chunkText } from '@smartrealtor/rag';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { scrapePage } from '@/lib/scraper';
import { verifyAgentOwnership, DEMO_AGENT } from '@/lib/auth-tenant';

/* Lazy client init – avoids crash at build time when env vars are absent */
let _openai: OpenAI | undefined;
function getOpenai(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

const requestSchema = z
  .object({
    tenantId: z.string().uuid(), // agentId (keeping tenantId name for backwards compatibility)
    title: z.string().min(1).max(300).optional(), // auto-derived from page title when not set
    url: z.string().url().optional(),
    content: z.string().min(10).optional(),
  })
  .refine((d) => d.url ?? d.content, { message: 'Provide either a url or content' });

/* ── Embedding helper ─────────────────────────────────────── */
export async function embedText(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const resp = await getOpenai().embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return resp.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/* ── Shared: store chunks for a source ───────────────────────*/
export async function storeChunks(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  {
    tenantId,
    sourceId,
    title,
    text,
    url,
  }: { tenantId: string; sourceId: string; title: string; text: string; url?: string },
): Promise<number> {
  const chunks = chunkText(
    { tenantId, sourceId, title, text, url },
    { chunkSize: 600, overlap: 120 },
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
    if (!error) stored++;
  }
  return stored;
}

/* ── Route handler ────────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, url, content } = parsed.data;

  // Verify ownership (demo agent allowed for backwards compatibility)
  if (tenantId !== DEMO_AGENT) {
    const { isOwner } = await verifyAgentOwnership(request, tenantId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  const supabase = createServiceSupabaseClient();

  // 1. Get page content
  let title = parsed.data.title ?? '';
  let text: string;

  if (url) {
    try {
      const page = await scrapePage(url);
      if (!title) title = page.title;
      text = page.structuredText; // includes JSON-LD facts
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${err instanceof Error ? err.message : 'Unknown'}` },
        { status: 422 },
      );
    }
  } else {
    if (!title) title = 'Pasted content';
    text = content as string;
  }

  // 2. Insert source record
  const { data: source, error: srcErr } = await supabase
    .from('knowledge_sources')
    .insert({ tenant_id: tenantId, title, url: url ?? null, content: text.slice(0, 100_000), status: 'pending' })
    .select('id')
    .single();

  if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 500 });
  const sourceId = source.id as string;

  // 3. Chunk → embed → store
  const stored = await storeChunks(supabase, { tenantId, sourceId, title, text, url });

  // 4. Mark indexed
  await supabase
    .from('knowledge_sources')
    .update({ status: 'indexed', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  return NextResponse.json({ sourceId, chunksCreated: stored });
}
