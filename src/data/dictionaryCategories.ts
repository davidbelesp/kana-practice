import type { VocabularyItem } from "../types/Vocabulary";

export type DictionaryCategoryId =
  | "family"
  | "body-parts"
  | "clothing"
  | "food-drinks"
  | "home"
  | "professions-jobs"
  | "health-illness"
  | "weather-seasons"
  | "nature"
  | "transportation"
  | "directions-positions"
  | "school-office"
  | "hobbies-sports"
  | "feelings-emotions"
  | "shapes-sizes"
  | "days-months"
  | "counters"
  | "katakana-loanwords"
  | "greetings-phrases"
  | "other";

export interface DictionaryCategory {
  id: DictionaryCategoryId;
  labelKey: string;
  descriptionKey: string;
  section: "everyday" | "world" | "study";
}

export const DICTIONARY_CATEGORIES: DictionaryCategory[] = [
  { id: "family", labelKey: "vocabulary.taxonomy.family", descriptionKey: "vocabulary.taxonomyDescriptions.family", section: "everyday" },
  { id: "body-parts", labelKey: "vocabulary.taxonomy.bodyParts", descriptionKey: "vocabulary.taxonomyDescriptions.bodyParts", section: "everyday" },
  { id: "clothing", labelKey: "vocabulary.taxonomy.clothing", descriptionKey: "vocabulary.taxonomyDescriptions.clothing", section: "everyday" },
  { id: "food-drinks", labelKey: "vocabulary.taxonomy.foodDrinks", descriptionKey: "vocabulary.taxonomyDescriptions.foodDrinks", section: "everyday" },
  { id: "home", labelKey: "vocabulary.taxonomy.home", descriptionKey: "vocabulary.taxonomyDescriptions.home", section: "everyday" },
  { id: "professions-jobs", labelKey: "vocabulary.taxonomy.professionsJobs", descriptionKey: "vocabulary.taxonomyDescriptions.professionsJobs", section: "everyday" },
  { id: "health-illness", labelKey: "vocabulary.taxonomy.healthIllness", descriptionKey: "vocabulary.taxonomyDescriptions.healthIllness", section: "everyday" },
  { id: "weather-seasons", labelKey: "vocabulary.taxonomy.weatherSeasons", descriptionKey: "vocabulary.taxonomyDescriptions.weatherSeasons", section: "world" },
  { id: "nature", labelKey: "vocabulary.taxonomy.nature", descriptionKey: "vocabulary.taxonomyDescriptions.nature", section: "world" },
  { id: "transportation", labelKey: "vocabulary.taxonomy.transportation", descriptionKey: "vocabulary.taxonomyDescriptions.transportation", section: "world" },
  { id: "directions-positions", labelKey: "vocabulary.taxonomy.directionsPositions", descriptionKey: "vocabulary.taxonomyDescriptions.directionsPositions", section: "world" },
  { id: "school-office", labelKey: "vocabulary.taxonomy.schoolOffice", descriptionKey: "vocabulary.taxonomyDescriptions.schoolOffice", section: "study" },
  { id: "hobbies-sports", labelKey: "vocabulary.taxonomy.hobbiesSports", descriptionKey: "vocabulary.taxonomyDescriptions.hobbiesSports", section: "study" },
  { id: "feelings-emotions", labelKey: "vocabulary.taxonomy.feelingsEmotions", descriptionKey: "vocabulary.taxonomyDescriptions.feelingsEmotions", section: "study" },
  { id: "shapes-sizes", labelKey: "vocabulary.taxonomy.shapesSizes", descriptionKey: "vocabulary.taxonomyDescriptions.shapesSizes", section: "study" },
  { id: "days-months", labelKey: "vocabulary.taxonomy.daysMonths", descriptionKey: "vocabulary.taxonomyDescriptions.daysMonths", section: "study" },
  { id: "counters", labelKey: "vocabulary.taxonomy.counters", descriptionKey: "vocabulary.taxonomyDescriptions.counters", section: "study" },
  { id: "katakana-loanwords", labelKey: "vocabulary.taxonomy.katakanaLoanwords", descriptionKey: "vocabulary.taxonomyDescriptions.katakanaLoanwords", section: "study" },
  { id: "greetings-phrases", labelKey: "vocabulary.taxonomy.greetingsPhrases", descriptionKey: "vocabulary.taxonomyDescriptions.greetingsPhrases", section: "study" },
  { id: "other", labelKey: "vocabulary.taxonomy.other", descriptionKey: "vocabulary.taxonomyDescriptions.other", section: "study" },
];

