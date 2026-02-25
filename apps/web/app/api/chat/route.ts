import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Orchestrator, ToolRegistry, type ToolExecutionContext } from '@smartrealtor/agent-core';
import {
  appendConversationMessageSkill,
  executeSkill,
  kbSearchSkill,
  leadsUpsertSkill,
  type DbAdapter,
} from '@smartrealtor/skills';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { requireTenantOwnership } from '@/lib/auth-helpers';

/* ── Clients (lazy – avoids crash at build time when env vars are absent) ── */
let _anthropic: Anthropic | undefined;
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

let _openai: OpenAI | undefined;
function getOpenai(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

/* ── Request schema ───────────────────────────────────────── */
const requestSchema = z.object({
  tenantId: z.string(),
  conversationId: z.string(),
  userMessage: z.string().min(1),
});

/* ── Embedding helper ─────────────────────────────────────── */
async function generateEmbedding(text: string): Promise<number[] | null> {
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

/* ── DB adapter ───────────────────────────────────────────── */
const buildDbAdapter = (): DbAdapter => {
  const supabase = createServiceSupabaseClient();

  return {
    async searchKnowledge({ tenantId, query }) {
      // 1. Try vector search (requires pgvector migration + OPENAI_API_KEY)
      const embedding = await generateEmbedding(query);
      if (embedding) {
        const { data: vecRows } = await supabase.rpc('search_knowledge_chunks', {
          p_tenant_id: tenantId,
          p_embedding: JSON.stringify(embedding),
          p_match_count: 5,
          p_min_sim: 0.25,
        });
        if (vecRows && (vecRows as unknown[]).length > 0) {
          return (vecRows as Array<{ source_id: string; title: string; url?: string; snippet: string }>).map((r) => ({
            sourceId: r.source_id,
            title: r.title ?? 'Untitled',
            url: r.url ?? undefined,
            snippet: r.snippet,
          }));
        }
      }

      // 2. Fallback: ILIKE full-text search
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('source_id, title, url, snippet')
        .eq('tenant_id', tenantId)
        .ilike('snippet', `%${query}%`)
        .limit(5);

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => ({
        sourceId: row.source_id as string,
        title: (row.title as string) ?? 'Untitled',
        url: (row.url as string) ?? undefined,
        snippet: (row.snippet as string) ?? '',
      }));
    },

    async upsertLead({ tenantId, payload }) {
      const { data, error } = await supabase
        .from('leads')
        .insert({ tenant_id: tenantId, payload })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      return { leadId: data.id as string };
    },

    async appendConversationMessage({ tenantId, conversationId, role, content }) {
      const { data, error } = await supabase
        .from('messages')
        .insert({ tenant_id: tenantId, conversation_id: conversationId, role, content })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      return { messageId: data.id as string };
    },
  };
};

/* ── Tool registry ────────────────────────────────────────── */
const createRegistry = (tenantId: string, conversationId: string): ToolRegistry => {
  const db = buildDbAdapter();
  const registry = new ToolRegistry();
  const perms = ['kb:read', 'lead:write', 'conversation:write'];

  for (const skill of [kbSearchSkill, leadsUpsertSkill, appendConversationMessageSkill]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = skill as any;
    registry.register({
      name: s.name,
      description: s.description,
      inputSchema: s.inputSchema,
      outputSchema: s.outputSchema,
      permissionGate: (context: ToolExecutionContext) =>
        s.permissionGate({ ...context, db, tenantId, conversationId, permissions: perms }),
      execute: async (input: unknown, context: ToolExecutionContext) =>
        executeSkill(s, input, { ...context, db, tenantId, conversationId, permissions: perms }),
    });
  }

  return registry;
};

/* ── System prompt ────────────────────────────────────────── */
const buildSystemPrompt = (
  ctx: Array<{ title: string; snippet: string; url?: string }>,
): string => {
  const ctxBlock =
    ctx.length > 0
      ? ctx.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.snippet}`).join('\n\n---\n\n')
      : 'No specific knowledge base entries found for this query.';

  return `You are Smart Realtor Agent, a helpful AI assistant for a real estate agency.
You answer questions about properties, neighborhoods, buying/selling processes, and agency services.

RULES:
- Be concise, warm, and professional.
- Only make factual claims supported by the provided knowledge base context.
- If context lacks enough information, say so honestly and invite the user to contact the agency.
- Never fabricate listing details, prices, or legal information.
- When you use information from a source, reference it naturally (e.g. "According to our buyer guide...").
- Keep responses under 200 words unless the user asks for detail.

KNOWLEDGE BASE CONTEXT:
${ctxBlock}`;
};

/* ── POST handler ─────────────────────────────────────────── */
export async function POST(request: NextRequest): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(json);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 422 });
  }
  const payload = parseResult.data;

  // Verify tenant ownership (allow demo agent for onboarding)
  const auth = await requireTenantOwnership(request, payload.tenantId, { allowDemo: true });
  if (!auth.authorized) return auth.response;

  const registry = createRegistry(payload.tenantId, payload.conversationId);
  const orchestrator = new Orchestrator(registry);
  const result = await orchestrator.run(payload);

  const systemPrompt = buildSystemPrompt(
    result.citations.map((c) => ({ title: c.title, snippet: c.snippet, url: c.url })),
  );

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          // No API key configured — return orchestrator stub
          controller.enqueue(encoder.encode(result.assistantMessage));
          controller.close();
          return;
        }

        const stream = getAnthropic().messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: payload.userMessage }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(
            `I'm having trouble connecting right now. Please try again in a moment. (${msg})`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Citations': JSON.stringify(result.citations),
      'X-Tool-Calls': JSON.stringify(result.toolCalls),
      'Cache-Control': 'no-cache',
    },
  });
}
