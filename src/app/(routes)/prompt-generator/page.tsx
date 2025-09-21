"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";

export default function PromptGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setGeneratedPrompt(null);
    
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    
    setLoading(true);
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
      setError(err?.message || "Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      // You could add a toast notification here
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
      a.download = `${topic.replace(/\s+/g, '-')}-prompt.txt`;
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
      if (line.startsWith('#')) {
        return <h2 key={index} className="text-xl font-bold text-white mb-3 mt-6">{line.replace('#', '').trim()}</h2>;
      } else if (line.startsWith('##')) {
        return <h3 key={index} className="text-lg font-semibold text-white mb-2 mt-4">{line.replace('##', '').trim()}</h3>;
      } else if (line.startsWith('###')) {
        return <h4 key={index} className="text-md font-medium text-white mb-2 mt-3">{line.replace('###', '').trim()}</h4>;
      } else if (line.startsWith('-') || line.startsWith('*')) {
        return <li key={index} className="text-gray-300 mb-1 ml-4">{line.replace(/^[-*]\s*/, '')}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.match(/^\d+\./)) {
        return <li key={index} className="text-gray-300 mb-1 ml-4">{line}</li>;
      } else {
        return <p key={index} className="text-gray-300 mb-3 leading-relaxed">{line}</p>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ff6b35\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            opacity: 0.2
          }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">AI POWERED</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white">Prompt</span>
            <span className="text-orange-500">Generator</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Transform any topic into a comprehensive, detailed prompt. Perfect for content creation, 
            creative writing, and technical tasks.
          </p>
        </div>

        <div className="grid gap-12">
          {/* Input Section */}
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Enter Your Topic
                </label>
                <div className="relative">
                  <Input
                    placeholder="e.g., 'space exploration', 'digital marketing', 'machine learning'"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                    className="bg-black/60 border-gray-700 text-white placeholder-gray-500 text-lg py-4 px-6 rounded-xl focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || !topic.trim()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Prompt'
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          {generatedPrompt && (
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">Generated Prompt</h3>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-black/60 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-black/60 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert max-w-none">
                  {formatPrompt(generatedPrompt)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example Topics */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Popular Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Climate change solutions",
              "Future of artificial intelligence",
              "Sustainable architecture",
              "Digital marketing strategies",
              "Space exploration challenges",
              "Renewable energy innovations",
              "Mental health awareness",
              "Cybersecurity best practices",
              "Educational technology trends"
            ].map((exampleTopic) => (
              <button
                key={exampleTopic}
                onClick={() => setTopic(exampleTopic)}
                disabled={loading}
                className="text-left p-4 bg-black/20 border border-gray-800 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                    {exampleTopic}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 53, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 53, 0.5);
        }
      `}</style>
    </div>
  );
}
