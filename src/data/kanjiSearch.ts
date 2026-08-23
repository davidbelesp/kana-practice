import { kanjiLevels, type KanjiLevelId } from "./kanjiManifest";
import type { KanjiChar } from "./kanjiTypes";

export type KanjiSearchRecord = {
  kanji: KanjiChar;
  level: KanjiLevelId;
  englishMeaning: string;
  localizedMeaning: string;
  searchText: string;
};

export type KanjiSearchLoadResult = {
  records: KanjiSearchRecord[];
  failedLevels: KanjiLevelId[];
};

type KanjiSearchSource = {
  kanji: KanjiChar;
  level: KanjiLevelId;
};

type LocalizeMeaning = (character: string, fallback: string) => string;

let sourcePromise: Promise<{ sources: KanjiSearchSource[]; failedLevels: KanjiLevelId[] }> | null = null;
const localizedIndexCache = new Map<string, Promise<KanjiSearchLoadResult>>();

export const normalizeKanjiSearchText = (value: string) => value
  .normalize("NFKC")
  .toLocaleLowerCase()
  .replace(/[ーｰ]/g, "")
  .replace(/[\s\-‐‑‒–—_.,/\\()[\]{}'\"]+/g, "")
  .trim();

const loadSearchSources = async () => {
  if (!sourcePromise) {
    sourcePromise = Promise.allSettled(
      kanjiLevels.map(async (descriptor) => ({
        level: descriptor.level,
        data: await descriptor.load(),
      })),
    ).then((results) => {
      const sources: KanjiSearchSource[] = [];
      const failedLevels: KanjiLevelId[] = [];

      results.forEach((result, index) => {
        const level = kanjiLevels[index].level;
        if (result.status === "fulfilled") {
          result.value.data.forEach((kanji) => sources.push({ kanji, level }));
        } else {
          failedLevels.push(level);
        }
      });

      return { sources, failedLevels };
    });
  }

  return sourcePromise;
};

export const loadKanjiSearchIndex = (language: string, localizeMeaning: LocalizeMeaning) => {
  const cached = localizedIndexCache.get(language);
  if (cached) return cached;

  const promise = loadSearchSources().then(({ sources, failedLevels }) => ({
    failedLevels,
    records: sources.map(({ kanji, level }) => {
      const localizedMeaning = localizeMeaning(kanji.char, kanji.meaning);
      const searchableFields = [
        kanji.char,
        kanji.meaning,
        localizedMeaning,
        kanji.radical,
        ...kanji.furigana.kunyomi,
        ...kanji.furigana.onyomi,
        level,
      ];

      return {
        kanji,
        level,
        englishMeaning: kanji.meaning,
        localizedMeaning,
        searchText: normalizeKanjiSearchText(searchableFields.join(" ")),
      };
    }),
  }));

  localizedIndexCache.set(language, promise);
  return promise;
};

export const resetKanjiSearchIndex = () => {
  sourcePromise = null;
  localizedIndexCache.clear();
};

export const searchKanjiRecords = (records: KanjiSearchRecord[], query: string, limit = 8) => {
  const normalizedQuery = normalizeKanjiSearchText(query);
  if (!normalizedQuery) return [];

  return records
    .map((record, index) => {
      const character = normalizeKanjiSearchText(record.kanji.char);
      const fields = [
        normalizeKanjiSearchText(record.localizedMeaning),
        normalizeKanjiSearchText(record.englishMeaning),
        ...record.kanji.furigana.kunyomi.map(normalizeKanjiSearchText),
        ...record.kanji.furigana.onyomi.map(normalizeKanjiSearchText),
        normalizeKanjiSearchText(record.kanji.radical),
      ];
      const isExactCharacter = character === normalizedQuery;
      const startsField = fields.some((field) => field.startsWith(normalizedQuery));
      const containsField = fields.some((field) => field.includes(normalizedQuery));
      const score = isExactCharacter ? 0 : startsField ? 10 : containsField ? 20 : record.searchText.includes(normalizedQuery) ? 30 : 40;

      return { record, score, index };
    })
    .filter(({ score }) => score < 40)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ record }) => record);
};
