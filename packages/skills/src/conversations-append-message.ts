import { z } from 'zod';
import { requirePermission } from './types';
import type { SkillDefinition } from './types';

export const appendMessageInputSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const appendMessageOutputSchema = z.object({
  messageId: z.string(),
});

export type AppendMessageInput = z.infer<typeof appendMessageInputSchema>;
export type AppendMessageOutput = z.infer<typeof appendMessageOutputSchema>;

export const appendConversationMessageSkill: SkillDefinition<
  AppendMessageInput,
  AppendMessageOutput
> = {
  name: 'conversations.appendMessage',
  description: 'Appends a message to a tenant conversation.',
  inputSchema: appendMessageInputSchema,
  outputSchema: appendMessageOutputSchema,
  permissionGate: (context) =>
    requirePermission('conversation:write', context) && Boolean(context.conversationId),
  execute: async (input, context) => {
    if (!context.conversationId) {
      throw new Error('conversationId is required');
    }

    return context.db.appendConversationMessage({
      tenantId: context.tenantId,
      conversationId: context.conversationId,
      role: input.role,
      content: input.content,
    });
  },
};
