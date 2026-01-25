export type QuestionType =
  | "single-choice-romaji" // Type 1: Kana -> Romaji
  | "single-choice-kana" // Type 2: Romaji -> Kana
  | "sequence-order" // Type 3: Romaji word -> Order chars
  | "pair-match"; // Type 4: Romaji word -> Select correct Kana pair

export interface QuizQuestion {
  type: QuestionType;
  prompt: string; 
  correctAnswer: string | string[]; // String for choices, array for sequence
  options: string[]; // Choices for Type 1, 2, 4. Pool of chars for Type 3.
  targets: string[]; // The actual kana characters being tested
}
