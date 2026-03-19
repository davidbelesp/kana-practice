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

export const generateQuestion = (
  pool: KanaChar[],
  allowedTypes?: QuestionType[],
): QuizQuestion => {
  // Determine the valid type pool
  const validTypes: QuestionType[] =
    allowedTypes && allowedTypes.length > 0
      ? allowedTypes
      : [
          "single-choice-romaji",
          "single-choice-kana",
          "sequence-order",
          "pair-match",
          "drawing-kana",
          "listening-choice",
        ];

  // Pick a random type from the allowed set
  let type: QuestionType =
    validTypes[Math.floor(Math.random() * validTypes.length)];

  // Fallback if pool is too small for complex types
  if (pool.length < 3) {
    const simpleTypes = validTypes.filter(
      (t) =>
        t === "single-choice-romaji" ||
        t === "single-choice-kana" ||
        t === "drawing-kana" ||
        t === "listening-choice",
    );
    type =
      simpleTypes.length > 0
        ? simpleTypes[Math.floor(Math.random() * simpleTypes.length)]
        : "single-choice-romaji";
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

      if (pool.length < length) {
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

      const optionPool = [...sequence, ...getDistractors(pool, 3, sequence)];
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
      let c1 = getRandomItem(pool);
      let c2 = getRandomItem(pool);
      if (pool.length >= 2) {
        while (c1.char === c2.char) {
          c2 = getRandomItem(pool);
        }
      }

      const targetStr = c1.char + c2.char;
      const targetRomaji = c1.romaji + c2.romaji;

      const distractors = new Set<string>();
      if (c1.char !== c2.char) {
        distractors.add(c2.char + c1.char);
      }

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

    case "drawing-kana": {
      const target = getRandomItem(pool);
      return {
        type,
        prompt: target.romaji,
        correctAnswer: target.char,
        options: [],
        targets: [target.char],
      };
    }

    case "listening-choice": {
      // Create a 3-character word from the pool
      const length = 3;
      const sequence: KanaChar[] = [];
      const usedIndices = new Set<number>();

      if (pool.length < length) {
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

      const correctWord = sequence.map((c) => c.char).join("");
      const correctWordRomaji = sequence.map((c) => c.romaji).join("");
      
      const distractors = new Set<string>();
      let safety = 0;
      
      // Try to create distractors by shuffling the chosen sequence
      while (distractors.size < 3 && safety < 50) {
        safety++;
        const shuffled = shuffleArray([...sequence]).map((c) => c.char).join("");
        if (shuffled !== correctWord) {
          distractors.add(shuffled);
        }
      }

      // Fallback if not enough unique permutations (e.g. AAB)
      while (distractors.size < 3 && safety < 100) {
        safety++;
        const randomWordSeq = [];
        for (let i = 0; i < length; i++) randomWordSeq.push(getRandomItem(pool).char);
        const randomWord = randomWordSeq.join("");
        if (randomWord !== correctWord && !distractors.has(randomWord)) {
          distractors.add(randomWord);
        }
      }

      const options = shuffleArray([
        correctWord,
        ...Array.from(distractors).slice(0, 3),
      ]);

      return {
        type,
        prompt: correctWord, // Used for TTS
        correctAnswer: correctWord,
        options,
        targets: sequence.map((c) => c.char),
        hint: correctWordRomaji,
      };
    }
  }

  // Fallback default
  const f = pool[0];
  return {
    type: "single-choice-romaji",
    prompt: f.char,
    correctAnswer: f.romaji,
    options: [f.romaji],
    targets: [f.char],
  };
};

export const generateQuizDeck = (
  pool: KanaChar[],
  maxCount: number,
  allowedTypes?: QuestionType[],
): QuizQuestion[] => {
  if (!pool.length || maxCount <= 0) return [];

  const deck: QuizQuestion[] = [];
  const usedPrompts = new Set<string>();

  let failsafe = 0;
  while (deck.length < maxCount && failsafe < 1000) {
    const q = generateQuestion(pool, allowedTypes);
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
