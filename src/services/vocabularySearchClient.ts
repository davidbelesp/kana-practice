import { createVocabularySearchIndex, resolveVocabularyEntries, searchVocabularyIndex, type VocabularySearchIndex } from "../workers/vocabularySearchIndex";
import type { VocabularyResolveRequest, VocabularyResolveResponse, VocabularySearchRequest, VocabularySearchResponse, VocabularyWorkerRequest, VocabularyWorkerResponse } from "../workers/vocabularySearchTypes";

let worker: Worker | null = null;
let workerFailed = false;
let fallbackIndex: VocabularySearchIndex | null = null;
let fallbackIndexPromise: Promise<VocabularySearchIndex> | null = null;
let requestSequence = 0;
const pending = new Map<number, { resolve: (response: VocabularyWorkerResponse) => void; reject: (error: unknown) => void }>();

const createWorker = () => {
  if (worker || workerFailed || typeof Worker === "undefined") return worker;
  try {
    worker = new Worker(new URL("../workers/vocabularySearch.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<VocabularyWorkerResponse>) => {
      const request = pending.get(event.data.requestId);
      if (!request) return;
      pending.delete(event.data.requestId);
      request.resolve(event.data);
    };
    worker.onerror = (event) => {
      workerFailed = true;
      worker?.terminate();
      worker = null;
      pending.forEach(({ reject }) => reject(event.error ?? new Error("Vocabulary search worker failed")));
      pending.clear();
    };
  } catch {
    workerFailed = true;
  }
  return worker;
};

const getFallbackIndex = async () => {
  if (fallbackIndex) return fallbackIndex;
  if (!fallbackIndexPromise) {
    fallbackIndexPromise = import("../data/dictionary").then(({ dictionaryEntries }) => {
      fallbackIndex = createVocabularySearchIndex(dictionaryEntries);
      return fallbackIndex;
    });
  }
  return fallbackIndexPromise;
};

const searchWithFallback = async (request: VocabularySearchRequest) => searchVocabularyIndex(await getFallbackIndex(), request);
const resolveWithFallback = async (request: VocabularyResolveRequest): Promise<VocabularyResolveResponse> => resolveVocabularyEntries(await getFallbackIndex(), request);

const postWorkerRequest = <T extends VocabularyWorkerResponse>(request: VocabularyWorkerRequest) => {
  const activeWorker = createWorker();
  if (!activeWorker) return null;
  return new Promise<T>((resolve, reject) => {
    pending.set(request.requestId, { resolve: resolve as (response: VocabularyWorkerResponse) => void, reject });
    activeWorker.postMessage(request);
  });
};

export const searchVocabulary = async (request: Omit<VocabularySearchRequest, "requestId">): Promise<VocabularySearchResponse> => {
  const fullRequest = { ...request, requestId: ++requestSequence };
  try {
    const response = await postWorkerRequest<VocabularySearchResponse>(fullRequest);
    return response ?? await searchWithFallback(fullRequest);
  } catch {
    return searchWithFallback(fullRequest);
  }
};

export const resolveVocabularyEntriesById = async (entryIds: string[]): Promise<VocabularyResolveResponse> => {
  const request: VocabularyResolveRequest = { kind: "resolve", requestId: ++requestSequence, entryIds };
  try {
    const response = await postWorkerRequest<VocabularyResolveResponse>(request);
    return response ?? await resolveWithFallback(request);
  } catch {
    return resolveWithFallback(request);
  }
};

export const prefetchVocabularySearch = () => { createWorker(); };

export type { VocabularySearchRequest, VocabularySearchResponse, VocabularySortMode } from "../workers/vocabularySearchTypes";
