export const MIN_KANA_MASTERY_THRESHOLD = 10;
export const MAX_KANA_MASTERY_THRESHOLD = 100;

export type KanaMasteryState = "level-0" | "level-1" | "level-2" | "level-3" | "level-4" | "mastered";

export const normalizeKanaMasteryThreshold = (value: number): number => {
  if (!Number.isFinite(value)) return MAX_KANA_MASTERY_THRESHOLD;
  return Math.min(MAX_KANA_MASTERY_THRESHOLD, Math.max(MIN_KANA_MASTERY_THRESHOLD, value));
};

/** The visible card progress source is the kana streak, capped to the 0–100 range. */
export const getKanaProgressScore = (streak: number): number =>
  Number.isFinite(streak) ? Math.min(100, Math.max(0, streak)) : 0;

/** Converts the streak into progress toward the configured mastery target. */
export const getKanaProgressPercent = (streak: number, threshold: number): number =>
  Math.min(100, (getKanaProgressScore(streak) / normalizeKanaMasteryThreshold(threshold)) * 100);

export const getKanaMasteryState = (score: number, threshold: number): KanaMasteryState => {
  const safeScore = Number.isFinite(score) ? Math.max(0, score) : 0;
  const safeThreshold = normalizeKanaMasteryThreshold(threshold);
  if (safeScore <= 0) return "level-0";
  if (safeScore >= safeThreshold) return "mastered";
  return `level-${Math.min(4, Math.ceil((safeScore / safeThreshold) * 4))}` as KanaMasteryState;
};

export const isKanaMastered = (score: number, threshold: number): boolean =>
  getKanaMasteryState(score, threshold) === "mastered";
