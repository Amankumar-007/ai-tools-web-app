const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const tools = JSON.parse(fs.readFileSync('public/data/ai-tools.json', 'utf8'));
const categorySource = fs.readFileSync('src/lib/categories.ts', 'utf8');
const picksSource = fs.readFileSync('src/lib/categoryTools.ts', 'utf8');
const picksObject = picksSource.split('CATEGORY_TOOL_SLUGS: Record<string, string[]> = ')[1]?.split('\n};')[0];

if (!picksObject) throw new Error('Could not find category picks');
const picks = vm.runInNewContext(`(${picksObject}\n})`);
const categorySlugs = new Set([...categorySource.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]));
const categoryExports = {};
vm.runInNewContext(ts.transpileModule(categorySource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: categoryExports });
const toolSlugs = new Set();
const toolIds = new Set();
const errors = [];

for (const tool of tools) {
  if (toolSlugs.has(tool.slug)) errors.push(`Duplicate tool slug: ${tool.slug}`);
  toolSlugs.add(tool.slug);
  if (toolIds.has(tool.id)) errors.push(`Duplicate tool id: ${tool.id}`);
  toolIds.add(tool.id);
  if (!tool.name || !tool.description || !tool.category) errors.push(`Incomplete tool: ${tool.slug}`);
  if (!['Free', 'Freemium', 'Paid'].includes(tool.pricing)) errors.push(`Invalid pricing: ${tool.slug}`);
  try { new URL(tool.website); } catch { errors.push(`Invalid website: ${tool.slug}`); }
  if (tool.source) {
    try { new URL(tool.source); } catch { errors.push(`Invalid source: ${tool.slug}`); }
  }
  if (tool.sourceDate && (!tool.source || !/^\d{4}-\d{2}-\d{2}$/.test(tool.sourceDate))) {
    errors.push(`Invalid source date: ${tool.slug}`);
  }
}

for (const [category, slugs] of Object.entries(picks)) {
  if (!categorySlugs.has(category)) errors.push(`Unknown category: ${category}`);
  for (const slug of slugs) {
    if (!toolSlugs.has(slug)) errors.push(`Missing pick: ${category} → ${slug}`);
  }
  if (new Set(slugs).size !== slugs.length) errors.push(`Duplicate pick in ${category}`);
}

console.log(`${tools.length} tools, ${categorySlugs.size} categories, ${Object.keys(picks).length} curated categories`);
console.log('No curated matches:', [...categorySlugs].filter((slug) => !picks[slug]).join(', '));
const listed = new Set(Object.values(picks).flat());
for (const category of categoryExports.ALL_CATEGORIES) {
  if (['latest-ai', 'future-tools', 'aixploria-selection', 'amazing', 'supertools'].includes(category.slug)) continue;
  for (const tool of tools) {
    const label = tool.category.toLowerCase();
    if (label === category.name.toLowerCase() || category.keywords.some((keyword) => keyword.length >= 5 && label.includes(keyword.toLowerCase()))) listed.add(tool.slug);
  }
}
console.log(`${listed.size} tools shown in at least one category; ${tools.length - listed.size} available only by direct link.`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Catalog and category picks are consistent.');
}
