import type { Chunk } from './types';

export type ChunkOptions = {
  chunkSize?: number;
  overlap?: number;
};

export const chunkText = (
  input: { tenantId: string; sourceId: string; title: string; text: string; url?: string },
  options: ChunkOptions = {},
): Chunk[] => {
  const chunkSize = options.chunkSize ?? 500;
  const overlap = options.overlap ?? 100;

  if (chunkSize <= 0) {
    throw new Error('chunkSize must be > 0');
  }
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error('overlap must be >= 0 and < chunkSize');
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let idx = 0;

  while (start < input.text.length) {
    const end = Math.min(start + chunkSize, input.text.length);
    const text = input.text.slice(start, end);

    chunks.push({
      id: `${input.sourceId}-${idx}`,
      sourceId: input.sourceId,
      tenantId: input.tenantId,
      title: input.title,
      url: input.url,
      text,
      startOffset: start,
      endOffset: end,
    });

    if (end === input.text.length) {
      break;
    }

    start = end - overlap;
    idx += 1;
  }

  return chunks;
};
