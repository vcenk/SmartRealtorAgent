import type { EmbedRequest, EmbeddingProvider } from './types';

export class StubEmbeddingProvider implements EmbeddingProvider {
  async embed(input: EmbedRequest): Promise<number[]> {
    const values = Array.from(input.text).map((char) => char.charCodeAt(0) / 255);
    return values.slice(0, 64);
  }
}
