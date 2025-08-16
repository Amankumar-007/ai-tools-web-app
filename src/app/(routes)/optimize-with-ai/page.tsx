// app/optimize-with-ai/page.tsx
"use client";

import { useState } from "react";
import { optimizeTextWithGemini } from "@/lib/gemini";

export default function OptimizeWithAI() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const output = await optimizeTextWithGemini(input) as { improved?: string; text?: string };
      // Prefer improved text; fallback to generic text or stringify for visibility
      setResult(output.improved ?? output.text ?? JSON.stringify(output));
    } catch (err) {
      setResult("Failed to optimize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Optimize With AI (Gemini Flash)</h1>

      <textarea
        rows={4}
        placeholder="Paste your content or caption here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded mb-4"
      />

      <button
        onClick={handleOptimize}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Optimizing..." : "Optimize with AI"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </main>
  );
}
