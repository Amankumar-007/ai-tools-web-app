const fs = require('fs');
const path = require('path');

const filePath = 'e:/all projects/tomato-ai/ai-tools-web-app/public/data/ai-tools.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const initialCount = data.length;
const seen = new Set();
const deduplicated = data.filter(item => {
  if (seen.has(item.name)) return false;
  seen.add(item.name);
  return true;
});

const finalCount = deduplicated.length;
fs.writeFileSync(filePath, JSON.stringify(deduplicated, null, 2));

console.log(`Initial tools: ${initialCount}`);
console.log(`Final unique tools: ${finalCount}`);
console.log(`Removed ${initialCount - finalCount} duplicate entries.`);
