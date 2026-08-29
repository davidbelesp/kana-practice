import type { GrammarCompletion, ProgressSnapshot } from "../types/Progress";

export const GRAMMAR_COMPLETION_PERCENT = 80;

export const grammarCompletionKey = (trackId: string, lessonId: string, partId: string) => `${trackId}:${lessonId}:${partId}`;

export const isGrammarPassingScore = (correct: number, total: number) => total > 0 && (correct / total) * 100 >= GRAMMAR_COMPLETION_PERCENT;

export const isGrammarPartCompleted = (snapshot: ProgressSnapshot, trackId: string, lessonId: string, partId: string) => Boolean(snapshot.grammarCompletions[grammarCompletionKey(trackId, lessonId, partId)]);

export const grammarCompletionEntry = (trackId: string, lessonId: string, partId: string, completedAt = Date.now()): GrammarCompletion => ({ trackId, lessonId, partId, completedAt });
