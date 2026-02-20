import { z } from 'zod';
import type { Citation } from '@smartrealtor/rag';

export const intentTypeSchema = z.enum([
  'BUYER_LEAD',
  'SELLER_LEAD',
  'FAQ',
  'LISTING_QUESTION',
  'OTHER',
]);

export type IntentType = z.infer<typeof intentTypeSchema>;

export type ToolCallRecord = {
  toolName: string;
  input: unknown;
  output?: unknown;
  success: boolean;
  error?: string;
};

export type LeadUpdate = {
  leadId?: string;
  fields: Record<string, unknown>;
};

export type OrchestratorRequest = {
  tenantId: string;
  conversationId: string;
  userMessage: string;
};

export type OrchestratorResponse = {
  assistantMessage: string;
  toolCalls: ToolCallRecord[];
  citations: Citation[];
  leadUpdates: LeadUpdate[];
};

export type ToolExecutionContext = {
  tenantId: string;
  conversationId?: string;
  userId?: string;
  permissions?: string[];
};

export type ToolDefinition<I, O> = {
  name: string;
  description: string;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  permissionGate: (context: ToolExecutionContext) => boolean | Promise<boolean>;
  execute: (input: I, context: ToolExecutionContext) => Promise<O>;
};

export type PolicyDecision = {
  allow: boolean;
  reason?: string;
  requireCitations: boolean;
  requireLeadCapture: boolean;
  useFallback: boolean;
};

export type RouteResult = {
  intent: IntentType;
  confidence: number;
  rationale: string;
};
