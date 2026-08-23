import type { Translation, VocabularyItem } from "../types/Vocabulary";
import type { VocabularyQuizQuestion } from "../types/VocabularyQuiz";

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export const getVocabularyMeaning = (item: VocabularyItem, language: string): string | undefined => {
  const translation = item.translation.find((entry: Translation) => entry.lang === language)
    ?? item.translation.find((entry: Translation) => entry.lang === "en")
    ?? item.translation[0];
  const meaning = translation?.translation?.trim();
  return meaning || undefined;
};

export const generateVocabularyQuizDeck = (
  entries: VocabularyItem[],
  maxQuestions: number,
  language: string,
): VocabularyQuizQuestion[] => {
  const eligibleEntries = entries.filter((entry): entry is VocabularyItem & { id: string } => Boolean(entry.id && getVocabularyMeaning(entry, language)));
  const meanings = Array.from(new Set(eligibleEntries.map((entry) => getVocabularyMeaning(entry, language)).filter((meaning): meaning is string => Boolean(meaning))));

  if (meanings.length < 4) return [];

  const meaningPool = new Set(meanings);
  return shuffle(eligibleEntries)
    .slice(0, Math.min(maxQuestions, eligibleEntries.length))
    .map((entry) => {
      const correctAnswer = getVocabularyMeaning(entry, language) as string;
      const distractors = shuffle(Array.from(meaningPool).filter((meaning) => meaning !== correctAnswer)).slice(0, 3);
      return {
        entryId: entry.id,
        japanese: entry.japanese,
        hiragana: entry.hiragana,
        romaji: entry.romaji,
        correctAnswer,
        options: shuffle([correctAnswer, ...distractors]),
      };
    });
};
