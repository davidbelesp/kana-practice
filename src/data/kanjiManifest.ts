import type { KanjiChar } from "./kanjiTypes";
import { kanjiCharacterManifest } from "./kanjiCharacterManifest";

export type KanjiLevelId = "N5" | "N4" | "N3" | "N2" | "N1";

export interface KanjiLevelDescriptor {
  level: KanjiLevelId;
  count: number;
  characters: readonly string[];
  load: () => Promise<KanjiChar[]>;
}

export const kanjiLevels: readonly KanjiLevelDescriptor[] = [
  { level: "N5", count: 101, characters: kanjiCharacterManifest.N5, load: () => import("./kanji-levels/n5").then((module) => module.n5kanjiData) },
  { level: "N4", count: 166, characters: kanjiCharacterManifest.N4, load: () => import("./kanji-levels/n4").then((module) => module.n4kanjiData) },
  { level: "N3", count: 367, characters: kanjiCharacterManifest.N3, load: () => import("./kanji-levels/n3").then((module) => module.n3kanjiData) },
  { level: "N2", count: 367, characters: kanjiCharacterManifest.N2, load: () => import("./kanji-levels/n2").then((module) => module.n2kanjiData) },
  { level: "N1", count: 1157, characters: kanjiCharacterManifest.N1, load: () => import("./kanji-levels/n1").then((module) => module.n1kanjiData) },
];

export const kanjiLevelCounts = Object.fromEntries(
  kanjiLevels.map(({ level, count }) => [level, count]),
) as Record<KanjiLevelId, number>;

export const totalKanjiCount = kanjiLevels.reduce((total, level) => total + level.count, 0);
