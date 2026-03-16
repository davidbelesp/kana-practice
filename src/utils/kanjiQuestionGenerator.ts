import type { KanjiChar } from "../data/kanji";
import type { QuizQuestion } from "../types/QuizTypes";

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getDistractors = (
  pool: KanjiChar[],
  count: number,
  exclude: KanjiChar[],
): KanjiChar[] => {
  const excludeChars = new Set(exclude.map((c) => c.char));
  const available = pool.filter((c) => !excludeChars.has(c.char));

  if (available.length <= count) return shuffleArray(available);

  const distractors: KanjiChar[] = [];
  const takenIndices = new Set<number>();

  while (distractors.length < count) {
    const idx = Math.floor(Math.random() * available.length);
    if (!takenIndices.has(idx)) {
      takenIndices.add(idx);
      distractors.push(available[idx]);
    }
  }
  return distractors;
};

export const generateKanjiQuestion = (pool: KanjiChar[]): QuizQuestion => {
  const target = getRandomItem(pool);
  const distractors = getDistractors(pool, 3, [target]);
  
  // Clean up meanings and use the first meaning
  const getCleanMeaning = (k: KanjiChar) => k.meaning.split(",")[0].trim();
  
  const options = shuffleArray([
    getCleanMeaning(target),
    ...distractors.map(getCleanMeaning),
  ]);

  return {
    type: "single-choice-romaji", // Reuse existing component logic which expects string prompts/options
    prompt: target.char,
    correctAnswer: getCleanMeaning(target),
    options,
    targets: [target.char],
  };
};

export const generateKanjiQuizDeck = (pool: KanjiChar[], maxCount: number): QuizQuestion[] => {
  if (!pool.length || maxCount <= 0) return [];
  
  const deck: QuizQuestion[] = [];
  const usedPrompts = new Set<string>();
  
  let failsafe = 0;
  while (deck.length < maxCount && failsafe < 1000) {
    const q = generateKanjiQuestion(pool);
    if (!usedPrompts.has(q.prompt)) {
      usedPrompts.add(q.prompt);
      deck.push(q);
      failsafe = 0;
    } else {
      failsafe++;
    }
  }
  
  return deck;
};
