export interface KanjiChar {
  char: string;
  radical: string;
  grade: number;
  furigana: Furigana;
  meaning: string;
}

export interface Furigana {
  kunyomi: string[];
  onyomi: string[];
}
