/**
 * POST /api/knowledge/ingest
 * Ingests a knowledge source (URL or raw text) for a tenant.
 * Pipeline: fetch content → chunk → embed → store knowledge_chunks.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { chunkText } from '@smartrealtor/rag';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const requestSchema = z.object({
  tenantId: z.string().uuid(),
  title: z.string().min(1).max(300),
  url: z.string().url().optional(),
  content: z.string().min(10).optional(),
}).refine((d) => d.url ?? d.content, {
  message: 'Provide either a url or content',
});

/* ── Helpers ──────────────────────────────────────────────── */
async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SmartRealtorAI-Bot/1.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  // Strip HTML tags and collapse whitespace
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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

/* ── Route handler ────────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, title, url, content } = parsed.data;
  const supabase = createServiceSupabaseClient();

  // 1. Get raw text
  let text: string;
  try {
    text = url ? await scrapeUrl(url) : (content as string);
  } catch (err) {
    return NextResponse.json(
      { error: `Content fetch failed: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 422 },
    );
  }

  // 2. Insert knowledge_source record (status: pending)
  const { data: source, error: srcErr } = await supabase
    .from('knowledge_sources')
    .insert({
      tenant_id: tenantId,
      title,
      url: url ?? null,
      content: text.slice(0, 100_000), // store first 100 k chars
      status: 'pending',
    })
    .select('id')
    .single();

  if (srcErr) {
    return NextResponse.json({ error: srcErr.message }, { status: 500 });
  }
  const sourceId = source.id as string;

  // 3. Chunk text (500 chars, 100 overlap)
  const chunks = chunkText(
    { tenantId, sourceId, title, text, url },
    { chunkSize: 500, overlap: 100 },
  );

  // 4. Embed + store each chunk
  let stored = 0;
  for (const chunk of chunks) {
    const embedding = await embedText(chunk.text);
    const { error: chunkErr } = await supabase.from('knowledge_chunks').insert({
      tenant_id: tenantId,
      source_id: sourceId,
      title: chunk.title,
      url: chunk.url ?? null,
      snippet: chunk.text,
      embedding: embedding ? JSON.stringify(embedding) : null,
    });
    if (!chunkErr) stored += 1;
  }

  // 5. Mark source as indexed
  await supabase
    .from('knowledge_sources')
    .update({ status: 'indexed', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  return NextResponse.json({ sourceId, chunksCreated: stored });
}
