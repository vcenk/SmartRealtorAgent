import type { RetrievedPassage, Retriever, RetrieveRequest } from './types';

export class StubRetriever implements Retriever {
  constructor(private readonly passages: RetrievedPassage[] = []) {}

  async retrieve(input: RetrieveRequest): Promise<RetrievedPassage[]> {
    const topK = input.topK ?? 5;
    return this.passages.slice(0, topK);
  }
}
