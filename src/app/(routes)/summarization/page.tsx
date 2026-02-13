"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { Particles } from "@/components/ui/particles";
import {
  FileText,
  Sparkles,
  MessageSquare,
  Brain,
  Copy,
  Check,
  X,
  ChevronLeft,
  Edit3,
  LucideIcon,
  Upload,
  Loader2,
} from "lucide-react";
import SummarizationFileUploader from "@/components/SummarizationFileUploader";

// Define types for user
interface User {
  subscription_tier?: string;
}

// Types
type SummaryType = "general" | "bullet" | "executive" | "academic";
type FeatureId = "summary" | "keywords" | "questions" | "analysis";
type Feature = {
  id: FeatureId;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
};

type ResultsState = Record<FeatureId, string | undefined>;
type LoadingState = Record<FeatureId, boolean | undefined>;

const features: Feature[] = [
  {
    id: "summary",
    name: "Summarize",
    icon: FileText,
    description: "Generate smart summaries",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "keywords",
    name: "Keywords",
    icon: Sparkles,
    description: "Extract key terms",
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "questions",
    name: "Questions",
    icon: MessageSquare,
    description: "Generate questions",
    color: "from-orange-500 to-pink-500",
  },
  {
    id: "analysis",
    name: "Analyze",
    icon: Brain,
    description: "Content insights",
    color: "from-orange-500 to-purple-500",
  },
];

const summaryTypes: { value: SummaryType; label: string }[] = [
  { value: "general", label: "General Summary" },
  { value: "bullet", label: "Bullet Points" },
  { value: "executive", label: "Executive Summary" },
  { value: "academic", label: "Academic Summary" },
];

const initialResultsState: ResultsState = {
  summary: undefined,
  keywords: undefined,
  questions: undefined,
  analysis: undefined,
};

const initialLoadingState: LoadingState = {
  summary: false,
  keywords: false,
  questions: false,
  analysis: false,
};

