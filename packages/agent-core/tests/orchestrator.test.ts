import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { Orchestrator } from '../src/orchestrator';
import { ToolRegistry } from '../src/tool-registry';

const buildRegistry = (): ToolRegistry => {
  const registry = new ToolRegistry();

  registry.register({
    name: 'kb.search',
    description: 'KB search',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({
      passages: z.array(z.object({ text: z.string() })),
      citations: z.array(
        z.object({
          sourceId: z.string(),
          title: z.string(),
          url: z.string().optional(),
          snippet: z.string(),
        }),
      ),
    }),
    permissionGate: () => true,
    execute: async () => ({
      passages: [{ text: 'Verified answer from KB.' }],
      citations: [{ sourceId: 's1', title: 'Doc', snippet: 'Verified answer from KB.' }],
    }),
  });

  registry.register({
    name: 'leads.upsert',
    description: 'Lead upsert',
    inputSchema: z.object({ leadPayload: z.record(z.unknown()) }),
    outputSchema: z.object({ leadId: z.string().optional() }),
    permissionGate: () => true,
    execute: async () => ({ leadId: 'lead_1' }),
  });

  registry.register({
    name: 'conversations.appendMessage',
    description: 'Conversation append',
    inputSchema: z.object({ role: z.string(), content: z.string() }),
    outputSchema: z.object({ ok: z.boolean() }),
    permissionGate: () => true,
    execute: async () => ({ ok: true }),
  });

  return registry;
};

describe('Orchestrator', () => {
  it('returns cited response and tool calls', async () => {
    const orchestrator = new Orchestrator(buildRegistry());

    const result = await orchestrator.run({
      tenantId: 't1',
      conversationId: 'c1',
      userMessage: 'What is your fee?',
    });

    expect(result.assistantMessage).toContain('Verified answer');
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.toolCalls.find((call) => call.toolName === 'kb.search')?.success).toBe(true);
  });

  it('emits lead updates on buyer intent', async () => {
    const orchestrator = new Orchestrator(buildRegistry());

    const result = await orchestrator.run({
      tenantId: 't1',
      conversationId: 'c1',
      userMessage: 'I want to buy a house',
    });

    expect(result.leadUpdates.length).toBe(1);
  });
});
