"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Loader2, Sparkles, Wand2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PromptGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [topic]);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please enter a topic to generate a prompt for.");
      return;
    }

    setLoading(true);
    // Clear previous result to show fresh generation state
    setGeneratedPrompt(null);

    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setGeneratedPrompt(data.prompt);
    } catch (err: any) {
      setError(err?.message || "Failed to generate prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      // Could show a toast here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  async function handleDownload() {
    if (!generatedPrompt) return;
    try {
      const blob = new Blob([generatedPrompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.slice(0, 30).replace(/\s+/g, '-')}-prompt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  }

  const formatPrompt = (prompt: string) => {
    return prompt.split('\n').map((line, index) => {
      // Markdown-like formatting for better readability
      if (line.startsWith('# ')) {
        return <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-8 pb-2 border-b border-white/10">{line.replace('# ', '').trim()}</h2>;
      } else if (line.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-semibold text-orange-400 mb-3 mt-6">{line.replace('## ', '').trim()}</h3>;
      } else if (line.startsWith('### ')) {
        return <h4 key={index} className="text-lg font-medium text-white mb-2 mt-4">{line.replace('### ', '').trim()}</h4>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="text-gray-300 mb-1 ml-4 pl-2 border-l-2 border-orange-500/20">{line.replace(/^[-*]\s*/, '')}</li>;
      } else if (line.match(/^\d+\./)) {
        return <div key={index} className="text-gray-300 mb-2 ml-4 flex gap-2"><span className="font-mono text-orange-400">{line.split('.')[0]}.</span> <span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      } else {
        return <p key={index} className="text-gray-300 mb-2 leading-relaxed">{line}</p>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 py-16 md:py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-orange-100/80 text-xs font-medium tracking-wide uppercase">AI Prompt Engineer</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
            Prompt Generator
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform simple ideas into <span className="text-orange-400">expertly engineered prompts</span>.
            Unlock the full potential of LLMs with structured, persona-driven instructions.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 md:p-3 shadow-2xl shadow-black/50 ring-1 ring-white/10">
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="Describe what you want the AI to do... e.g., 'Write a blog post about the future of green energy', 'Create a Python script to scrape data'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="w-full min-h-[60px] max-h-[200px] bg-transparent text-white placeholder-gray-500 text-lg px-6 py-4 rounded-xl resize-none focus:outline-none focus:ring-0 custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <div className="absolute right-3 bottom-3 md:top-3 md:bottom-auto">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-4 py-6 h-auto md:py-2 md:h-10 transition-all duration-300 shadow-lg shadow-orange-900/20"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <motion.div className="flex items-center gap-2" whileHover={{ x: 3 }}>
                      <span>Generate</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </Button>
              </div>
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full text-sm">
                {error}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Output Section */}
        <AnimatePresence>
          {generatedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-gray-300">Optimized Prompt</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white hover:bg-white/10 h-8 gap-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="text-gray-400 hover:text-white hover:bg-white/10 h-8 gap-2"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-black/50">
                  <div className="prose prose-invert prose-orange max-w-none">
                    {formatPrompt(generatedPrompt)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Topics (Only show when no result) */}
        {!generatedPrompt && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <p className="text-center text-sm text-gray-500 uppercase tracking-widest mb-8 font-medium">Try experimenting with</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                "Space exploration blog post",
                "React component for a dashboard",
                "Email marketing campaign for shoes",
                "Detailed lesson plan on photosynthesis",
                "Python script to analyze stock data",
                "Short story in the style of Hemingway"
              ].map((exampleTopic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(exampleTopic);
                    // Optional: auto-submit or just fill
                  }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-orange-500/30 rounded-full text-gray-400 hover:text-white transition-all duration-200 text-sm"
                >
                  {exampleTopic}
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
