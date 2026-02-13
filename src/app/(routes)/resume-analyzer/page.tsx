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

import { AppState, AnalysisResult } from "../../../types/types";
import FileUploader from "../../../components/FileUploader";
import ProcessingOverlay from "../../../components/ProcessingOverlay";
import ResultsSection from "../../../components/ResultsSection";
import { extractTextFromPdf } from "../../../services/pdfService";
import { Sparkles, ChevronLeft, AlertTriangle, Zap, ShieldCheck, Edit } from "lucide-react";

// Define types for user
interface User {
  subscription_tier?: string;
}

export default function ResumeAnalyzer() {
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
    if (typeof window === 'undefined') return

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

  // --- Resume Analyzer State & Logic ---
  const [state, setState] = useState<AppState & { optimizedResume?: string }>({
    status: "idle",
    result: null,
    error: null,
    fileName: null,
  });
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");

  const handleFileSelect = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      status: "extracting",
      error: null,
      fileName: file.name,
    }));

    try {
      // Step 1: Text Extraction
      const text = await extractTextFromPdf(file);
      setResumeText(text);

      if (!text || text.length < 50) {
        throw new Error(
          "Could not extract enough text from the PDF. It might be an image-only file or corrupted."
        );
      }

      // Step 2: AI Analysis
      setState((prev) => ({ ...prev, status: "analyzing" }));
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, jobDescription }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "AI analysis failed");
      }

      const analysis = await res.json();

      setState((prev) => ({
        ...prev,
        status: "completed",
        result: analysis,
      }));
    } catch (err: any) {
      console.error("Analysis Pipeline Error:", err);
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err.message || "An unexpected error occurred during analysis.",
      }));
    }
  }, [jobDescription]);

  const handleOptimize = async () => {
    if (!resumeText || !jobDescription) return;

    setState((prev) => ({ ...prev, status: "optimizing" }));
    try {
      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText, jobDescription }),
      });

      if (!res.ok) {
        throw new Error("Resume optimization failed");
      }

      const data = await res.json();
      setState((prev) => ({
        ...prev,
        status: "completed",
        optimizedResume: data.optimizedText,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err.message,
      }));
    }
  };

  const resetAnalysis = () => {
    setState({
      status: "idle",
      result: null,
      error: null,
      fileName: null,
    });
    setResumeText("");
  };

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

        {state.status === "idle" || state.status === "error" ? (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-16"
            >
              <span className="inline-block py-1 px-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 dark:border-orange-800">
                AI-Powered Resume Analysis
              </span>
              <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight">
                Optimize your resume for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">modern job market</span>
              </h1>
              <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Add your job description and resume to get an instant ATS score and professional feedback tailored to your target role.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">
                  Target Job Description (Optional)
                </label>
                <textarea
                  className="w-full h-32 md:h-40 p-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-slate-800 dark:text-slate-200 text-sm md:text-base"
                  placeholder="Paste the job description here to get a tailored ATS score and matching analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="bg-white dark:bg-slate-900/50 rounded-2xl md:rounded-3xl p-1 shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                <FileUploader onFileSelect={handleFileSelect} disabled={false} />
              </div>
            </motion.div>

            {state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 md:mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300"
              >
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm">Analysis Failed</h4>
                  <p className="text-xs md:text-sm">{state.error}</p>
                </div>
              </motion.div>
            )}

            <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Instant Scoring",
                  desc: "Real-time evaluation based on 100+ professional data points.",
                  icon: (
                    <Zap className="w-6 h-6 text-orange-600" />
                  )
                },
                {
                  title: "ATS Compatibility",
                  desc: "Ensures your resume is readable by automated hiring systems.",
                  icon: (
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                  )
                },
                {
                  title: "Actionable Points",
                  desc: "Clear, specific instructions on how to rewrite weak sections.",
                  icon: (
                    <Edit className="w-6 h-6 text-orange-600" />
                  )
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 transition-colors shadow-lg shadow-gray-100/50 dark:shadow-none"
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
        ) : state.status === "completed" && (state.result || state.optimizedResume) ? (
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
                {state.optimizedResume ? "Optimized Resume" : "Analysis Results"}
              </h2>
            </div>

            {state.optimizedResume ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Your Tailored Resume</h3>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(state.optimizedResume || "");
                        alert("Resume copied to clipboard!");
                      }
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-bold shadow-lg shadow-orange-500/20"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-mono text-xs md:text-sm whitespace-pre-wrap bg-slate-50 dark:bg-black/30 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                  {state.optimizedResume}
                </div>
              </div>
            ) : (
              <ResultsSection
                result={state.result!}
                onReset={resetAnalysis}
                onOptimize={jobDescription ? handleOptimize : undefined}
              />
            )}
          </motion.div>
        ) : null}
      </main>

      {(state.status === "extracting" || state.status === "analyzing" || state.status === "optimizing") && (
        <ProcessingOverlay status={state.status as "extracting" | "analyzing" | "optimizing"} />
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-12 text-center relative z-10 mx-4">
        <p className="text-slate-400 text-xs md:text-sm">
          © {new Date().getFullYear()} Resume Intelligence. Built with Gemini AI.
        </p>
      </footer>
    </div>
  );
}

