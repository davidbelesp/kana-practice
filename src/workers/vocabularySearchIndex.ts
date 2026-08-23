import { DICTIONARY_CATEGORIES } from "../data/dictionaryCategories";
import type { VocabularyItem } from "../types/Vocabulary";
import type { VocabularyResolveResponse, VocabularySearchRequest, VocabularySearchResponse } from "./vocabularySearchTypes";

interface IndexedVocabularyEntry {
  item: VocabularyItem;
  searchText: string;
  relevanceFields: string[];
}

export interface VocabularySearchIndex {
  entries: IndexedVocabularyEntry[];
  categoryCounts: Record<string, number>;
}

const japaneseCollator = new Intl.Collator("ja");

const getSearchText = (item: VocabularyItem) => [
  item.japanese,
  item.hiragana,
  item.romaji,
  item.type,
  item.group,
  item.jlpt,
  ...(item.categories ?? []),
  ...(item.fields ?? []),
  ...(item.usage ?? []),
  ...(item.tags ?? []),
  ...item.translation.map((entry) => entry.translation),
  ...(item.examples ?? []).flatMap((example) => [
    example.japanese,
    ...example.translation.map((entry) => entry.translation),
  ]),
].filter(Boolean).join(" ").toLowerCase();

export const createVocabularySearchIndex = (entries: VocabularyItem[]): VocabularySearchIndex => {
  const categoryCounts = Object.fromEntries(DICTIONARY_CATEGORIES.map((category) => [category.id, 0]));
  const indexedEntries = entries.map((item) => {
    (item.categories ?? []).forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    });

    return {
      item,
      searchText: getSearchText(item),
      relevanceFields: [
        item.japanese,
        item.hiragana,
        item.romaji,
        ...item.translation.map((entry) => entry.translation),
      ].filter(Boolean).map((field) => field.toLowerCase()),
    };
  });

  return { entries: indexedEntries, categoryCounts };
};

const getRelevanceScore = (entry: IndexedVocabularyEntry, query: string) =>
  entry.relevanceFields.reduce(
    (total, field) => total + (field.startsWith(query) ? 3 : field.includes(query) ? 1 : 0),
    0,
  );

export const searchVocabularyIndex = (
  index: VocabularySearchIndex,
  request: VocabularySearchRequest,
): VocabularySearchResponse => {
  const query = request.query.trim().toLowerCase();
  const activeCategories = new Set(request.categories);
  const filtered = index.entries.filter((entry) => {
    const categories = entry.item.categories ?? [];
    const categoryMatch = activeCategories.size === 0 || [...activeCategories].every((category) => categories.includes(category));
    return categoryMatch && (!query || entry.searchText.includes(query));
  });

  filtered.sort((left, right) => {
    if (request.sortMode === "japanese") return japaneseCollator.compare(left.item.japanese, right.item.japanese);
    if (request.sortMode === "category") return (left.item.categories?.[0] ?? "other").localeCompare(right.item.categories?.[0] ?? "other");
    if (request.sortMode === "difficulty") return (left.item.jlpt ?? "N5").localeCompare(right.item.jlpt ?? "N5");
    if (!query) return japaneseCollator.compare(left.item.japanese, right.item.japanese);
    return getRelevanceScore(right, query) - getRelevanceScore(left, query);
  });

  return {
    requestId: request.requestId,
    status: "ready",
    visibleEntries: filtered.slice(0, request.limit).map((entry) => entry.item),
    matchingEntryIds: filtered.map((entry) => entry.item.id).filter((id): id is string => Boolean(id)),
    total: filtered.length,
    totalEntries: index.entries.length,
    categoryCounts: index.categoryCounts,
  };
};

export const resolveVocabularyEntries = (
  index: VocabularySearchIndex,
  request: { requestId: number; entryIds: string[] },
): VocabularyResolveResponse => {
  const requested = new Set(request.entryIds);
  return {
    requestId: request.requestId,
    kind: "resolve",
    status: "ready",
    entries: index.entries.filter(({ item }) => item.id && requested.has(item.id)).map(({ item }) => item),
  };
};
