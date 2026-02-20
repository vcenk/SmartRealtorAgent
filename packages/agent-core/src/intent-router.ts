import type { RouteResult } from './types';

const includesAny = (text: string, terms: string[]): boolean =>
  terms.some((term) => text.includes(term));

export class IntentRouter {
  route(message: string): RouteResult {
    const normalized = message.toLowerCase();

    if (includesAny(normalized, ['buy', 'buyer', 'mortgage', 'pre-approval'])) {
      return { intent: 'BUYER_LEAD', confidence: 0.86, rationale: 'Buyer keywords detected.' };
    }

    if (includesAny(normalized, ['sell', 'listing my home', 'list my house', 'home value'])) {
      return { intent: 'SELLER_LEAD', confidence: 0.86, rationale: 'Seller keywords detected.' };
    }

    if (includesAny(normalized, ['listing', 'bedroom', 'bathroom', 'sqft', 'hoa'])) {
      return {
        intent: 'LISTING_QUESTION',
        confidence: 0.8,
        rationale: 'Listing-specific property terms detected.',
      };
    }

    if (includesAny(normalized, ['hours', 'where', 'what is', 'do you offer', 'how much'])) {
      return { intent: 'FAQ', confidence: 0.72, rationale: 'General FAQ style phrasing detected.' };
    }

    return { intent: 'OTHER', confidence: 0.5, rationale: 'No specific intent keywords detected.' };
  }
}
