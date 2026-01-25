export type KanaType = "gojuon" | "dakuon" | "handakuon" | "yoon";

export interface KanaChar {
  char: string;
  romaji: string;
  type: KanaType;
  isEmpty?: boolean;
}

export const hiraganaData: KanaChar[] = [
  // Gojuon (Basic)
  { char: "あ", romaji: "a", type: "gojuon" },
  { char: "い", romaji: "i", type: "gojuon" },
  { char: "う", romaji: "u", type: "gojuon" },
  { char: "え", romaji: "e", type: "gojuon" },
  { char: "お", romaji: "o", type: "gojuon" },
  { char: "か", romaji: "ka", type: "gojuon" },
  { char: "き", romaji: "ki", type: "gojuon" },
  { char: "く", romaji: "ku", type: "gojuon" },
  { char: "け", romaji: "ke", type: "gojuon" },
  { char: "こ", romaji: "ko", type: "gojuon" },
  { char: "さ", romaji: "sa", type: "gojuon" },
  { char: "し", romaji: "shi", type: "gojuon" },
  { char: "す", romaji: "su", type: "gojuon" },
  { char: "せ", romaji: "se", type: "gojuon" },
  { char: "そ", romaji: "so", type: "gojuon" },
  { char: "た", romaji: "ta", type: "gojuon" },
  { char: "ち", romaji: "chi", type: "gojuon" },
  { char: "つ", romaji: "tsu", type: "gojuon" },
  { char: "て", romaji: "te", type: "gojuon" },
  { char: "と", romaji: "to", type: "gojuon" },
  { char: "な", romaji: "na", type: "gojuon" },
  { char: "に", romaji: "ni", type: "gojuon" },
  { char: "ぬ", romaji: "nu", type: "gojuon" },
  { char: "ね", romaji: "ne", type: "gojuon" },
  { char: "の", romaji: "no", type: "gojuon" },
  { char: "は", romaji: "ha", type: "gojuon" },
  { char: "ひ", romaji: "hi", type: "gojuon" },
  { char: "ふ", romaji: "fu", type: "gojuon" },
  { char: "へ", romaji: "he", type: "gojuon" },
  { char: "ほ", romaji: "ho", type: "gojuon" },
  { char: "ま", romaji: "ma", type: "gojuon" },
  { char: "み", romaji: "mi", type: "gojuon" },
  { char: "む", romaji: "mu", type: "gojuon" },
  { char: "め", romaji: "me", type: "gojuon" },
  { char: "も", romaji: "mo", type: "gojuon" },

  { char: "や", romaji: "ya", type: "gojuon" },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "ゆ", romaji: "yu", type: "gojuon" },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "よ", romaji: "yo", type: "gojuon" },

  { char: "ら", romaji: "ra", type: "gojuon" },
  { char: "り", romaji: "ri", type: "gojuon" },
  { char: "る", romaji: "ru", type: "gojuon" },
  { char: "れ", romaji: "re", type: "gojuon" },
  { char: "ろ", romaji: "ro", type: "gojuon" },

  { char: "わ", romaji: "wa", type: "gojuon" },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "を", romaji: "wo", type: "gojuon" },

  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "ん", romaji: "n", type: "gojuon" },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },
  { char: "", romaji: "", type: "gojuon", isEmpty: true },

  // Dakuon (Voiced)
  { char: "が", romaji: "ga", type: "dakuon" },
  { char: "ぎ", romaji: "gi", type: "dakuon" },
  { char: "ぐ", romaji: "gu", type: "dakuon" },
  { char: "げ", romaji: "ge", type: "dakuon" },
  { char: "ご", romaji: "go", type: "dakuon" },
  { char: "ざ", romaji: "za", type: "dakuon" },
  { char: "じ", romaji: "ji", type: "dakuon" },
  { char: "ず", romaji: "zu", type: "dakuon" },
  { char: "ぜ", romaji: "ze", type: "dakuon" },
  { char: "ぞ", romaji: "zo", type: "dakuon" },
  { char: "だ", romaji: "da", type: "dakuon" },
  { char: "ぢ", romaji: "ji", type: "dakuon" },
  { char: "づ", romaji: "zu", type: "dakuon" },
  { char: "で", romaji: "de", type: "dakuon" },
  { char: "ど", romaji: "do", type: "dakuon" },
  { char: "ば", romaji: "ba", type: "dakuon" },
  { char: "び", romaji: "bi", type: "dakuon" },
  { char: "ぶ", romaji: "bu", type: "dakuon" },
  { char: "べ", romaji: "be", type: "dakuon" },
  { char: "ぼ", romaji: "bo", type: "dakuon" },

  // Handakuon (Semi-voiced)
  { char: "ぱ", romaji: "pa", type: "handakuon" },
  { char: "ぴ", romaji: "pi", type: "handakuon" },
  { char: "ぷ", romaji: "pu", type: "handakuon" },
  { char: "ぺ", romaji: "pe", type: "handakuon" },
  { char: "ぽ", romaji: "po", type: "handakuon" },
];
