/**
 * POST /api/knowledge/upload
 * Accepts a file upload (multipart/form-data) and ingests it into the KB.
 * Supports .txt, .md, .csv (read as UTF-8) and .pdf (text extracted via pdf-parse).
 */
import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { storeChunks } from '@/app/api/knowledge/ingest/route';
import { verifyAgentOwnership, DEMO_AGENT } from '@/lib/auth-tenant';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const tenantId = formData.get('tenantId');
  const file = formData.get('file');

  if (typeof tenantId !== 'string' || !tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 422 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 });
  }

  // Verify ownership
  if (tenantId !== DEMO_AGENT) {
    const { isOwner } = await verifyAgentOwnership(request, tenantId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';

  let text: string;
  try {
    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
      const result = await parser.getText();
      text = result.text;
      if (!text || text.trim().length < 10) {
        return NextResponse.json(
          { error: 'Could not extract text from PDF. The file may be scanned or image-only.' },
          { status: 422 },
        );
      }
    } else {
      text = await file.text();
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to read file: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 422 },
    );
  }

  const supabase = createServiceSupabaseClient();
  const title = filename;

  // Insert source record
  const { data: source, error: srcErr } = await supabase
    .from('knowledge_sources')
    .insert({
      tenant_id: tenantId,
      title,
      url: null,
      content: text.slice(0, 100_000),
      status: 'pending',
    })
    .select('id')
    .single();

  if (srcErr) return NextResponse.json({ error: srcErr.message }, { status: 500 });
  const sourceId = source.id as string;

  const stored = await storeChunks(supabase, { tenantId, sourceId, title, text });

  await supabase
    .from('knowledge_sources')
    .update({ status: 'indexed', updated_at: new Date().toISOString() })
    .eq('id', sourceId);

  return NextResponse.json({ sourceId, chunksCreated: stored });
}
