import { vocabularyData } from './src/data/vocabulary.ts';

let allTagsStrings = true;
for (const item of vocabularyData) {
  for (const tag of item.tags) {
    if (typeof tag !== 'string') {
      console.log('Non-string tag found!', typeof tag, tag);
      allTagsStrings = false;
    }
  }
}
if (allTagsStrings) console.log('All tags are strings.');
