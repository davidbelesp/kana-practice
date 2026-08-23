import { n5kanjiData } from "./kanji-levels/n5";
import { n4kanjiData } from "./kanji-levels/n4";
import { n3kanjiData } from "./kanji-levels/n3";
import { n2kanjiData } from "./kanji-levels/n2";
import { n1kanjiData } from "./kanji-levels/n1";
import type { KanjiChar } from "./kanjiTypes";

export type { KanjiChar, Furigana } from "./kanjiTypes";
export { n5kanjiData } from "./kanji-levels/n5";
export { n4kanjiData } from "./kanji-levels/n4";
export { n3kanjiData } from "./kanji-levels/n3";
export { n2kanjiData } from "./kanji-levels/n2";
export { n1kanjiData } from "./kanji-levels/n1";

export const allKanjiData: KanjiChar[] = [
  ...n5kanjiData,
  ...n4kanjiData,
  ...n3kanjiData,
  ...n2kanjiData,
  ...n1kanjiData,
];
