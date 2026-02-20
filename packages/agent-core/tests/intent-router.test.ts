import { describe, expect, it } from 'vitest';
import { IntentRouter } from '../src/intent-router';

describe('IntentRouter', () => {
  const router = new IntentRouter();

  it('classifies buyer lead', () => {
    expect(router.route('I want to buy a condo').intent).toBe('BUYER_LEAD');
  });

  it('classifies seller lead', () => {
    expect(router.route('Can you list my house?').intent).toBe('SELLER_LEAD');
  });

  it('classifies listing question', () => {
    expect(router.route('How many bedrooms does this listing have?').intent).toBe(
      'LISTING_QUESTION',
    );
  });

  it('classifies faq', () => {
    expect(router.route('What is your fee?').intent).toBe('FAQ');
  });

  it('defaults to other', () => {
    expect(router.route('hello there').intent).toBe('OTHER');
  });
});
