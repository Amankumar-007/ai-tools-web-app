// app/optimize-with-ai/page.tsx
"use client";

import { useState } from "react";
import { optimizeTextWithGemini } from "@/lib/gemini";

export default function OptimizeWithAI() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const output = await optimizeTextWithGemini(input) as { improved?: string; text?: string };
      setResult(output.improved ?? output.text ?? JSON.stringify(output));
    } catch {
      setResult("❌ Failed to optimize. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen   flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-orange-400">AI Content Optimizer</h1>
      <p className="text-gray-400 mb-8 text-center max-w-xl">
        Paste your text and let AI make it more engaging & professional.
      </p>

      {/* Input */}
      <textarea
        rows={8}
        placeholder="Paste your text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full max-w-2xl p-4 rounded-lg  focus:ring-2 focus:ring-orange-500 outline-none resize-none"
      />

      <button
        onClick={handleOptimize}
        disabled={loading || !input.trim()}
        className="mt-4 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-red-600 font-medium transition"
      >
        {loading ? "Optimizing..." : "Optimize"}
      </button>

      {/* Output */}
      {result && (
        <div className="w-full max-w-2xl mt-8  p-4 rounded-lg border ">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-orange-400">Optimized Result</h2>
            <button
              onClick={handleCopy}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-gray-200">{result}</pre>
        </div>
      )}
    </div>
  );
}