export default function SummarizationPage() {
  // --- Navbar & UI State ---
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (navOpen) {
        setNavOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navOpen]);

  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    href: string
  ) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      router.push(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  // --- Summarization State & Logic ---
  const [inputText, setInputText] = useState<string>("");
  const [results, setResults] = useState<ResultsState>(initialResultsState);
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState);
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>("general");
  const [copied, setCopied] = useState<FeatureId | "">("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: 'pdf' | 'text'; text: string }>>([]);
  const [showFileUploader, setShowFileUploader] = useState<boolean>(false);
  const [status, setStatus] = useState<"idle" | "extracting" | "processing" | "completed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>("");

  const handleFileUpload = (text: string, fileType: 'pdf' | 'text', fileName: string) => {
    setUploadedFiles(prev => [...prev, { name: fileName, type: fileType, text }]);
    setInputText(prev => prev + (prev ? '\n\n' : '') + text);
    setShowFileUploader(false);
  };

  const handleFileUploadError = (error: string) => {
    setError(error);
    setStatus("error");
  };

  const removeUploadedFile = (index: number) => {
    const file = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));

    // Remove the file's content from the input text
    const fileTextRegex = new RegExp(`\\[.*${file.name}.*\\][\\s\\S]*?(?=\\[|$)`, 'g');
    setInputText(prev => prev.replace(fileTextRegex, '').trim());
  };

  const handleProcess = async (featureId: FeatureId): Promise<void> => {
    if (!inputText.trim() && uploadedFiles.length === 0) {
      setError("Please enter some text or upload a file to process");
      return;
    }

    setLoading((prev) => ({ ...prev, [featureId]: true }));
    setActiveFeature(featureId);
    setSidebarOpen(true);
    setStatus("processing");
    setError(null);

    // Set processing steps for better UX
    const steps = {
      summary: ["Analyzing content...", "Generating summary...", "Formatting results..."],
      keywords: ["Extracting text...", "Identifying keywords...", "Organizing terms..."],
      questions: ["Understanding content...", "Formulating questions...", "Reviewing questions..."],
      analysis: ["Scanning content...", "Analyzing themes...", "Generating insights..."]
    };

    const currentSteps = steps[featureId] || ["Processing..."];
    let stepIndex = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex < currentSteps.length) {
        setProcessingStep(currentSteps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 800);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          feature: featureId,
          summaryType: featureId === "summary" ? summaryType : undefined
        }),
      });

      clearInterval(stepInterval);
      setProcessingStep("Finalizing...");

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "AI processing failed");
      }

      const data = await res.json();
      setResults((prev) => ({ ...prev, [featureId]: data.result }));
      setStatus("completed");
      setProcessingStep("");
    } catch (error: any) {
      clearInterval(stepInterval);
      console.error("Error processing:", error);
      setError(error.message || "Error processing text. Please try again.");
      setStatus("error");
      setProcessingStep("");
    } finally {
      setLoading((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  const copyToClipboard = async (
    text: string,
    id: FeatureId | ""
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const closeSidebar = (): void => {
    setSidebarOpen(false);
    setActiveFeature(null);
  };

  const resetAnalysis = () => {
    setInputText("");
    setResults(initialResultsState);
    setUploadedFiles([]);
    setStatus("idle");
    setError(null);
    setSidebarOpen(false);
    setActiveFeature(null);
  };

  const currentFeature = features.find((f) => f.id === activeFeature);
  const currentResult = activeFeature ? results[activeFeature] : undefined;
  const wordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          className="h-full w-full opacity-30"
          quantity={80}
          ease={80}
          color={theme === 'dark' ? '#F97316' : '#EA580C'} // Orange tint particles
          refresh
        />
      </div>
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "url('/generated-image (1).png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.4
        }}
      />

      {/* --- Navbar (Copied & Adapted) --- */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? "py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm" : "py-4"
          }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 relative max-w-7xl mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center z-30">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="QuickAI Logo"
                width={40}
                height={40}
                priority
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="font-bold tracking-wide bg-gradient-to-r from-[#ff512f] to-[#dd2476] bg-clip-text text-transparent text-lg md:text-2xl font-[Montserrat]">
                tomato<span className="font-light">Tool</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-lg shadow-orange-500/5 backdrop-blur-md rounded-full px-4 py-2">
            <Link
              href="/ai-tools"
              onClick={(e) => handleProtectedLink(e, "/ai-tools")}
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
            >
              AI Tools
            </Link>
            <Link
              href="/#categories"
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
            >
              Categories
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
            >
              Pricing
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-3 z-30">
            <ThemeToggleButton variant="circle-blur" start="top-right" />

            {/* Hamburger for mobile */}
            <button
              className="md:hidden flex items-center p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={navOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                  {user.subscription_tier || 'Free'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all">Get Started</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex flex-col p-4 space-y-2">
                <Link
                  href="/ai-tools"
                  onClick={(e) => { setNavOpen(false); handleProtectedLink(e, "/ai-tools"); }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10"
                >
                  AI Tools
                </Link>
                <Link
                  href="/#categories"
                  onClick={() => setNavOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10"
                >
                  Categories
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setNavOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10"
                >
                  Pricing
                </Link>
                {user ? (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="flex items-center justify-between px-4 mb-4">
                      <span className="text-sm text-slate-500">Tier: {user.subscription_tier || 'Free'}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 rounded-xl text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setNavOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium">Login</Link>
                    <Link href="/register" onClick={() => setNavOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-xl bg-orange-600 text-white text-sm font-medium">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- Main Content with Modern & Orange Styling --- */}
      <main className="relative pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto z-10">

        {status === "idle" || status === "error" ? (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-16"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-[#E84E1B] dark:bg-[#E84E1B]/30 text-white dark:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 border border-[#E84E1B] dark:border-[#E84E1B]/80">
                AI-Powered Content Summarization
              </span>
              <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight">
                Summarize any content with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E1B] to-[#E84E1B]">AI precision</span>
              </h1>
              <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload PDFs or paste text to get instant summaries, extract keywords, generate questions, and analyze content with advanced AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-3xl p-1 shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm mb-8"
            >
              {!showFileUploader ? (
                <div className="p-4 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Enter Your Content
                    </h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <select
                        value={summaryType}
                        onChange={(e) => setSummaryType(e.target.value as SummaryType)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-orange-500 h-11"
                      >
                        {summaryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowFileUploader(true)}
                        className="flex items-center justify-center space-x-2 px-6 py-2.5 md:py-3 bg-[#E84E1B] hover:bg-[#E84E1B] dark:bg-[#E84E1B]/30 dark:hover:bg-[#E84E1B]/50 text-white dark:text-white rounded-xl transition-colors font-medium h-11"
                        type="button"
                      >
                        <Upload className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-sm">Upload Files</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Uploaded Files</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="flex items-center space-x-3 overflow-hidden">
                              {file.type === 'pdf' ? (
                                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                              ) : (
                                <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                              )}
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
                              aria-label="Remove file"
                            >
                              <X className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your content here to analyze with AI or upload files..."
                    className="w-full h-40 md:h-48 p-4 md:p-6 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#E84E1B] focus:outline-none resize-none text-slate-800 dark:text-white text-base leading-relaxed bg-white dark:bg-slate-800/50"
                  />

                  <div className="mt-4 text-[10px] md:text-sm text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-1 overflow-hidden">
                    <span className="truncate">{inputText.length.toLocaleString()} characters • {wordCount.toLocaleString()} words</span>
                    {uploadedFiles.length > 0 && <span className="font-medium text-orange-600 dark:text-orange-400">{uploadedFiles.length} file(s) uploaded</span>}
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Upload Documents
                    </h2>
                    <button
                      onClick={() => setShowFileUploader(false)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      type="button"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <SummarizationFileUploader
                    onFileProcessed={handleFileUpload}
                    onError={handleFileUploadError}
                  />
                </div>
              )}
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300"
              >
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold">Processing Failed</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Features Grid - Responsive columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {features.map((feature) => (
                <motion.button
                  key={feature.id}
                  onClick={() => handleProcess(feature.id)}
                  disabled={!inputText.trim() && uploadedFiles.length === 0}
                  className="group bg-white dark:bg-slate-900/50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#E84E1B]/20 dark:hover:border-[#E84E1B]/80 disabled:opacity-50 disabled:cursor-not-allowed text-left sm:text-center"
                  type="button"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${feature.color} rounded-lg md:rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-auto`}
                  >
                    <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-xs md:text-sm text-center">
                    {feature.name}
                  </h3>
                  <p className="hidden sm:block text-[10px] md:text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Smart Summaries",
                  desc: "AI-powered summaries that capture the essence of any content.",
                  icon: (
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )
                },
                {
                  title: "PDF Support",
                  desc: "Extract and analyze text directly from PDF documents.",
                  icon: (
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )
                },
                {
                  title: "Multiple Analysis Types",
                  desc: "Summaries, keywords, questions, and deep content analysis.",
                  icon: (
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 transition-colors shadow-lg shadow-gray-100/50 dark:shadow-none"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm md:text-base">{item.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : status === "processing" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-3xl shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm p-6 md:p-8">
              <div className="text-center">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full animate-pulse opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin" />
                  </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {currentFeature?.name} in Progress
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>

                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                    {processingStep || "Initializing..."}
                  </p>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "90%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>

                  <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-500 mt-4">
                    This usually takes a few seconds...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : status === "completed" && currentResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-6 md:mb-8">
              <button
                onClick={resetAnalysis}
                className="flex items-center gap-2 text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                Analyze Another
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {currentFeature?.name} Results
              </h2>
            </div>

            <div className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-3xl shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                  {currentFeature && (
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${currentFeature.color} rounded-xl flex items-center justify-center shrink-0`}
                    >
                      <currentFeature.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                      {activeFeature === "summary"
                        ? `${summaryType.charAt(0).toUpperCase() +
                        summaryType.slice(1)
                        } Summary`
                        : currentFeature?.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                      {currentFeature?.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => currentResult && copyToClipboard(currentResult, activeFeature!)}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 md:py-3 bg-[#E84E1B] hover:bg-[#E84E1B] dark:bg-[#E84E1B]/30 dark:hover:bg-[#E84E1B]/50 text-white dark:text-white rounded-xl transition-colors font-medium text-sm"
                  type="button"
                >
                  {copied === activeFeature ? (
                    <>
                      <Check className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div
                  className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm md:text-base bg-slate-50 dark:bg-black/30 rounded-xl p-4 md:p-6 border border-slate-100 dark:border-slate-800"
                  dangerouslySetInnerHTML={{
                    __html: currentResult
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-600 dark:text-orange-400">$1</strong>')
                      .replace(/_(.*?)_/g, '<u>$1</u>')
                      .replace(/^(\d+\.\s)/gm, '<span class="font-bold text-orange-600">$1</span>')
                      .replace(/^(•\s|●\s)/gm, '<span class="text-orange-500 font-bold">•</span> ')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-12 text-center relative z-10 mx-4">
        <p className="text-slate-400 text-xs md:text-sm">
          © {new Date().getFullYear()} Content Summarizer. Built with OpenRouter AI.
        </p>
      </footer>

    </div>
  );
}
