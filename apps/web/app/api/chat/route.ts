import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Orchestrator, ToolRegistry } from '@smartrealtor/agent-core';
import {
  appendConversationMessageSkill,
  executeSkill,
  kbSearchSkill,
  leadsUpsertSkill,
  type DbAdapter,
} from '@smartrealtor/skills';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const requestSchema = z.object({
  tenantId: z.string(),
  conversationId: z.string(),
  userMessage: z.string().min(1),
});

const buildDbAdapter = (): DbAdapter => {
  const supabase = createServiceSupabaseClient();

  return {
    async searchKnowledge({ tenantId, query }) {
      const { data, error } = await supabase
        .from('knowledge_chunks')
        .select('source_id,title,url,snippet')
        .eq('tenant_id', tenantId)
        .ilike('snippet', `%${query}%`)
        .limit(5);

      if (error) {
        throw new Error(error.message);
      }

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

      if (error) {
        throw new Error(error.message);
      }

      return { leadId: data.id as string };
    },
    async appendConversationMessage({ tenantId, conversationId, role, content }) {
      const { data, error } = await supabase
        .from('messages')
        .insert({ tenant_id: tenantId, conversation_id: conversationId, role, content })
        .select('id')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { messageId: data.id as string };
    },
  };
};

const createRegistry = (tenantId: string, conversationId: string): ToolRegistry => {
  const db = buildDbAdapter();
  const registry = new ToolRegistry();

  registry.register({
    name: kbSearchSkill.name,
    description: kbSearchSkill.description,
    inputSchema: kbSearchSkill.inputSchema,
    outputSchema: kbSearchSkill.outputSchema,
    permissionGate: (context) =>
      kbSearchSkill.permissionGate({
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['kb:read'],
      }),
    execute: async (input, context) =>
      executeSkill(kbSearchSkill, input, {
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['kb:read'],
      }),
  });

  registry.register({
    name: leadsUpsertSkill.name,
    description: leadsUpsertSkill.description,
    inputSchema: leadsUpsertSkill.inputSchema,
    outputSchema: leadsUpsertSkill.outputSchema,
    permissionGate: (context) =>
      leadsUpsertSkill.permissionGate({
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['lead:write'],
      }),
    execute: async (input, context) =>
      executeSkill(leadsUpsertSkill, input, {
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['lead:write'],
      }),
  });

  registry.register({
    name: appendConversationMessageSkill.name,
    description: appendConversationMessageSkill.description,
    inputSchema: appendConversationMessageSkill.inputSchema,
    outputSchema: appendConversationMessageSkill.outputSchema,
    permissionGate: (context) =>
      appendConversationMessageSkill.permissionGate({
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['conversation:write'],
      }),
    execute: async (input, context) =>
      executeSkill(appendConversationMessageSkill, input, {
        ...context,
        db,
        tenantId,
        conversationId,
        permissions: ['conversation:write'],
      }),
  });

  return registry;
};

const streamText = (text: string): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  const chunks = text.match(/.{1,16}/g) ?? [text];

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      controller.close();
    },
  });
};

export async function POST(request: NextRequest): Promise<Response> {
  const json = await request.json();
  const payload = requestSchema.parse(json);
  const registry = createRegistry(payload.tenantId, payload.conversationId);
  const orchestrator = new Orchestrator(registry);
  const result = await orchestrator.run(payload);

  return new Response(streamText(result.assistantMessage), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Citations': JSON.stringify(result.citations),
      'X-Tool-Calls': JSON.stringify(result.toolCalls),
    },
  });
}
