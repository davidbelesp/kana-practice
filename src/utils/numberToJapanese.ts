const ROMAJI = ["", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyuu"];
const HIRAGANA = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];

// Word-level alternate readings accepted as valid input
const ROMAJI_ALTS: Record<string, string> = {
  shi: "yon",
  shichi: "nana",
  ku: "kyuu",
};

export interface JapaneseNumber {
  romaji: string;
  hiragana: string;
}

function buildRomaji(n: number): string {
  if (n === 10000) return "ichiman";

  const parts: string[] = [];
  const th = Math.floor(n / 1000);
  const rem1 = n % 1000;
  const hu = Math.floor(rem1 / 100);
  const rem2 = rem1 % 100;
  const te = Math.floor(rem2 / 10);
  const on = rem2 % 10;

  if (th > 0) {
    if (th === 1) parts.push("sen");
    else if (th === 3) parts.push("sanzen");
    else if (th === 8) parts.push("hassen");
    else parts.push(ROMAJI[th] + "sen");
  }

  if (hu > 0) {
    if (hu === 1) parts.push("hyaku");
    else if (hu === 3) parts.push("sanbyaku");
    else if (hu === 6) parts.push("roppyaku");
    else if (hu === 8) parts.push("happyaku");
    else parts.push(ROMAJI[hu] + "hyaku");
  }

  if (te > 0) {
    if (te === 1) parts.push("juu");
    else parts.push(ROMAJI[te] + "juu");
  }

  if (on > 0) parts.push(ROMAJI[on]);

  return parts.join(" ");
}

function buildHiragana(n: number): string {
  if (n === 10000) return "いちまん";

  let result = "";
  const th = Math.floor(n / 1000);
  const rem1 = n % 1000;
  const hu = Math.floor(rem1 / 100);
  const rem2 = rem1 % 100;
  const te = Math.floor(rem2 / 10);
  const on = rem2 % 10;

  if (th > 0) {
    if (th === 1) result += "せん";
    else if (th === 3) result += "さんぜん";
    else if (th === 8) result += "はっせん";
    else result += HIRAGANA[th] + "せん";
  }

  if (hu > 0) {
    if (hu === 1) result += "ひゃく";
    else if (hu === 3) result += "さんびゃく";
    else if (hu === 6) result += "ろっぴゃく";
    else if (hu === 8) result += "はっぴゃく";
    else result += HIRAGANA[hu] + "ひゃく";
  }

  if (te > 0) {
    if (te === 1) result += "じゅう";
    else result += HIRAGANA[te] + "じゅう";
  }

  if (on > 0) result += HIRAGANA[on];

  return result;
}

export function numberToJapanese(n: number): JapaneseNumber {
  return { romaji: buildRomaji(n), hiragana: buildHiragana(n) };
}

function normalizeRomaji(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(w => ROMAJI_ALTS[w] ?? w)
    .join(" ");
}

export function checkNumberAnswer(n: number, input: string, mode: "romaji" | "hiragana"): boolean {
  if (mode === "romaji") {
    return normalizeRomaji(input) === buildRomaji(n);
  }
  return input.trim() === buildHiragana(n);
}
