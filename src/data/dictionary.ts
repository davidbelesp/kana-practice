import { vocabularyData } from "./vocabulary";
import { generatedDictionaryEntries } from "./dictionary.generated";
import { getDictionaryCategories } from "./dictionaryCategories";
import type { VocabularyItem } from "../types/Vocabulary";

export interface DictionaryGroup {
  id: string;
  labelKey: string;
  descriptionKey: string;
}

export const DICTIONARY_GROUPS: DictionaryGroup[] = [
  { id: "daily-life", labelKey: "vocabulary.groups.dailyLife", descriptionKey: "vocabulary.groupDescriptions.dailyLife" },
  { id: "people-body", labelKey: "vocabulary.groups.peopleBody", descriptionKey: "vocabulary.groupDescriptions.peopleBody" },
  { id: "time-place", labelKey: "vocabulary.groups.timePlace", descriptionKey: "vocabulary.groupDescriptions.timePlace" },
  { id: "nature-world", labelKey: "vocabulary.groups.natureWorld", descriptionKey: "vocabulary.groupDescriptions.natureWorld" },
  { id: "study-work", labelKey: "vocabulary.groups.studyWork", descriptionKey: "vocabulary.groupDescriptions.studyWork" },
  { id: "actions-ideas", labelKey: "vocabulary.groups.actionsIdeas", descriptionKey: "vocabulary.groupDescriptions.actionsIdeas" },
];

const GROUP_BY_TAG: Record<string, string> = {
  fruit: "daily-life", food: "daily-life", meal: "daily-life", drink: "daily-life", shopping: "daily-life", clothing: "daily-life", house: "daily-life",
  human: "people-body", people: "people-body", pronoun: "people-body", body: "people-body", emotion: "people-body",
  time: "time-place", day: "time-place", month: "time-place", calendar: "time-place", number: "time-place", direction: "time-place", place: "time-place", transport: "time-place", travel: "time-place",
  nature: "nature-world", weather: "nature-world", color: "nature-world", animal: "nature-world",
  school: "study-work", work: "study-work", technology: "study-work", hobby: "study-work", music: "study-work",
  verb: "actions-ideas", adjective: "actions-ideas",
};

export const getDictionaryGroup = (tags: string[]) => GROUP_BY_TAG[tags[0]] ?? "daily-life";

/**
 * Bundled learner dictionary. The current curated vocabulary is normalized here
 * so the UI can search a stable offline index and accept richer dictionary data
 * without changing the existing VocabularyItem contract.
 */
const curatedEntries: VocabularyItem[] = vocabularyData.map((item, index) => ({
  ...item,
  id: item.id ?? `learner-${index + 1}`,
  group: item.group ?? getDictionaryGroup(item.tags),
  categories: getDictionaryCategories(item),
  source: item.source ?? "Kana Practice Studio curated learner set",
}));

const curatedJapanese = new Set(curatedEntries.map((item) => `${item.japanese}|${item.hiragana}`));

export const dictionaryEntries: VocabularyItem[] = [
  ...curatedEntries,
  ...generatedDictionaryEntries
    .map((item) => ({
      ...item,
      group: item.group ?? getDictionaryGroup(item.tags),
      categories: getDictionaryCategories(item),
    }))
    .filter((item) => !curatedJapanese.has(`${item.japanese}|${item.hiragana}`)),
];
