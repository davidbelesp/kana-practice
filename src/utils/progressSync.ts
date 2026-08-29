import type { GrammarCompletion, LearningSession, ProgressItem, ProgressSnapshot } from "../types/Progress";
import { grammarCompletionKey } from "./grammarCompletion.ts";

const itemKey = (domain: string, itemId: string) => `${domain}:${itemId}`;

const maxNumber = (...values: Array<number | undefined>) => {
  const finiteValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return finiteValues.length ? Math.max(...finiteValues) : 0;
};

const maxOptionalNumber = (...values: Array<number | undefined>) => {
  const value = maxNumber(...values);
  return value || undefined;
};

const maxString = (left?: string, right?: string) => {
  if (!left) return right;
  if (!right) return left;
  return left >= right ? left : right;
};

/**
 * Merge two copies of one progress item without allowing any progress field
 * to move backwards. The operation is commutative and idempotent, which keeps
 * repeated device syncs deterministic.
 */
export const mergeProgressItems = (local?: ProgressItem, remote?: ProgressItem): ProgressItem | undefined => {
  if (!local) return remote;
  if (!remote) return local;

  const mastered = Boolean(local.mastered || remote.mastered);
  return {
    domain: local.domain,
    itemId: local.itemId,
    correct: maxNumber(local.correct, remote.correct),
    incorrect: maxNumber(local.incorrect, remote.incorrect),
    streak: maxNumber(local.streak, remote.streak),
    masteryScore: Math.max(maxNumber(local.masteryScore, remote.masteryScore), mastered ? 100 : 0),
    lastTrainedAt: maxOptionalNumber(local.lastTrainedAt, remote.lastTrainedAt),
    masteredAt: maxOptionalNumber(local.masteredAt, remote.masteredAt),
    mastered,
  };
};

const mergeSessions = (local?: LearningSession, remote?: LearningSession): LearningSession | undefined => {
  if (!local) return remote;
  if (!remote) return local;
  return {
    id: local.id,
    domain: maxString(local.domain, remote.domain) as LearningSession["domain"],
    mode: maxString(local.mode, remote.mode) ?? local.mode,
    source: maxString(local.source, remote.source),
    startedAt: maxNumber(local.startedAt, remote.startedAt),
    completedAt: maxNumber(local.completedAt, remote.completedAt),
    total: maxNumber(local.total, remote.total),
    correct: maxNumber(local.correct, remote.correct),
    incorrect: maxNumber(local.incorrect, remote.incorrect),
    accuracy: maxNumber(local.accuracy, remote.accuracy),
  };
};

export const mergeProgressSnapshots = (
  local: ProgressSnapshot,
  remoteItems: ProgressItem[],
  remoteSessions: LearningSession[],
  remoteGrammarCompletions: GrammarCompletion[] = [],
): ProgressSnapshot => {
  const items = new Map<string, ProgressItem>(Object.entries(local.items));
  remoteItems.forEach((remote) => {
    const key = itemKey(remote.domain, remote.itemId);
    const merged = mergeProgressItems(items.get(key), remote);
    if (merged) items.set(key, merged);
  });

  const sessions = new Map<string, LearningSession>(Object.entries(local.sessions));
  remoteSessions.forEach((remote) => {
    const merged = mergeSessions(sessions.get(remote.id), remote);
    if (merged) sessions.set(remote.id, merged);
  });

  const grammarCompletions = new Map<string, GrammarCompletion>(Object.entries(local.grammarCompletions ?? {}));
  remoteGrammarCompletions.forEach((remote) => {
    const key = grammarCompletionKey(remote.trackId, remote.lessonId, remote.partId);
    const existing = grammarCompletions.get(key);
    if (!existing || remote.completedAt > existing.completedAt) grammarCompletions.set(key, remote);
  });

  return {
    version: 1,
    updatedAt: Date.now(),
    items: Object.fromEntries(items),
    sessions: Object.fromEntries(sessions),
    grammarCompletions: Object.fromEntries(grammarCompletions),
  };
};
