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
  id?: string;
  group?: string;
  categories?: string[];
  jlpt?: string;
  frequency?: number;
  fields?: string[];
  priority?: string[];
  loanword?: boolean;
  usage?: string[];
  examples?: Array<{ japanese: string; translation: Translation[] }>;
  source?: string;
}
