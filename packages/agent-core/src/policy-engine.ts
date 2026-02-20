import type { IntentType, PolicyDecision } from './types';

const leadIntents: IntentType[] = ['BUYER_LEAD', 'SELLER_LEAD'];

export class PolicyEngine {
  evaluate(input: {
    intent: IntentType;
    hasCitations: boolean;
    hasFactualClaims: boolean;
    kbResultsCount: number;
  }): PolicyDecision {
    const requireLeadCapture = leadIntents.includes(input.intent);
    const requireCitations = input.hasFactualClaims;

    if (requireCitations && !input.hasCitations) {
      return {
        allow: false,
        reason: 'Factual response requires citations.',
        requireCitations,
        requireLeadCapture,
        useFallback: true,
      };
    }

    if (input.hasFactualClaims && input.kbResultsCount === 0) {
      return {
        allow: false,
        reason: 'No supporting KB evidence found.',
        requireCitations,
        requireLeadCapture,
        useFallback: true,
      };
    }

    return {
      allow: true,
      requireCitations,
      requireLeadCapture,
      useFallback: false,
    };
  }
}
