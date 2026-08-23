export interface VocabularyQuizState {
  entryIds: string[];
  from: "/vocabulary";
}

export interface VocabularyQuizQuestion {
  entryId: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  correctAnswer: string;
  options: string[];
}
