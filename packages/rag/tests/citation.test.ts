import { describe, expect, it } from 'vitest';
import { toCitation } from '../src/citation';

describe('citation format', () => {
  it('maps retrieved passage to citation', () => {
    const citation = toCitation({
      score: 0.9,
      chunk: {
        id: 'c1',
        sourceId: 's1',
        tenantId: 't1',
        title: 'Guide',
        text: 'Useful snippet for buyer questions',
        url: 'https://example.com',
        startOffset: 0,
        endOffset: 30,
      },
    });

    expect(citation).toEqual({
      sourceId: 's1',
      title: 'Guide',
      url: 'https://example.com',
      snippet: 'Useful snippet for buyer questions',
    });
  });
});
