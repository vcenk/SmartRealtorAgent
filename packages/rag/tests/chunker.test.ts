import { describe, expect, it } from 'vitest';
import { chunkText } from '../src/chunker';

describe('chunkText', () => {
  it('splits text with overlap and preserves offsets', () => {
    const text = 'a'.repeat(1200);
    const chunks = chunkText(
      { tenantId: 't1', sourceId: 's1', title: 'Doc', text },
      { chunkSize: 500, overlap: 100 },
    );

    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0].startOffset).toBe(0);
    expect(chunks[1].startOffset).toBe(400);
    expect(chunks[1].endOffset).toBe(900);
    expect(chunks[0].tenantId).toBe('t1');
  });
});
