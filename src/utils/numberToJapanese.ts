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

// Builds romaji for 1–9999 with space-separated tokens
function buildPartRomaji(n: number): string {
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

// Builds hiragana for 1–9999
function buildPartHiragana(n: number): string {
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

function buildRomaji(n: number): string {
  const manPart = Math.floor(n / 10000);
  const remainder = n % 10000;
  const parts: string[] = [];
  if (manPart > 0) {
    // Concatenate man-prefix tokens (e.g. "juu ni" → "juuni") then append "man"
    parts.push(buildPartRomaji(manPart).replace(/\s+/g, "") + "man");
  }
  if (remainder > 0) {
    parts.push(buildPartRomaji(remainder));
  }
  return parts.join(" ");
}

function buildHiragana(n: number): string {
  const manPart = Math.floor(n / 10000);
  const remainder = n % 10000;
  let result = "";
  if (manPart > 0) {
    result += buildPartHiragana(manPart) + "まん";
  }
  if (remainder > 0) {
    result += buildPartHiragana(remainder);
  }
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

function isHiraganaInput(input: string): boolean {
  return /[぀-ゟ]/.test(input);
}

export function checkNumberAnswer(n: number, input: string): boolean {
  const trimmed = input.trim();
  if (isHiraganaInput(trimmed)) {
    return trimmed.replace(/\s+/g, "") === buildHiragana(n).replace(/\s+/g, "");
  }
  return normalizeRomaji(trimmed) === buildRomaji(n);
}
