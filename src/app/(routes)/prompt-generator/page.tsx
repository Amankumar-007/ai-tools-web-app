"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  Loader2,
  Sparkles,
  Wand2,
  ArrowRight,
  Check,
  RefreshCcw,
  Zap,
  Brain,
  Shield,
  Layout,
  MessageSquare,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import MainNavbar from "@/components/MainNavbar";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Model Selector Component for the Prompt Generator
const ModelPicker = ({ selectedModel, onSelect }: { selectedModel: string, onSelect: (id: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const models = [
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", description: "Vibrant & Ultra-fast", icon: <Zap className="w-4 h-4" /> },
    { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1", description: "The Reasoning Powerhouse", icon: <Brain className="w-4 h-4" /> },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", description: "Balanced & Versatile", icon: <Shield className="w-4 h-4" /> },
    { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder", description: "Advanced Coding Logic", icon: <Layout className="w-4 h-4" /> },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", description: "Creative Generalist", icon: <Sparkles className="w-4 h-4" /> },
    { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Fast Intelligence", icon: <Zap className="w-4 h-4" /> },
    { id: "mistralai/mistral-small-3.1-24b:free", name: "Mistral Small 3.1", description: "Efficient & Robust", icon: <Shield className="w-4 h-4" /> },
    { id: "stepfun/step-3.5-flash:free", name: "Step 3.5 Flash", description: "Multimodal Speed", icon: <Zap className="w-4 h-4" /> },
    { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano", description: "Compact Logic", icon: <Shield className="w-4 h-4" /> },
    { id: "upstage/solar-pro-3:free", name: "Solar Pro 3", description: "Professional Grade", icon: <Layout className="w-4 h-4" /> },
    { id: "nousresearch/hermes-3-405b-instruct:free", name: "Hermes 3 405B", description: "Peak Performance", icon: <Brain className="w-4 h-4" /> },
    { id: "liquidai/lfm2.5-1.2b-thinking:free", name: "LFM Thinking", description: "Smart & Small", icon: <Brain className="w-4 h-4" /> },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", description: "Standard Reasoning Powerhouse", icon: <Brain className="w-4 h-4" /> },
    { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", description: "Open Source Power", icon: <Layout className="w-4 h-4" /> },
    { id: "openrouter/free:free", name: "OpenRouter Default", description: "Stable Choice", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const activeModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-500/5 dark:bg-white/5 hover:bg-neutral-500/10 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 rounded-xl transition-all text-sm font-medium"
      >
        <span className="text-orange-500 dark:text-orange-400">{activeModel.icon}</span>
        <span className="text-neutral-700 dark:text-gray-200">{activeModel.name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 top-full z-[100] w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-2xl backdrop-blur-xl max-h-[350px] overflow-y-auto custom-scrollbar mt-2"
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex flex-col items-start p-2 rounded-xl transition-all text-left mb-1 last:mb-0",
                    selectedModel === model.id
                      ? "bg-orange-500 dark:bg-orange-600 text-white"
                      : "hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    {model.icon}
                    {model.name}
                  </div>
                  <div className={cn("text-[10px] ml-6", selectedModel === model.id ? "text-orange-50" : "text-neutral-400 dark:text-gray-500")}>
                    {model.description}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PromptGeneratorPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash-exp:free");
  const [copyStatus, setCopyStatus] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const userObj = await getCurrentUser();
      setUser(userObj);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  const handleProtectedLink = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      router.push("/login");
    }
  };

  // Status steps for loading
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Analyzing objective...",
    "Defining persona...",
    "Engineering constraints...",
    "Finalizing architecture..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length);
      }, 1500);
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
    setGeneratedPrompt(null);

    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, model: selectedModel }),
      });

      const data = await res.json();
      if (!res.ok) {
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
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
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
      a.download = `optimized-prompt.txt`;
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
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('# ')) {
        return <h2 key={index} className="text-3xl font-black dark:text-white text-neutral-900 mb-6 mt-10 tracking-tight">{trimmedLine.replace('# ', '')}</h2>;
      } else if (trimmedLine.startsWith('## ')) {
        return <h3 key={index} className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4 mt-8 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500/50 rounded-full" />
          {trimmedLine.replace('## ', '')}
        </h3>;
      } else if (trimmedLine.startsWith('### ')) {
        return <h4 key={index} className="text-lg font-semibold dark:text-white/90 text-neutral-800 mb-3 mt-6">{trimmedLine.replace('### ', '')}</h4>;
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        return <p key={index} className="text-sm font-mono text-neutral-500 dark:text-gray-500 uppercase tracking-widest mb-4">{trimmedLine.replace(/\*\*/g, '')}</p>;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        return <li key={index} className="dark:text-gray-300 text-neutral-600 mb-2 ml-4 list-none flex gap-3">
          <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
          <span>{trimmedLine.replace(/^[-*]\s*/, '')}</span>
        </li>;
      } else if (trimmedLine.startsWith('---')) {
        return <hr key={index} className="dark:border-white/10 border-neutral-200 my-10" />;
      } else if (trimmedLine === '') {
        return <div key={index} className="h-4" />;
      } else {
        return <p key={index} className="dark:text-gray-300 text-neutral-600 mb-4 leading-relaxed font-light text-lg">{line}</p>;
      }
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen dark:bg-[#050505] bg-neutral-50 dark:text-white text-neutral-900 selection:bg-orange-500/30 font-sans transition-colors duration-300 py-15">
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />

      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] dark:bg-orange-600/20 bg-orange-200/40 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] dark:bg-red-600/10 bg-red-200/20 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-8 md:py-20 text-center">

        {/* Navigation / Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 md:mb-10"
        >


          <h1 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight leading-[1.1] italic px-2">
            GENERATE <span className="text-orange-500">PERFECTION</span>
          </h1>

          <p className="text-sm md:text-lg text-gray-400 max-w-xl mx-auto font-light leading-relaxed px-4">
            Elevate your AI interactions with <span className="text-white font-medium">expertly structured prompts</span> engineered for high-precision results.
          </p>
        </motion.div>

        {/* Control Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto relative mb-12 md:mb-20 z-30"
        >
          <div className="bg-white/90 dark:bg-[#0f0f0f]/80 backdrop-blur-2xl border border-neutral-200 dark:border-white/5 rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-2xl dark:ring-1 dark:ring-white/5 relative z-30">
            {/* Subtle polish */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

            <div className="flex flex-col gap-4 md:gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] dark:text-white/40 text-neutral-400">Instruction Input</h2>
                </div>
                <div className="w-full sm:w-auto">
                  <ModelPicker selectedModel={selectedModel} onSelect={setSelectedModel} />
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  placeholder="Describe your goal... e.g., 'A research assistant for quantum physics'"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  className="w-full min-h-[80px] md:min-h-[100px] bg-transparent dark:text-white text-neutral-900 placeholder-neutral-300 dark:placeholder-white/5 text-lg md:text-xl px-0 py-1 resize-none focus:outline-none focus:ring-0 custom-scrollbar font-normal leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 md:pt-6 border-t dark:border-white/5 border-neutral-100 gap-4">
                <div className="flex items-center gap-4 text-[10px] md:text-xs dark:text-white/30 text-neutral-400 font-medium overflow-hidden">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Zap className="w-3 h-3 text-orange-500" />
                    Powered by OpenRouter
                  </div>
                  <div className="flex items-center gap-1.5 font-mono shrink-0">
                    8K+ Context
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl px-6 py-4 md:py-5 h-auto transition-all duration-300 shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2.5 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">{steps[currentStep]}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Engineer Prompt</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 md:mt-6 flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs md:text-sm">
                <X className="w-3.5 h-3.5" />
                {error}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Output Area */}
        <AnimatePresence mode="wait">
          {generatedPrompt ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-[#0f0f0f] border border-neutral-200 dark:border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] text-left">
                {/* Visual Header */}
                <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b dark:border-white/5 border-neutral-100 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/5 dark:bg-white/5 flex items-center justify-center border border-orange-500/10 dark:border-white/10 shrink-0">
                      <Wand2 className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[10px] font-black uppercase tracking-widest dark:text-white/80 text-neutral-800">Optimized Blueprint</h3>
                      <p className="text-[9px] dark:text-white/20 text-neutral-400 mt-0.5">Zero-shot instruction architecture</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center self-end">
                    <button
                      onClick={handleGenerate}
                      className="p-2.5 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl transition-all border border-neutral-200 dark:border-white/5 dark:text-white/40 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      title="Regenerate"
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl font-bold text-[10px] md:text-[11px] transition-all border",
                        copyStatus
                          ? "bg-green-600 text-white border-green-500"
                          : "bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 dark:text-white text-neutral-700 border-neutral-200 dark:border-white/10"
                      )}
                    >
                      {copyStatus ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{copyStatus ? "Copied" : "Copy"}</span>
                      <span className="sm:hidden">{copyStatus ? "Done" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] md:text-[11px] transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-6 md:px-12 md:py-10 max-h-[60vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar selection:bg-orange-500/50 text-left">
                  <div className="prose dark:prose-invert prose-orange max-w-none text-sm md:text-base">
                    {formatPrompt(generatedPrompt)}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !loading && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 md:mt-12 text-center"
            >
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {[
                  "Senior Software Architect for Microservices",
                  "Ghostwriter for a Cyberpunk Sci-Fi Novel",
                  "Expert SEO Consultant for E-commerce",
                  "Advanced Python Educator for Kids"
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(s)}
                    className="px-4 py-2.5 md:px-6 md:py-3 bg-neutral-200/50 dark:bg-white/5 hover:bg-orange-500/10 border border-neutral-200 dark:border-white/5 hover:border-orange-500/20 rounded-xl md:rounded-2xl text-neutral-500 dark:text-white/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all text-[11px] md:text-sm font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>


      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        h2, h1, h3 {
           font-family: var(--font-montserrat), sans-serif;
        }
      `}</style>
    </div>
  );
}
