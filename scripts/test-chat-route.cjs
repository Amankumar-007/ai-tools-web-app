const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');

const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'chatgpt', 'route.ts');
const compiled = ts.transpileModule(fs.readFileSync(routePath, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const routeModule = new Module(routePath, module);
routeModule.filename = routePath;
routeModule.paths = module.paths;
routeModule._compile(compiled, routePath);
const { POST } = routeModule.exports;
process.env.OPENROUTER_API_KEY = 'test-key';

const request = (signal = new AbortController().signal) => ({
  signal,
  json: async () => ({ messages: [{ role: 'user', content: 'Hello' }], model: 'openrouter/free' }),
});

async function main() {
  const originalFetch = global.fetch;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  try {
    global.fetch = async () => new Response(new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hel'));
        controller.enqueue(encoder.encode('lo"}}]}\n\ndata: {"choices":[{"delta":{"content":" world"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    }), { status: 200 });
    const success = await POST(request());
    assert.equal(success.status, 200);
    assert.equal(await success.text(), 'Hello world');

    global.fetch = async () => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"error":{"message":"Provider stopped"}}\n\n'));
        controller.close();
      },
    }), { status: 200 });
    const interrupted = await POST(request());
    await assert.rejects(interrupted.text(), /Provider stopped/);

    global.fetch = async () => new Response(JSON.stringify({ error: 'busy' }), { status: 429 });
    const busy = await POST(request());
    assert.equal(busy.status, 429);
    assert.match((await busy.json()).error, /busy/i);

    process.env.OPENAI_API_KEY = 'test-key';
    const calls = [];
    global.fetch = async (url) => {
      calls.push(url);
      if (calls.length === 1) return new Response('', { status: 429 });
      return new Response('data: {"choices":[{"delta":{"content":"Backup answer"}}]}\n\ndata: [DONE]\n\n', { status: 200 });
    };
    const fallback = await POST(request());
    assert.equal(fallback.headers.get('X-Fallback-Model'), 'GPT-4o Mini');
    assert.equal(await fallback.text(), 'Backup answer');
    assert.deepEqual(calls, ['https://openrouter.ai/api/v1/chat/completions', 'https://api.openai.com/v1/chat/completions']);
    console.log('Chat route streaming, interruption, and rate limit checks passed.');
  } finally {
    global.fetch = originalFetch;
    if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
