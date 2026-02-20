export type Citation = {
  sourceId: string;
  title: string;
  url?: string;
  snippet: string;
};

export type Chunk = {
  id: string;
  sourceId: string;
  tenantId: string;
  text: string;
  title: string;
  url?: string;
  startOffset: number;
  endOffset: number;
};

export type RetrievedPassage = {
  chunk: Chunk;
  score: number;
};

export type EmbedRequest = {
  tenantId: string;
  text: string;
};

export interface EmbeddingProvider {
  embed(input: EmbedRequest): Promise<number[]>;
}

export type RetrieveRequest = {
  tenantId: string;
  query: string;
  topK?: number;
};

export interface Retriever {
  retrieve(input: RetrieveRequest): Promise<RetrievedPassage[]>;
}
