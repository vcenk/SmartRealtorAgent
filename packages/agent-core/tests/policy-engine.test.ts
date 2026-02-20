import { describe, expect, it } from 'vitest';
import { PolicyEngine } from '../src/policy-engine';

describe('PolicyEngine', () => {
  const engine = new PolicyEngine();

  it('requires fallback when factual claims have no citations', () => {
    const decision = engine.evaluate({
      intent: 'FAQ',
      hasCitations: false,
      hasFactualClaims: true,
      kbResultsCount: 1,
    });

    expect(decision.allow).toBe(false);
    expect(decision.useFallback).toBe(true);
  });

  it('requires lead capture for buyer/seller intents', () => {
    const decision = engine.evaluate({
      intent: 'BUYER_LEAD',
      hasCitations: false,
      hasFactualClaims: false,
      kbResultsCount: 0,
    });

    expect(decision.requireLeadCapture).toBe(true);
  });
});
