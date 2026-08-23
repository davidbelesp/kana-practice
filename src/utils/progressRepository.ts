import { useSyncExternalStore } from "react";
import type {
  LearningDomain,
  LearningSession,
  ProgressExport,
  ProgressItem,
  ProgressSnapshot,
  TrainingRecommendation,
} from "../types/Progress";

const STORAGE_KEY = "progress_snapshot_v1";
const MIGRATION_KEY = "progress_snapshot_migrated_v1";
const CHANGE_EVENT = "kana-progress-updated";
const PENDING_SYNC_KEY = "progress_sync_pending_v1";

const EMPTY_SNAPSHOT = (): ProgressSnapshot => ({
  version: 1,
  updatedAt: Date.now(),
  items: {},
  sessions: {},
});

let snapshotCache: ProgressSnapshot | null = null;

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const emitChange = () => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PENDING_SYNC_KEY, "1");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
};

const itemKey = (domain: LearningDomain, itemId: string) => `${domain}:${itemId}`;

const masteryScore = (correct: number, incorrect: number, streak: number) => {
  const attempts = correct + incorrect;
  if (!attempts) return 0;
  return Math.min(100, Math.round((correct / attempts) * 70 + Math.min(streak / 20, 1) * 30));
};

const migrateLegacy = (): ProgressSnapshot => {
  const next = EMPTY_SNAPSHOT();
  const legacyKana = readJson<Record<string, { char: string; correct: number; incorrect: number; streak: number; lastPlayed?: number }>>("kana_stats", {});
  const mastered = readJson<Record<string, boolean>>("kanas_mastered", {});
  const history = readJson<Array<{ timestamp: number; correct: number; wrong: number; total: number }>>("quiz_history", []);
  const numbers = readJson<Record<string, { correct: number; incorrect: number }>>("number_stats", {});

  Object.values(legacyKana).forEach((stat) => {
    const correct = stat.correct ?? 0;
    const incorrect = stat.incorrect ?? 0;
    const streak = stat.streak ?? 0;
    next.items[itemKey("kana", stat.char)] = {
      domain: "kana",
      itemId: stat.char,
      correct,
      incorrect,
      streak,
      masteryScore: mastered[stat.char] ? 100 : masteryScore(correct, incorrect, streak),
      lastTrainedAt: stat.lastPlayed,
      masteredAt: mastered[stat.char] ? stat.lastPlayed : undefined,
    };
  });

  history.forEach((result, index) => {
    const id = `legacy-kana-${result.timestamp}-${index}`;
    next.sessions[id] = {
      id,
      domain: "kana",
      mode: "legacy",
      source: "quiz_history",
      startedAt: result.timestamp,
      completedAt: result.timestamp,
      total: result.total ?? result.correct + result.wrong,
      correct: result.correct,
      incorrect: result.wrong,
      accuracy: result.total ? Math.round((result.correct / result.total) * 100) : 0,
    };
  });

  Object.entries(numbers).forEach(([range, stat]) => {
    const correct = stat.correct ?? 0;
    const incorrect = stat.incorrect ?? 0;
    if (correct + incorrect === 0) return;
    next.items[itemKey("numbers", `range-${range}`)] = {
      domain: "numbers",
      itemId: `range-${range}`,
      correct,
      incorrect,
      streak: 0,
      masteryScore: masteryScore(correct, incorrect, 0),
    };
  });

  return next;
};

const readSnapshot = (): ProgressSnapshot => {
  if (snapshotCache) return snapshotCache;
  const stored = readJson<ProgressSnapshot | null>(STORAGE_KEY, null);
  if (stored?.version === 1 && stored.items && stored.sessions) {
    snapshotCache = stored;
    return stored;
  }

  const migrated = migrateLegacy();
  snapshotCache = migrated;
  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.setItem(MIGRATION_KEY, "1");
  }
  return migrated;
};

const writeSnapshot = (snapshot: ProgressSnapshot) => {
  snapshotCache = { ...snapshot, updatedAt: Date.now() };
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotCache));
  emitChange();
};

