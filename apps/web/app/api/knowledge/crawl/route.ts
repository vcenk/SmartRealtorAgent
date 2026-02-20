/**
 * POST /api/knowledge/crawl
 *
 * Crawls an entire website and ingests all discovered pages as knowledge chunks.
 * Streams JSON-newline progress events so the UI can show a live progress bar.
 *
 * Body:
 *   tenantId     string (uuid)
 *   url          string  — root URL to start crawling from
 *   maxPages?    number  — max pages to crawl (default 20, max 50)
 *   pathPrefix?  string  — only crawl paths starting with this (e.g. "/listings")
 *
 * Response: text/event-stream newline-delimited JSON
 *   { type: "progress", page: number, total: number, url: string }
 *   { type: "done", sourcesCreated: number, chunksCreated: number, errors: number }
 *   { type: "error", message: string }
 */
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { crawlSite } from '@/lib/scraper';
import { embedText, storeChunks } from '../ingest/route';

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  url: z.string().url(),
  maxPages: z.number().min(1).max(50).default(20),
  pathPrefix: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { tenantId, url, maxPages, pathPrefix } = parsed.data;
  const supabase = createServiceSupabaseClient();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      try {
        // Start crawl
        send({ type: 'status', message: 'Discovering pages…' });

        const result = await crawlSite(url, {
          maxPages,
          useSitemap: true,
          allowedPathPrefix: pathPrefix,
        });

        if (result.pages.length === 0) {
          if (result.errors.length > 0) {
            send({ type: 'error', message: result.errors[0]?.reason ?? 'No pages found' });
          } else {
            send({ type: 'error', message: 'No indexable pages found at that URL.' });
          }
          controller.close();
          return;
        }

        send({ type: 'status', message: `Found ${result.pages.length} pages. Indexing…` });

        let sourcesCreated = 0;
        let chunksCreated = 0;

        for (let i = 0; i < result.pages.length; i++) {
          const page = result.pages[i];
          send({ type: 'progress', page: i + 1, total: result.pages.length, url: page.url });

          try {
            // Insert knowledge_source
            const { data: src, error: srcErr } = await supabase
              .from('knowledge_sources')
              .insert({
                tenant_id: tenantId,
                title: page.title,
                url: page.url,
                content: page.structuredText.slice(0, 100_000),
                status: 'pending',
              })
              .select('id')
              .single();

            if (srcErr || !src) continue;
            sourcesCreated++;

            const n = await storeChunks(supabase, {
              tenantId,
              sourceId: src.id as string,
              title: page.title,
              text: page.structuredText,
              url: page.url,
            });
            chunksCreated += n;

            await supabase
              .from('knowledge_sources')
              .update({ status: 'indexed', updated_at: new Date().toISOString() })
              .eq('id', src.id);
          } catch { /* skip failed pages */ }
        }

        send({
          type: 'done',
          sourcesCreated,
          chunksCreated,
          skipped: result.skipped,
          errors: result.errors.length,
        });
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Crawl failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