const TAG_CATEGORY_MAP: Record<string, DictionaryCategoryId[]> = {
  family: ["family"], human: ["family"], people: ["family"], pronoun: ["family"],
  body: ["body-parts"], clothing: ["clothing"],
  food: ["food-drinks"], fruit: ["food-drinks"], meal: ["food-drinks"], drink: ["food-drinks"],
  house: ["home"], home: ["home"], shopping: ["home"],
  work: ["professions-jobs"], profession: ["professions-jobs"], job: ["professions-jobs"],
  health: ["health-illness"], illness: ["health-illness"], medicine: ["health-illness"], hospital: ["health-illness"],
  weather: ["weather-seasons"], season: ["weather-seasons"],
  nature: ["nature"], animal: ["nature"], plant: ["nature"], color: ["nature"],
  transport: ["transportation"], travel: ["transportation"], vehicle: ["transportation"],
  direction: ["directions-positions"], directions: ["directions-positions"], place: ["directions-positions"], position: ["directions-positions"],
  school: ["school-office"], office: ["school-office"], technology: ["school-office"],
  hobby: ["hobbies-sports"], music: ["hobbies-sports"], sport: ["hobbies-sports"], sports: ["hobbies-sports"],
  emotion: ["feelings-emotions"], feelings: ["feelings-emotions"], mood: ["feelings-emotions"],
  shape: ["shapes-sizes"], size: ["shapes-sizes"], adjective: ["shapes-sizes"],
  day: ["days-months"], month: ["days-months"], calendar: ["days-months"], time: ["days-months"],
  counter: ["counters"], counters: ["counters"], measure: ["counters"],
  greeting: ["greetings-phrases"], greetings: ["greetings-phrases"], phrase: ["greetings-phrases"],
};

const KATAKANA_PATTERN = /^[ァ-ヶー・\s]+$/u;
const GREETING_PATTERN = /hello|hi |good morning|good evening|thank|welcome|sorry|おはよう|こんにちは|こんばんは|ありがとう|すみません|よろしく/i;
const COUNTER_PATTERN = /counter|classifier|枚|本|匹|個|冊|台|着|杯|歳|回|番|人|counter/i;

export const getDictionaryCategories = (item: Pick<VocabularyItem, "japanese" | "hiragana" | "translation" | "tags" | "fields" | "usage" | "categories" | "loanword">): DictionaryCategoryId[] => {
  const tags = [...(item.tags ?? []), ...(item.fields ?? []), ...(item.usage ?? [])].map((tag) => tag.toLowerCase().replace(/[_\s-]+/g, "-"));
  const text = [item.japanese, item.hiragana, ...(item.translation ?? []).map((entry) => entry.translation)].join(" ");
  const categorySet = new Set<DictionaryCategoryId>(item.categories as DictionaryCategoryId[] | undefined);

  tags.forEach((tag) => {
    const normalized = tag.replace(/-/g, "");
    (TAG_CATEGORY_MAP[tag] ?? TAG_CATEGORY_MAP[normalized] ?? []).forEach((category) => categorySet.add(category));
  });

  if (KATAKANA_PATTERN.test(item.hiragana) || item.loanword) categorySet.add("katakana-loanwords");
  if (GREETING_PATTERN.test(text)) categorySet.add("greetings-phrases");
  if (COUNTER_PATTERN.test(text)) categorySet.add("counters");

  categorySet.delete("other");
  return categorySet.size > 0 ? [...categorySet] : ["other"];
};

export const CATEGORY_SECTIONS: Array<{ id: DictionaryCategory["section"]; labelKey: string }> = [
  { id: "everyday", labelKey: "vocabulary.categorySections.everyday" },
  { id: "world", labelKey: "vocabulary.categorySections.world" },
  { id: "study", labelKey: "vocabulary.categorySections.study" },
];
