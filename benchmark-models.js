const fs = require('fs');
const path = require('path');

function getEnvVar(key) {
  const envPaths = [path.join(__dirname, '.env.local'), path.join(__dirname, '.env')];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const fileContent = fs.readFileSync(envPath, 'utf8');
      const lines = fileContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*(?:export\s+)?([^#\s]+)\s*=\s*(.*)$/);
        if (match && match[1] === key) {
          return match[2].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  return null;
}

const API_KEY = getEnvVar('OPENROUTER_API_KEY');

const candidates = [
  "openrouter/free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "openai/gpt-oss-20b:free",
  "poolside/laguna-xs-2.1:free",
  "cohere/north-mini-code:free",
];

async function testAll() {
  for (const model of candidates) {
    const start = Date.now();
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "tomatoChat"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi! Reply with only 'OK'." }],
          temperature: 0.5,
          max_tokens: 20
        })
      });
      const elapsed = Date.now() - start;
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ [${elapsed}ms] ${model}: ${data.choices?.[0]?.message?.content?.trim()}`);
      } else {
        console.log(`❌ [${elapsed}ms] ${model}: Status ${res.status} - ${data?.error?.message}`);
      }
    } catch (e) {
      console.log(`💥 ${model}: ${e.message}`);
    }
  }
}

testAll();
