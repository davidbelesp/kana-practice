import type { KanaChar } from "../data/hiragana";
import type { QuestionType, QuizQuestion } from "../types/QuizTypes";

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

// Get N random distractors that are not equal to excluded items
const getDistractors = (
  pool: KanaChar[],
  count: number,
  exclude: KanaChar[],
): KanaChar[] => {
  const excludeChars = new Set(exclude.map((c) => c.char));
  const available = pool.filter((c) => !excludeChars.has(c.char));

  // If pool is too small, we might repeat or just return what we have
  if (available.length <= count) return shuffleArray(available);

  const distractors: KanaChar[] = [];
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

export const generateQuestion = (pool: KanaChar[]): QuizQuestion => {
  // Randomly select question type
  // Uniform distribution logic for now, or weighted if preferred
  const rand = Math.random();
  let type: QuestionType = "single-choice-romaji";

  if (rand < 0.25) type = "single-choice-romaji";
  else if (rand < 0.5) type = "single-choice-kana";
  else if (rand < 0.75) type = "sequence-order";
  else type = "pair-match";

  // Fallback if pool is too small for complex types
  if (pool.length < 3) {
    type = Math.random() > 0.5 ? "single-choice-romaji" : "single-choice-kana";
  }

  switch (type) {
    case "single-choice-romaji": {
      const target = getRandomItem(pool);
      const distractors = getDistractors(pool, 3, [target]);
      const options = shuffleArray([
        target.romaji,
        ...distractors.map((d) => d.romaji),
      ]);

      return {
        type,
        prompt: target.char,
        correctAnswer: target.romaji,
        options,
        targets: [target.char],
      };
    }

    case "single-choice-kana": {
      const target = getRandomItem(pool);
      const distractors = getDistractors(pool, 3, [target]);
      const options = shuffleArray([
        target.char,
        ...distractors.map((d) => d.char),
      ]);

      return {
        type,
        prompt: target.romaji,
        correctAnswer: target.char,
        options,
        targets: [target.char],
      };
    }

    case "sequence-order": {
      // Pick 3 UNIQUE random chars
      const length = 3;
      const sequence: KanaChar[] = [];
      const usedIndices = new Set<number>();

      // Safety break: if pool is small (should be handled by outer check but safe to be defensive)
      if (pool.length < length) {
        // Fallback to allowing duplicates if pool is tiny
        for (let i = 0; i < length; i++) sequence.push(getRandomItem(pool));
      } else {
        while (sequence.length < length) {
          const idx = Math.floor(Math.random() * pool.length);
          if (!usedIndices.has(idx)) {
            usedIndices.add(idx);
            sequence.push(pool[idx]);
          }
        }
      }

      const prompt = sequence.map((c) => c.romaji).join("");
      const correctAnswer = sequence.map((c) => c.char);

      // Distractors must NOT match the sequence order
      const optionPool = [...sequence, ...getDistractors(pool, 3, sequence)];
      // Ensure options are unique string representation just in case
      const uniqueOptions = Array.from(new Set(optionPool.map((c) => c.char)));

      const options = shuffleArray(uniqueOptions);

      return {
        type,
        prompt,
        correctAnswer,
        options,
        targets: sequence.map((c) => c.char),
      };
    }

    case "pair-match": {
      // Pick 2 UNIQUE random chars
      let c1 = getRandomItem(pool);
      let c2 = getRandomItem(pool);
      // Ensure c1 != c2 if possible
      if (pool.length >= 2) {
        while (c1.char === c2.char) {
          c2 = getRandomItem(pool);
        }
      }

      const targetStr = c1.char + c2.char;
      const targetRomaji = c1.romaji + c2.romaji;

      // Generate distractors
      const distractors = new Set<string>();

      // 1. Reversed pair (if different)
      if (c1.char !== c2.char) {
        distractors.add(c2.char + c1.char);
      }

      // Fill remaining with random pairs
      let safety = 0;
      while (distractors.size < 3 && safety < 50) {
        safety++;
        const x = getRandomItem(pool);
        const y = getRandomItem(pool);
        const pair = x.char + y.char;

        if (pair !== targetStr) {
          distractors.add(pair);
        }
      }

      const finalOptions = shuffleArray([
        targetStr,
        ...Array.from(distractors).slice(0, 3),
      ]);

      return {
        type,
        prompt: targetRomaji,
        correctAnswer: targetStr,
        options: finalOptions,
        targets: [c1.char, c2.char],
      };
    }
  }
};
