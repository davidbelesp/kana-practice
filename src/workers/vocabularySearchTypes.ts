import type { VocabularyItem } from "../types/Vocabulary";

export type VocabularySortMode = "relevance" | "japanese" | "difficulty" | "category";

export interface VocabularySearchRequest {
  kind?: "search";
  requestId: number;
  query: string;
  categories: string[];
  sortMode: VocabularySortMode;
  language: string;
  limit: number;
}

export interface VocabularyResolveRequest {
  kind: "resolve";
  requestId: number;
  entryIds: string[];
}

export interface VocabularySearchResponse {
  requestId: number;
  status: "ready" | "error";
  visibleEntries: VocabularyItem[];
  matchingEntryIds: string[];
  total: number;
  totalEntries: number;
  categoryCounts: Record<string, number>;
  error?: string;
}

export interface VocabularyResolveResponse {
  requestId: number;
  kind: "resolve";
  status: "ready" | "error";
  entries: VocabularyItem[];
  error?: string;
}

export type VocabularyWorkerRequest = VocabularySearchRequest | VocabularyResolveRequest;
export type VocabularyWorkerResponse = VocabularySearchResponse | VocabularyResolveResponse;
