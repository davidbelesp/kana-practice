import { dictionaryEntries } from "../data/dictionary";
import { createVocabularySearchIndex, resolveVocabularyEntries, searchVocabularyIndex } from "./vocabularySearchIndex";
import type { VocabularySearchResponse, VocabularyWorkerRequest, VocabularyWorkerResponse } from "./vocabularySearchTypes";

const index = createVocabularySearchIndex(dictionaryEntries);

self.onmessage = (event: MessageEvent<VocabularyWorkerRequest>) => {
  try {
    const response: VocabularyWorkerResponse = event.data.kind === "resolve"
      ? resolveVocabularyEntries(index, event.data)
      : searchVocabularyIndex(index, event.data);
    self.postMessage(response);
  } catch (error) {
    const response: VocabularyWorkerResponse = event.data.kind === "resolve" ? {
      requestId: event.data.requestId,
      kind: "resolve",
      status: "error",
      entries: [],
      error: error instanceof Error ? error.message : "Vocabulary lookup failed",
    } : {
      requestId: event.data.requestId,
      status: "error",
      visibleEntries: [],
      matchingEntryIds: [],
      total: 0,
      totalEntries: dictionaryEntries.length,
      categoryCounts: {},
      error: error instanceof Error ? error.message : "Vocabulary search failed",
    } as VocabularySearchResponse;
    self.postMessage(response);
  }
};
