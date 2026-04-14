export interface Translation {
  lang: string;
  translation: string;
}

export interface VocabularyItem {
  japanese: string;
  hiragana: string;
  romaji: string;
  type: string;
  translation: Translation[];
  tags: string[];
  image?: string;
}
