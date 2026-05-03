import { vocabularyData } from './src/data/vocabulary.ts';

const themeSet = new Set();
vocabularyData.forEach(item => {
  item.tags.forEach(tag => themeSet.add(tag));
});
const themes = Array.from(themeSet);
console.log(themes);