export const getProgressSnapshot = (): ProgressSnapshot => readSnapshot();

export const replaceProgressSnapshot = (snapshot: ProgressSnapshot) => {
  writeSnapshot({ ...snapshot, version: 1, updatedAt: Date.now() });
};

const SYNC_BASELINE_KEY = "progress_sync_baseline_v1";
export const getProgressSyncBaseline = (): ProgressSnapshot | null => readJson<ProgressSnapshot | null>(SYNC_BASELINE_KEY, null);
export const setProgressSyncBaseline = (snapshot: ProgressSnapshot) => {
  if (canUseStorage()) window.localStorage.setItem(SYNC_BASELINE_KEY, JSON.stringify(snapshot));
};
export const clearPendingProgressSync = () => {
  if (canUseStorage()) window.localStorage.removeItem(PENDING_SYNC_KEY);
};

export const useProgressSnapshot = () => useSyncExternalStore(
  (onStoreChange) => {
    if (typeof window === "undefined") return () => undefined;
    window.addEventListener(CHANGE_EVENT, onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  },
  getProgressSnapshot,
  getProgressSnapshot,
);

export const recordItemProgress = (item: Omit<ProgressItem, "masteryScore"> & { masteryScore?: number }) => {
  const snapshot = getProgressSnapshot();
  const key = itemKey(item.domain, item.itemId);
  const previous = snapshot.items[key];
  const correct = (previous?.correct ?? 0) + item.correct;
  const incorrect = (previous?.incorrect ?? 0) + item.incorrect;
  const streak = item.streak > 0 ? item.streak : previous?.streak ?? 0;
  const lastTrainedAt = Math.max(previous?.lastTrainedAt ?? 0, item.lastTrainedAt ?? 0) || undefined;
  const masteredAt = item.masteredAt ?? previous?.masteredAt;
  writeSnapshot({
    ...snapshot,
    items: {
      ...snapshot.items,
      [key]: {
        domain: item.domain,
        itemId: item.itemId,
        correct,
        incorrect,
        streak,
        masteryScore: item.masteryScore ?? masteryScore(correct, incorrect, streak),
        lastTrainedAt,
        masteredAt,
      },
    },
  });
};

export const recordItemResults = (
  domain: LearningDomain,
  results: Array<{ itemId: string; correct: boolean }>,
  trainedAt = Date.now(),
) => {
  if (!results.length) return;
  const snapshot = getProgressSnapshot();
  const items = { ...snapshot.items };
  results.forEach(({ itemId, correct }) => {
    const key = itemKey(domain, itemId);
    const previous = items[key] ?? { domain, itemId, correct: 0, incorrect: 0, streak: 0, masteryScore: 0 };
    const nextCorrect = previous.correct + (correct ? 1 : 0);
    const nextIncorrect = previous.incorrect + (correct ? 0 : 1);
    const nextStreak = correct ? previous.streak + 1 : Math.floor(previous.streak * 0.9);
    const nextMastery = masteryScore(nextCorrect, nextIncorrect, nextStreak);
    items[key] = {
      ...previous,
      correct: nextCorrect,
      incorrect: nextIncorrect,
      streak: nextStreak,
      masteryScore: nextMastery,
      lastTrainedAt: trainedAt,
      masteredAt: nextMastery >= 85 ? previous.masteredAt ?? trainedAt : previous.masteredAt,
    };
  });
  writeSnapshot({ ...snapshot, items });
};

export const recordSession = (session: LearningSession) => {
  const snapshot = getProgressSnapshot();
  if (snapshot.sessions[session.id]) return;
  writeSnapshot({ ...snapshot, sessions: { ...snapshot.sessions, [session.id]: session } });
};

export const recordCompletedSession = (args: {
  id: string;
  domain: LearningDomain;
  mode: string;
  source?: string;
  startedAt?: number;
  total: number;
  correct: number;
}) => {
  const completedAt = Date.now();
  recordSession({
    id: args.id,
    domain: args.domain,
    mode: args.mode,
    source: args.source,
    startedAt: args.startedAt ?? completedAt,
    completedAt,
    total: args.total,
    correct: args.correct,
    incorrect: Math.max(args.total - args.correct, 0),
    accuracy: args.total ? Math.round((args.correct / args.total) * 100) : 0,
  });
};

const domainLabel = (domain: LearningDomain) => domain;

export const getTrainingRecommendations = (now = Date.now()): TrainingRecommendation[] => {
  const snapshot = getProgressSnapshot();
  const activeDomains: Array<{ domain: LearningDomain; actionPath: string; titleKey: string; descriptionKey: string; available: boolean }> = [
    { domain: "kana", actionPath: "/practice?mode=weakest", titleKey: "recommendations.kanaTitle", descriptionKey: "recommendations.kanaDescription", available: true },
    { domain: "kanji", actionPath: "/kanji", titleKey: "recommendations.kanjiTitle", descriptionKey: "recommendations.kanjiDescription", available: true },
    { domain: "vocabulary", actionPath: "/vocabulary", titleKey: "recommendations.vocabularyTitle", descriptionKey: "recommendations.vocabularyDescription", available: true },
    { domain: "numbers", actionPath: "/numbers", titleKey: "recommendations.numbersTitle", descriptionKey: "recommendations.numbersDescription", available: true },
    { domain: "grammar", actionPath: "/grammar", titleKey: "recommendations.grammarTitle", descriptionKey: "recommendations.grammarDescription", available: false },
  ];

  return activeDomains
    .filter((entry) => entry.available)
    .map((entry) => {
      const items = Object.values(snapshot.items).filter((item) => item.domain === entry.domain);
      const sessions = Object.values(snapshot.sessions).filter((session) => session.domain === entry.domain);
      const lastTrainedAt = Math.max(...items.map((item) => item.lastTrainedAt ?? 0), ...sessions.map((session) => session.completedAt), 0) || undefined;
      const totalCorrect = items.reduce((sum, item) => sum + item.correct, 0) + sessions.reduce((sum, session) => sum + session.correct, 0);
      const totalIncorrect = items.reduce((sum, item) => sum + item.incorrect, 0) + sessions.reduce((sum, session) => sum + session.incorrect, 0);
      const accuracy = totalCorrect + totalIncorrect ? totalCorrect / (totalCorrect + totalIncorrect) : 0;
      const daysSince = lastTrainedAt ? (now - lastTrainedAt) / 86400000 : Infinity;
      const priority = !lastTrainedAt ? 1000 : daysSince >= 7 ? 800 + Math.min(100, Math.floor(daysSince)) : accuracy < 0.7 ? 600 : totalIncorrect > 0 ? 300 : 100;
      return { ...entry, priority, lastTrainedAt, domain: domainLabel(entry.domain) as LearningDomain };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
};

export const exportProgress = (): ProgressExport => ({
  exportedAt: new Date().toISOString(),
  snapshot: getProgressSnapshot(),
  legacyKeys: {
    app_settings: readJson("app_settings", null),
    kana_stats: readJson("kana_stats", {}),
    kanas_mastered: readJson("kanas_mastered", {}),
    quiz_history: readJson("quiz_history", []),
    number_stats: readJson("number_stats", {}),
  },
});

export const clearLocalProgress = () => {
  if (!canUseStorage()) return;
  [STORAGE_KEY, MIGRATION_KEY, SYNC_BASELINE_KEY, PENDING_SYNC_KEY, "kana_stats", "kanas_mastered", "quiz_history", "number_stats"].forEach((key) => window.localStorage.removeItem(key));
  snapshotCache = EMPTY_SNAPSHOT();
  emitChange();
  window.localStorage.removeItem(PENDING_SYNC_KEY);
};

export const getDomainItems = (domain: LearningDomain) => Object.values(getProgressSnapshot().items).filter((item) => item.domain === domain);
export const getDomainSessions = (domain: LearningDomain) => Object.values(getProgressSnapshot().sessions).filter((session) => session.domain === domain);
