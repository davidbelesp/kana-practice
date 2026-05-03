const fs = require('fs');
const content = fs.readFileSync('src/data/vocabulary.ts', 'utf8');
const lines = content.split('\n');
let insideTags = false;
for (const line of lines) {
  if (line.includes('tags:')) {
    const match = line.match(/tags:\s*\[(.*?)\]/);
    if (match) {
      const tagsStr = match[1];
      if (tagsStr.includes('{')) {
         console.log("Found object in tags: " + line);
      }
    }
  }
}
console.log("Done checking");
