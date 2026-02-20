import type { EmbeddingProvider, RetrievedPassage, Retriever, RetrieveRequest } from './types';

export class StubRetriever implements Retriever {
  constructor(private readonly passages: RetrievedPassage[] = []) {}

  async retrieve(input: RetrieveRequest): Promise<RetrievedPassage[]> {
    const topK = input.topK ?? 5;
    return this.passages.slice(0, topK);
  }
}

/**
 * Minimal Supabase client interface needed by SupabaseRetriever.
 * Accepts the real `@supabase/supabase-js` client or any compatible
 * duck-typed substitute (useful in tests).
 */
export interface SupabaseClientLike {
  rpc(
    fn: string,
    params: Record<string, unknown>,
  ): Promise<{ data: unknown; error: unknown }>;
}

type KnowledgeChunkRow = {
  source_id: string;
  title: string;
  url?: string;
  snippet: string;
  similarity: number;
};

/**
 * Production Retriever backed by the `search_knowledge_chunks` Supabase RPC
 * (pgvector cosine similarity search).  Pass in pre-constructed Supabase and
 * EmbeddingProvider instances; no direct dependency on either SDK.
 */
export class SupabaseRetriever implements Retriever {
  constructor(
    private readonly supabase: SupabaseClientLike,
    private readonly embedder: EmbeddingProvider,
    private readonly defaultTopK = 5,
    private readonly minSimilarity = 0.25,
  ) {}

  async retrieve(input: RetrieveRequest): Promise<RetrievedPassage[]> {
    const embedding = await this.embedder.embed({
      tenantId: input.tenantId,
      text: input.query,
    });

    const { data, error } = await this.supabase.rpc('search_knowledge_chunks', {
      p_tenant_id: input.tenantId,
      p_embedding: JSON.stringify(embedding),
      p_match_count: input.topK ?? this.defaultTopK,
      p_min_sim: this.minSimilarity,
    });

    if (error) throw new Error(String(error));

    const rows = (data ?? []) as KnowledgeChunkRow[];

    return rows.map((row) => ({
      chunk: {
        id: row.source_id,
        sourceId: row.source_id,
        tenantId: input.tenantId,
        text: row.snippet,
        title: row.title ?? 'Untitled',
        url: row.url,
        startOffset: 0,
        endOffset: row.snippet.length,
      },
      score: row.similarity,
    }));
  }
}
