import type { EmbedRequest, EmbeddingProvider } from './types';

export class StubEmbeddingProvider implements EmbeddingProvider {
  async embed(input: EmbedRequest): Promise<number[]> {
    const values = Array.from(input.text).map((char) => char.charCodeAt(0) / 255);
    return values.slice(0, 64);
  }
}

/**
 * Minimal interface for the OpenAI client — accepts the real `openai` SDK object
 * or any compatible duck-typed substitute (useful in tests).
 */
export interface OpenAIClientLike {
  embeddings: {
    create(params: {
      model: string;
      input: string;
    }): Promise<{ data: Array<{ embedding: number[] }> }>;
  };
}

/**
 * Production EmbeddingProvider backed by OpenAI's text-embedding-3-small model.
 * Pass in your pre-constructed OpenAI client; the package itself has no direct
 * dependency on the `openai` package so it remains framework-agnostic.
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  constructor(
    private readonly client: OpenAIClientLike,
    private readonly model = 'text-embedding-3-small',
  ) {}

  async embed(input: EmbedRequest): Promise<number[]> {
    const resp = await this.client.embeddings.create({
      model: this.model,
      input: input.text.slice(0, 8_000),
    });
    return resp.data[0]?.embedding ?? [];
  }
}
