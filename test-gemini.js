const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

const GEMINI_KEY = getEnvVar('GEMINI_API_KEY');

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in one word");
    console.log("Gemini direct success:", result.response.text());
  } catch (err) {
    console.error("Gemini direct error:", err.message);
  }
}

testGemini();
