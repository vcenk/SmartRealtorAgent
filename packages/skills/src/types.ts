import { z } from 'zod';
import type { Citation } from '@smartrealtor/rag';

export type SkillExecutionContext = {
  tenantId: string;
  userId?: string;
  conversationId?: string;
  permissions: string[];
  db: DbAdapter;
};

export type SkillResult<T> = {
  data: T;
  citations?: Citation[];
};

export type SkillDefinition<I, O> = {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  permissionGate: (context: SkillExecutionContext) => boolean | Promise<boolean>;
  execute: (input: I, context: SkillExecutionContext) => Promise<O>;
};

export type DbAdapter = {
  searchKnowledge: (input: { tenantId: string; query: string }) => Promise<
    Array<{
      sourceId: string;
      title: string;
      url?: string;
      snippet: string;
    }>
  >;
  upsertLead: (input: {
    tenantId: string;
    payload: Record<string, unknown>;
  }) => Promise<{ leadId: string }>;
  appendConversationMessage: (input: {
    tenantId: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
  }) => Promise<{ messageId: string }>;
};

export class SkillError extends Error {
  constructor(
    message: string,
    public readonly code: 'PERMISSION_DENIED' | 'VALIDATION_FAILED' | 'EXECUTION_FAILED',
  ) {
    super(message);
  }
}

export const requirePermission = (permission: string, context: SkillExecutionContext): boolean =>
  context.permissions.includes(permission);
