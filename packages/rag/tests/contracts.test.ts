import { describe, expect, it } from 'vitest';
import { StubEmbeddingProvider } from '../src/embedding';
import { StubRetriever } from '../src/retriever';

describe('stub contracts', () => {
  it('embeds text deterministically', async () => {
    const provider = new StubEmbeddingProvider();
    const vector = await provider.embed({ tenantId: 't1', text: 'hello' });

    expect(vector.length).toBeGreaterThan(0);
    expect(vector[0]).toBeCloseTo('h'.charCodeAt(0) / 255);
  });

  it('retrieves topK passages', async () => {
    const retriever = new StubRetriever([
      {
        score: 1,
        chunk: {
          id: 'c1',
          sourceId: 's1',
          tenantId: 't1',
          text: 'A',
          title: 'T',
          startOffset: 0,
          endOffset: 1,
        },
      },
    ]);

    const result = await retriever.retrieve({ tenantId: 't1', query: 'x', topK: 1 });
    expect(result).toHaveLength(1);
  });
});
