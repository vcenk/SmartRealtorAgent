import { z } from 'zod';
import { requirePermission } from './types';
import type { Citation } from '@smartrealtor/rag';
import type { SkillDefinition } from './types';

export const kbSearchInputSchema = z.object({
  query: z.string().min(2),
});

export const kbSearchOutputSchema = z.object({
  passages: z.array(z.object({ text: z.string() })),
  citations: z.array(
    z.object({
      sourceId: z.string(),
      title: z.string(),
      url: z.string().optional(),
      snippet: z.string(),
    }),
  ),
});

export type KbSearchInput = z.infer<typeof kbSearchInputSchema>;
export type KbSearchOutput = z.infer<typeof kbSearchOutputSchema>;

export const kbSearchSkill: SkillDefinition<KbSearchInput, KbSearchOutput> = {
  name: 'kb.search',
  description: 'Searches tenant knowledge base.',
  inputSchema: kbSearchInputSchema,
  outputSchema: kbSearchOutputSchema,
  permissionGate: (context) => requirePermission('kb:read', context),
  execute: async (input, context) => {
    const rows = await context.db.searchKnowledge({
      tenantId: context.tenantId,
      query: input.query,
    });

    const citations: Citation[] = rows.map((row) => ({
      sourceId: row.sourceId,
      title: row.title,
      url: row.url,
      snippet: row.snippet,
    }));

    return {
      passages: rows.map((row) => ({ text: row.snippet })),
      citations,
    };
  },
};
