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

async function testModel(modelId) {
  console.log(`\nTesting ${modelId}...`);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "tomatoChat"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: "Say hello and test OK" }],
      temperature: 0.7,
      stream: false
    })
  });
  console.log("Status:", res.status, res.statusText);
  const data = await res.json();
  if (res.ok) {
    console.log("Success reply:", data.choices?.[0]?.message?.content);
  } else {
    console.log("Error details:", JSON.stringify(data));
  }
}

async function run() {
  await testModel("openrouter/free");
  await testModel("google/gemma-4-31b-it:free");
  await testModel("nvidia/nemotron-3-nano-30b-a3b:free");
  await testModel("z-ai/glm-5.2:free");
}

run();
