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

if (!API_KEY) {
  console.error("❌ ERROR: OPENROUTER_API_KEY not found in .env or .env.local file.");
  process.exit(1);
}

async function testModel() {
  const modelId = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";
  console.log(`\n🤖 Testing OpenRouter Model: ${modelId}...\n`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "What is the meaning of life? Keep it to one sentence." }],
        max_tokens: 4096,
        stream: false
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      console.error(JSON.stringify(data, null, 2));
    } else {
      console.log(`✅ Success! Response from Model:\n`);
      console.log(data.choices[0].message.content);
    }
  } catch (error) {
    console.error("❌ Network or Execution Error:", error);
  }
}

testModel();
