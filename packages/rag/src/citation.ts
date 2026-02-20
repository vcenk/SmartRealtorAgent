import type { Citation, RetrievedPassage } from './types';

export const toCitation = (passage: RetrievedPassage): Citation => ({
  sourceId: passage.chunk.sourceId,
  title: passage.chunk.title,
  url: passage.chunk.url,
  snippet: passage.chunk.text.slice(0, 200),
});
