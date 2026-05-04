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
const MASTERED_KEY = "kanas_mastered";

let statsCache: Record<string, KanaStat> | null = null;
let masteredCache: Record<string, boolean> | null = null;

const readStats = (): Record<string, KanaStat> => {
  if (statsCache !== null) return statsCache;
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return {};
  try {
    statsCache = JSON.parse(json);
    return statsCache ?? {};
  } catch {
    return {};
  }
};

const readMastered = (): Record<string, boolean> => {
  if (masteredCache !== null) return masteredCache;
  const json = localStorage.getItem(MASTERED_KEY);
  if (!json) return {};
  try {
    masteredCache = JSON.parse(json);
    return masteredCache ?? {};
  } catch {
    return {};
  }
};

const writeStats = (stats: Record<string, KanaStat>) => {
  statsCache = stats;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const writeMastered = (mastered: Record<string, boolean>) => {
  masteredCache = mastered;
  localStorage.setItem(MASTERED_KEY, JSON.stringify(mastered));
};

export const getKanaStats = (): Record<string, KanaStat> => readStats();

export const getMasteredStatus = (): Record<string, boolean> => readMastered();

export const saveMasteredStatus = (char: string) => {
  const mastered = readMastered();
  if (!mastered[char]) {
    mastered[char] = true;
    writeMastered(mastered);
  }
};

export const saveStatResult = (char: string, isCorrect: boolean) => {
  const stats = readStats();
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
    current.streak = Math.floor(current.streak * 0.9);
  }

  current.lastPlayed = Date.now();

  if (current.streak >= 100) {
    saveMasteredStatus(char);
  }

  stats[char] = current;
  writeStats(stats);
};

export const saveStatResultsBatch = (results: Array<{ char: string; isCorrect: boolean }>) => {
  const stats = readStats();
  const mastered = readMastered();
  const now = Date.now();

  for (const { char, isCorrect } of results) {
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
      current.streak = Math.floor(current.streak * 0.9);
    }

    current.lastPlayed = now;

    if (current.streak >= 100 && !mastered[char]) {
      mastered[char] = true;
    }

    stats[char] = current;
  }

  writeStats(stats);
  if (Object.keys(mastered).length !== Object.keys(readMastered()).length) {
    writeMastered(mastered);
  }
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

const getStatsAndMastered = (): { stats: Record<string, KanaStat>; mastered: Record<string, boolean> } => {
  return { stats: readStats(), mastered: readMastered() };
};

export const getTopStreaks = (limit: number = 5): KanaStat[] => {
  const { stats, mastered } = getStatsAndMastered();
  
  return Object.values(stats)
    .filter((s) => s.streak > 0 && s.streak < 100 && !mastered[s.char])
    .sort((a, b) => b.streak - a.streak)
    .slice(0, limit);
};

export const getMasteredKana = (): KanaStat[] => {
  const { stats, mastered } = getStatsAndMastered();

  return Object.values(stats)
    .filter((s) => s.streak >= 100 || mastered[s.char])
    .sort((a, b) => b.streak - a.streak);
};

//  Number stats 

export interface NumberGroupStat {
  correct: number;
  incorrect: number;
}

const NUMBER_STATS_KEY = "number_stats";

export function digitGroup(n: number): string {
  if (n < 10) return "1";
  if (n < 100) return "2";
  if (n < 1000) return "3";
  if (n < 10000) return "4";
  if (n < 100000) return "5";
  if (n < 1000000) return "6";
  return "7";
}

export const getNumberStats = (): Record<string, NumberGroupStat> => {
  const json = localStorage.getItem(NUMBER_STATS_KEY);
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
};

export const saveNumberResult = (n: number, isCorrect: boolean): void => {
  const stats = getNumberStats();
  const key = digitGroup(n);
  const current = stats[key] ?? { correct: 0, incorrect: 0 };
  if (isCorrect) current.correct++;
  else current.incorrect++;
  stats[key] = current;
  localStorage.setItem(NUMBER_STATS_KEY, JSON.stringify(stats));
};

export const getWeakestChars = (limit: number = 10, filterChars?: string[]): string[] => {
  const stats = getKanaStats();
  let allStats = Object.values(stats);

  if (filterChars && filterChars.length > 0) {
    const filterSet = new Set(filterChars);
    allStats = allStats.filter((s) => filterSet.has(s.char));
  }

  const sorted = allStats.sort((a, b) => {
    const scoreA = a.incorrect * 2 - a.correct - a.streak;
    const scoreB = b.incorrect * 2 - b.correct - b.streak;
    return scoreB - scoreA;
  });

  return sorted.slice(0, limit).map((s) => s.char);
};
