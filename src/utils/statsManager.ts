export interface KanaStat {
  char: string;
  correct: number;
  incorrect: number;
  streak: number;
  lastPlayed?: number;
}

export interface QuizResult {
  timestamp: number;
  correct: number;
  wrong: number;
  total: number;
}

const STORAGE_KEY = "kana_stats";
const HISTORY_KEY = "quiz_history";

export const getKanaStats = (): Record<string, KanaStat> => {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
};

const saveStats = (stats: Record<string, KanaStat>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const saveStatResult = (char: string, isCorrect: boolean) => {
  const stats = getKanaStats();
  const current = stats[char] || {
    char,
    correct: 0,
    incorrect: 0,
    streak: 0,
  };

  if (isCorrect) {
    current.correct++;
    current.streak++;
  } else {
    current.incorrect++;
    current.streak = 0;
  }

  current.lastPlayed = Date.now();

  stats[char] = current;
  saveStats(stats);
};

export const getHistory = (): QuizResult[] => {
  const json = localStorage.getItem(HISTORY_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};

export const saveQuizHistory = (correct: number, wrong: number) => {
  const history = getHistory();
  const result: QuizResult = {
    timestamp: Date.now(),
    correct,
    wrong,
    total: correct + wrong,
  };
  history.unshift(result);
  if (history.length > 100) history.pop();

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getAggregates = () => {
  const history = getHistory();
  const totalQuizzes = history.length;
  const totalData = history.reduce(
    (acc, curr) => ({
      correct: acc.correct + curr.correct,
      wrong: acc.wrong + curr.wrong,
    }),
    { correct: 0, wrong: 0 },
  );

  return {
    totalQuizzes,
    totalCorrect: totalData.correct,
    totalWrong: totalData.wrong,
    globalAccuracy:
      totalData.correct + totalData.wrong > 0
        ? Math.round(
            (totalData.correct / (totalData.correct + totalData.wrong)) * 100,
          )
        : 0,
  };
};

export const getTopStreaks = (limit: number = 5): KanaStat[] => {
  const stats = getKanaStats();
  return Object.values(stats)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, limit)
    .filter((s) => s.streak > 0);
};

export const getWeakestChars = (limit: number = 10): string[] => {
  const stats = getKanaStats();
  const allStats = Object.values(stats);

  const sorted = allStats.sort((a, b) => {
    const scoreA = a.incorrect * 2 - a.correct - a.streak;
    const scoreB = b.incorrect * 2 - b.correct - b.streak;
    return scoreB - scoreA;
  });

  return sorted.slice(0, limit).map((s) => s.char);
};
