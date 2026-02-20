import type { Citation } from '@smartrealtor/rag';
import { ConversationState } from './conversation-state';
import { IntentRouter } from './intent-router';
import { PolicyEngine } from './policy-engine';
import { ToolRegistry } from './tool-registry';
import type {
  LeadUpdate,
  OrchestratorRequest,
  OrchestratorResponse,
  ToolCallRecord,
  ToolExecutionContext,
} from './types';

export class Orchestrator {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly router: IntentRouter = new IntentRouter(),
    private readonly policyEngine: PolicyEngine = new PolicyEngine(),
  ) {}

  async run(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    const route = this.router.route(request.userMessage);
    const conversationState = new ConversationState();
    const toolCalls: ToolCallRecord[] = [];
    const citations: Citation[] = [];
    const leadUpdates: LeadUpdate[] = [];
    const context: ToolExecutionContext = {
      tenantId: request.tenantId,
      conversationId: request.conversationId,
      permissions: ['kb:read', 'lead:write', 'conversation:write'],
    };

    let kbResults: { passages: { text: string }[]; citations: Citation[] } | undefined;

    try {
      kbResults = (await this.registry.execute(
        'kb.search',
        { query: request.userMessage },
        context,
      )) as { passages: { text: string }[]; citations: Citation[] };
      toolCalls.push({
        toolName: 'kb.search',
        input: { query: request.userMessage },
        output: kbResults,
        success: true,
      });
      citations.push(...kbResults.citations);
    } catch (error) {
      toolCalls.push({
        toolName: 'kb.search',
        input: { query: request.userMessage },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const hasFactualClaims = route.intent === 'FAQ' || route.intent === 'LISTING_QUESTION';
    const decision = this.policyEngine.evaluate({
      intent: route.intent,
      hasCitations: citations.length > 0,
      hasFactualClaims,
      kbResultsCount: kbResults?.passages.length ?? 0,
    });

    if (decision.requireLeadCapture) {
      conversationState.transition('ENGAGED');
      conversationState.transition('QUALIFYING');
      const leadUpdate: LeadUpdate = {
        fields: { stage: 'qualifying', intent: route.intent },
      };

      try {
        const leadResult = (await this.registry.execute(
          'leads.upsert',
          { leadPayload: { stage: 'qualifying', source: 'chat' } },
          context,
        )) as { leadId?: string };
        leadUpdate.leadId = leadResult.leadId;
        toolCalls.push({
          toolName: 'leads.upsert',
          input: { leadPayload: { stage: 'qualifying', source: 'chat' } },
          output: leadResult,
          success: true,
        });
      } catch (error) {
        toolCalls.push({
          toolName: 'leads.upsert',
          input: { leadPayload: { stage: 'qualifying', source: 'chat' } },
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      leadUpdates.push(leadUpdate);
    }

    try {
      const appendResult = await this.registry.execute(
        'conversations.appendMessage',
        {
          role: 'user',
          content: request.userMessage,
        },
        context,
      );
      toolCalls.push({
        toolName: 'conversations.appendMessage',
        input: { role: 'user', content: request.userMessage },
        output: appendResult,
        success: true,
      });
    } catch (error) {
      toolCalls.push({
        toolName: 'conversations.appendMessage',
        input: { role: 'user', content: request.userMessage },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const assistantMessage = decision.useFallback
      ? 'I want to make sure I stay accurate. Could you share more details so I can answer with verified sources?'
      : (kbResults?.passages[0]?.text ??
        'Thanks for your question. I can help once you share a little more detail.');

    return {
      assistantMessage,
      toolCalls,
      citations,
      leadUpdates,
    };
  }
}
