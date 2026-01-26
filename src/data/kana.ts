import { hiraganaData } from "./hiragana";
import { katakanaData } from "./katakana";

export const allKanaData = [...hiraganaData, ...katakanaData];

export const getKanaByChar = (char: string) => {
  return allKanaData.find((k) => k.char === char);
};

export const getAllKanaChars = () => {
  return allKanaData.map((k) => k.char);
};

export { hiraganaData, katakanaData };
