/**
 * POST /api/widget/chat
 * Public (no auth) chat endpoint consumed by the embedded widget.
 * Validates that tenantId exists before processing.
 */
import { NextRequest } from 'next/server';
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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bodySchema = z.object({
  tenantId: z.string().uuid(),
  conversationId: z.string().min(1),
  userMessage: z.string().min(1).max(2000),
});

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const r = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.slice(0, 8000) });
    return r.data[0]?.embedding ?? null;
  } catch { return null; }
}

const buildDbAdapter = (): DbAdapter => {
  const supabase = createServiceSupabaseClient();
  return {
    async searchKnowledge({ tenantId, query }) {
      const embedding = await generateEmbedding(query);
      if (embedding) {
        const { data } = await supabase.rpc('search_knowledge_chunks', {
          p_tenant_id: tenantId, p_embedding: JSON.stringify(embedding), p_match_count: 5, p_min_sim: 0.25,
        });
        if (data && (data as unknown[]).length > 0) {
          return (data as Array<{ source_id: string; title: string; url?: string; snippet: string }>).map((r) => ({
            sourceId: r.source_id, title: r.title ?? 'Untitled', url: r.url ?? undefined, snippet: r.snippet,
          }));
        }
      }
      const { data, error } = await supabase
        .from('knowledge_chunks').select('source_id, title, url, snippet')
        .eq('tenant_id', tenantId).ilike('snippet', `%${query}%`).limit(5);
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({
        sourceId: row.source_id as string, title: (row.title as string) ?? 'Untitled',
        url: (row.url as string) ?? undefined, snippet: (row.snippet as string) ?? '',
      }));
    },
    async upsertLead({ tenantId, payload }) {
      const { data, error } = await supabase.from('leads').insert({ tenant_id: tenantId, payload }).select('id').single();
      if (error) throw new Error(error.message);
      return { leadId: data.id as string };
    },
    async appendConversationMessage({ tenantId, conversationId, role, content }) {
      const { data, error } = await supabase.from('messages')
        .insert({ tenant_id: tenantId, conversation_id: conversationId, role, content }).select('id').single();
      if (error) throw new Error(error.message);
      return { messageId: data.id as string };
    },
  };
};

const buildSystemPrompt = (ctx: Array<{ title: string; snippet: string }>, tenant: { bot_name?: string; welcome_message?: string }) => {
  const ctxBlock = ctx.length > 0
    ? ctx.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.snippet}`).join('\n\n---\n\n')
    : 'No specific knowledge base entries found for this query.';
  const name = tenant.bot_name ?? 'SmartRealtorAI';
  return `You are ${name}, a helpful AI assistant for a real estate agency.
Answer questions about properties, neighborhoods, buying/selling processes, and agency services.
Be concise, warm, and professional. Only make factual claims supported by the knowledge base context.
If context is insufficient, say so and invite the user to contact the agency.
Keep responses under 200 words unless detail is explicitly requested.

KNOWLEDGE BASE CONTEXT:\n${ctxBlock}`;
};

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 422 });

  const { tenantId, conversationId, userMessage } = parsed.data;
  const supabase = createServiceSupabaseClient();

  // Verify tenant exists
  const { data: tenant } = await supabase.from('tenants').select('id, bot_name, welcome_message').eq('id', tenantId).single();
  if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });

  // Run orchestrator
  const db = buildDbAdapter();
  const registry = new ToolRegistry();
  const perms = ['kb:read', 'lead:write', 'conversation:write'];
  for (const skill of [kbSearchSkill, leadsUpsertSkill, appendConversationMessageSkill]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = skill as any;
    registry.register({
      name: s.name, description: s.description,
      inputSchema: s.inputSchema, outputSchema: s.outputSchema,
      permissionGate: (ctx: ToolExecutionContext) => s.permissionGate({ ...ctx, db, tenantId, conversationId, permissions: perms }),
      execute: async (input: unknown, ctx: ToolExecutionContext) => executeSkill(s, input, { ...ctx, db, tenantId, conversationId, permissions: perms }),
    });
  }
  const result = await new Orchestrator(registry).run({ tenantId, conversationId, userMessage });

  const systemPrompt = buildSystemPrompt(
    result.citations.map((c) => ({ title: c.title, snippet: c.snippet })),
    tenant as { bot_name?: string; welcome_message?: string },
  );

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          controller.enqueue(encoder.encode(result.assistantMessage));
        } else {
          const stream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6', max_tokens: 512, system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          });
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown';
        controller.enqueue(encoder.encode(`Sorry, I'm having trouble right now. (${msg})`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Citations': JSON.stringify(result.citations),
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
