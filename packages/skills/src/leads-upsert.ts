import { z } from 'zod';
import { requirePermission } from './types';
import type { SkillDefinition } from './types';

export const leadsUpsertInputSchema = z.object({
  leadPayload: z.record(z.unknown()),
});

export const leadsUpsertOutputSchema = z.object({
  leadId: z.string(),
});

export type LeadsUpsertInput = z.infer<typeof leadsUpsertInputSchema>;
export type LeadsUpsertOutput = z.infer<typeof leadsUpsertOutputSchema>;

export const leadsUpsertSkill: SkillDefinition<LeadsUpsertInput, LeadsUpsertOutput> = {
  name: 'leads.upsert',
  description: 'Creates or updates a tenant lead record.',
  inputSchema: leadsUpsertInputSchema,
  outputSchema: leadsUpsertOutputSchema,
  permissionGate: (context) => requirePermission('lead:write', context),
  execute: async (input, context) => {
    return context.db.upsertLead({
      tenantId: context.tenantId,
      payload: input.leadPayload,
    });
  },
};
