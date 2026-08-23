export type LearningDomain = "kana" | "kanji" | "vocabulary" | "numbers" | "grammar";

export interface ProgressItem {
  domain: LearningDomain;
  itemId: string;
  correct: number;
  incorrect: number;
  streak: number;
  masteryScore: number;
  lastTrainedAt?: number;
  masteredAt?: number;
}

export interface LearningSession {
  id: string;
  domain: LearningDomain;
  mode: string;
  source?: string;
  startedAt: number;
  completedAt: number;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface ProgressSnapshot {
  version: 1;
  updatedAt: number;
  items: Record<string, ProgressItem>;
  sessions: Record<string, LearningSession>;
}

export interface TrainingRecommendation {
  domain: LearningDomain;
  titleKey: string;
  descriptionKey: string;
  actionPath: string;
  priority: number;
  lastTrainedAt?: number;
  available: boolean;
}

export interface ProgressExport {
  exportedAt: string;
  snapshot: ProgressSnapshot;
  legacyKeys: Record<string, unknown>;
}

export interface ProgressRepository {
  getSnapshot: () => Promise<ProgressSnapshot>;
  recordItemProgress: (item: ProgressItem) => Promise<void>;
  recordSession: (session: LearningSession) => Promise<void>;
  sync: () => Promise<{ status: "synced" | "offline" | "error"; error?: string }>;
  exportData: () => Promise<ProgressExport>;
}
