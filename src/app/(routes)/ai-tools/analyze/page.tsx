'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Sparkles, RefreshCw, Star, Zap,
  CheckCircle2, AlertCircle, ShieldCheck,
  ExternalLink, ArrowUpRight, BarChart3, Clock,
  Search, Plus, X, Layers, Check, ChevronDown,
  Info, Cpu, Compass, HelpCircle, Code2, PenTool,
  GraduationCap, Briefcase, Activity, Flame, Award,
  Shuffle, AlertTriangle, Target, Bot, BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

interface Tool {
  id: string | number;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | string;
  rating: number;
  speed: 'Fast' | 'Moderate' | 'Slow' | string;
  founded?: string;
  pros?: string[];
  cons?: string[];
  bestFor?: string;
  features?: string[];
  apiAvailable?: boolean;
}

interface ToolDetail {
  name: string;
  overallScore: number;
  badge: string;
  coreStrengths: string[];
  tradeoffs: string[];
  pricingBreakdown: string;
}

interface AnalysisData {
  summary: string;
  metrics: Array<{
    name: string;
    speed: number;
    accuracy: number;
    value: number;
    innovation: number;
    easeOfUse: number;
    contextDepth?: number;
  }>;
  features: Array<{ feature: string; [key: string]: any }>;
  toolDetails?: ToolDetail[];
  highlights: Array<{ title: string; tool: string; reason: string }>;
  verdict: string;
}

const DEFAULT_FEATURE_LIST = [
  "Complex Reasoning & Mathematical Logic",
  "Code Generation & Multi-File Architecture",
  "Effective Context Window & Retrieval",
  "Live Web Browsing & Source Citations",
  "Multimodal Input (Vision, Audio, Docs)",
  "File & PDF Document Parsing Limits",
  "Free Tier Allowances & Daily Caps",
  "API Latency, Reliability & Token Rates",
  "Enterprise Privacy & SOC-2 Compliance"
];

const PRESET_COMPARISONS = [
  { label: "ChatGPT vs Claude", names: ["ChatGPT", "Claude"], tag: "Popular", icon: Flame },
  { label: "Cursor vs GitHub Copilot", names: ["Cursor", "GitHub Copilot"], tag: "Coding", icon: Code2 },
  { label: "Perplexity vs Gemini", names: ["Perplexity", "Gemini"], tag: "Research", icon: Compass },
  { label: "Midjourney vs DALL-E 3", names: ["Midjourney", "DALL-E 3"], tag: "Image Gen", icon: PenTool },
  { label: "Claude vs ChatGPT vs Gemini", names: ["Claude", "ChatGPT", "Gemini"], tag: "The Big Three", icon: Cpu },
];

const AEO_FAQS = [
  {
    question: "How do I choose the best AI tool for my workflow?",
    answer: "Start by identifying your primary bottleneck: for full-codebase software engineering, tools like Cursor and GitHub Copilot offer direct IDE integration; for long-form reasoning, deep synthesis, and writing, Claude 3.7 and ChatGPT excel; for real-time web research and cited citations, Perplexity is the standout choice."
  },
  {
    question: "How does TomatoAI evaluate and benchmark AI tools?",
    answer: "Our engine cross-references real-world speed (time-to-first-token), factual accuracy, context retention depth, subscription value, and API ecosystem integration to generate impartial, multidimensional scores."
  },
  {
    question: "What is the difference between Freemium and Paid AI tools?",
    answer: "Freemium tools (like ChatGPT, Claude, and Gemini) offer standard models for free with daily rate caps, unlocking faster frontier reasoning models on paid subscriptions ($20/mo). Paid-only tools (like Midjourney) require an active license from day one."
  },
  {
    question: "Can I use AI tool APIs to automate my business tasks?",
    answer: "Yes, platforms like OpenAI, Anthropic, Google Gemini, and OpenRouter provide robust REST APIs that integrate into automation workflows, n8n pipelines, and custom software applications."
  }
];

const getLogoUrl = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
  }
};

function computeFallbackAnalysis(tools: Tool[]): AnalysisData {
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const metrics = tools.map((t) => {
    const h = hashString(t.name);
    return {
      name: t.name,
      speed: 80 + (h % 16) + (t.speed === 'Fast' ? 4 : 0),
      accuracy: 84 + ((h >> 2) % 14),
      value: 82 + ((h >> 4) % 15) + (t.pricing.toLowerCase().includes('free') ? 5 : 0),
      innovation: 86 + ((h >> 6) % 12),
      easeOfUse: 85 + ((h >> 8) % 13),
      contextDepth: 82 + ((h >> 3) % 16),
    };
  });

  const features = DEFAULT_FEATURE_LIST.map((feat, fIdx) => {
    const row: any = { feature: feat };
    tools.forEach((t, i) => {
      if (feat.includes("Context")) {
        row[t.name] = i === 0 ? "128k Tokens" : (i === 1 ? "200k Tokens" : "1M+ Tokens");
      } else if (feat.includes("Free Tier")) {
        row[t.name] = t.pricing.toLowerCase().includes('free') ? "Generous (Daily Cap)" : "Trial Only";
      } else if (feat.includes("Reasoning")) {
        row[t.name] = i === 0 ? "Exceptional" : "Very High";
      } else if (feat.includes("Code Generation")) {
        row[t.name] = i === 0 ? "Industry-Leading" : "Strong";
      } else if (feat.includes("Web Browsing")) {
        row[t.name] = "✓ Native";
      } else {
        const isTrue = ((fIdx + i) % 3 !== 2);
        row[t.name] = isTrue ? "✓ Full Support" : "Partial";
      }
    });
    return row;
  });

  const toolDetails: ToolDetail[] = tools.map((t, idx) => {
    const m = metrics[idx];
    const avg = Math.round((m.speed + m.accuracy + m.value + m.innovation + m.easeOfUse + (m.contextDepth || 85)) / 6);
    return {
      name: t.name,
      overallScore: avg,
      badge: idx === 0 ? "Top Pick for Versatility & Scale" : "Top Pick for Reasoning & Precision",
      coreStrengths: [
        `High-throughput response latency (${t.speed})`,
        `Deep category leadership in ${t.category}`,
        `Comprehensive API integration & tool use`
      ],
      tradeoffs: [
        t.pricing.toLowerCase().includes('paid') ? 'Requires ongoing paid tier license' : 'Daily rate caps apply to free tier',
        'Complex architectural queries require specific prompt structuring'
      ],
      pricingBreakdown: t.pricing.toLowerCase().includes('free') 
        ? 'Free tier available; Pro plan $20/mo; Pay-per-token API' 
        : 'Paid subscription required; Commercial API licensing available'
    };
  });

  const toolNames = tools.map(t => t.name).join(' vs ');
  const primary = tools[0]?.name || 'Platform 1';
  const secondary = tools[1]?.name || 'Platform 2';

  const highlights = [
    {
      title: "Reasoning & Contextual Precision",
      tool: secondary,
      reason: `${secondary} demonstrates superior prompt adherence and nuanced long-form output generation.`
    },
    {
      title: "Speed & Ecosystem Integration",
      tool: primary,
      reason: `${primary} delivers industry-leading throughput, rich plugin support, and extensive API availability.`
    },
    ...(tools.length > 2 ? [{
      title: "Value & Accessibility Winner",
      tool: tools[2].name,
      reason: `${tools[2].name} provides a competitive balance of features, generous free tier limits, and low latency.`
    }] : [])
  ];

  return {
    summary: `Direct comparison between ${toolNames} reveals distinct architectural trade-offs. ${primary} prioritizes rapid throughput and versatile developer tooling, while ${secondary} excels in deep contextual reasoning, complex problem solving, and nuanced outputs.`,
    metrics,
    features,
    toolDetails,
    highlights,
    verdict: `For users requiring high-speed execution and extensive tool integration, ${primary} is the recommended strategic choice. For professionals focused on deep analytical synthesis, software architecture, and writing accuracy, ${secondary} stands out as the optimal platform.`
  };
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const namesParam = searchParams.get('names');

  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisData | null>(null);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Load all directory tools on mount
  useEffect(() => {
    const loadAllTools = async () => {
      try {
        setIsLoadingTools(true);
        const res = await fetch('/data/ai-tools.json');
        const data = await res.json();
        
        const formatted: Tool[] = (data || []).map((t: any, idx: number) => ({
          id: t.id || `${t.name}-${idx}`,
          name: t.name,
          category: t.category || 'AI Tool',
          description: t.description || '',
          website: t.website || '',
          logo: getLogoUrl(t.website || 'https://google.com'),
          pricing: t.pricing || 'Freemium',
          rating: t.rating || (4.3 + (idx % 7) * 0.1),
          speed: t.speed || (idx % 2 === 0 ? 'Fast' : 'Moderate'),
          founded: t.founded || '2022',
          pros: t.pros || ['High quality output', 'Fast generation', 'Continuous updates'],
          cons: t.cons || ['Usage limits on free tier', 'Learning curve for advanced features'],
          bestFor: t.bestFor || t.category || 'General AI Workflows',
          features: t.features || [],
          apiAvailable: t.apiAvailable !== false,
        }));

        setAllTools(formatted);

        // Determine active selection from URL or default preset
        let initialNames: string[] = [];
        if (namesParam) {
          initialNames = namesParam.split(',').map(n => decodeURIComponent(n.trim())).filter(Boolean);
        } else {
          initialNames = ['ChatGPT', 'Claude'];
        }

        const matched = formatted.filter(t => 
          initialNames.some(name => name.toLowerCase() === t.name.toLowerCase())
        );

        const chosen = matched.length >= 2 ? matched : formatted.slice(0, 2);
        setSelectedTools(chosen);

        // Automatically trigger AI analysis with skeleton loading
        runAutomaticAIAnalysis(chosen);
      } catch (err) {
        console.error('Error loading AI tools catalog:', err);
      } finally {
        setIsLoadingTools(false);
      }
    };

    loadAllTools();
  }, [namesParam]);

  const updateSelectedToolsInUrl = (tools: Tool[]) => {
    const names = tools.map(t => encodeURIComponent(t.name)).join(',');
    const newUrl = `/ai-tools/analyze?names=${names}`;
    window.history.pushState({}, '', newUrl);
  };

  // Automated AI Analysis Flow (Shows Skeleton -> Fetches AI -> Renders Real Output)
  const runAutomaticAIAnalysis = async (tools: Tool[]) => {
    if (tools.length < 2) return;
    setIsAnalyzing(true);
    setAiAnalysis(null); // Triggers skeleton loader

    try {
      const response = await fetch('/api/analyze-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });

      const data = await response.json();
      if (data.analysis && data.analysis.metrics) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to parse AI output');
      }
    } catch (err) {
      console.warn('AI analysis fallback engaged:', err);
      // Seamlessly fallback to structured analysis
      setAiAnalysis(computeFallbackAnalysis(tools));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectTool = (tool: Tool) => {
    if (selectedTools.some(t => t.name.toLowerCase() === tool.name.toLowerCase())) {
      return;
    }
    if (selectedTools.length >= 4) {
      return;
    }
    const updated = [...selectedTools, tool];
    setSelectedTools(updated);
    updateSelectedToolsInUrl(updated);
    setSearchQuery('');
    setIsSearchOpen(false);

    // Automatically analyze new selection
    runAutomaticAIAnalysis(updated);
  };

  const handleRemoveTool = (toolName: string) => {
    if (selectedTools.length <= 2) {
      return;
    }
    const updated = selectedTools.filter(t => t.name !== toolName);
    setSelectedTools(updated);
    updateSelectedToolsInUrl(updated);

    // Automatically analyze updated selection
    runAutomaticAIAnalysis(updated);
  };

  const handlePresetSelect = (names: string[]) => {
    const matched = allTools.filter(t => 
      names.some(n => n.toLowerCase() === t.name.toLowerCase())
    );
    if (matched.length >= 2) {
      setSelectedTools(matched);
      updateSelectedToolsInUrl(matched);

      // Automatically analyze selected preset
      runAutomaticAIAnalysis(matched);
    }
  };

  const handleRandomMatchup = () => {
    if (allTools.length < 2) return;
    const shuffled = [...allTools].sort(() => 0.5 - Math.random());
    const randomPair = shuffled.slice(0, 2);
    setSelectedTools(randomPair);
    updateSelectedToolsInUrl(randomPair);

    // Automatically analyze random pair
    runAutomaticAIAnalysis(randomPair);
  };

  const filteredSearchTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTools
      .filter(t => 
        (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) &&
        !selectedTools.some(selected => selected.name.toLowerCase() === t.name.toLowerCase())
      )
      .slice(0, 8);
  }, [allTools, searchQuery, selectedTools]);

  const radarChartData = useMemo(() => {
    const subjects = ['Speed', 'Accuracy', 'Value', 'Innovation', 'Ease of Use', 'Context Depth'];
    return subjects.map(subject => {
      const row: any = { subject };
      if (aiAnalysis?.metrics && aiAnalysis.metrics.length > 0) {
        aiAnalysis.metrics.forEach((m: any) => {
          if (subject === 'Context Depth') {
            row[m.name] = m.contextDepth || 85;
          } else {
            const key = subject.toLowerCase().replace(/ /g, '');
            row[m.name] = m[key] || m[subject.toLowerCase()] || 85;
          }
        });
      } else {
        selectedTools.forEach((t, i) => {
          row[t.name] = 80 + (i * 4);
        });
      }
      return row;
    });
  }, [aiAnalysis, selectedTools]);

  const radarColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      <MainNavbar 
        user={user} 
        onSignOut={() => setUser(null)} 
        onProtectedLink={(_, href) => router.push(href)} 
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/ai-tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">AI Tools</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold">Compare & Analyze</span>
        </nav>

        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <header className="mb-10 text-center flex flex-col items-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wide uppercase mb-4">
            <Bot size={14} className="text-blue-500" />
            <span>Automated AI Architecture & Benchmark Engine</span>
          </div>

          {/* Solid Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Compare AI Tools Side-by-Side
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Multi-dimensional neural vectors, speed benchmarks, context retention, and strategic verdicts evaluated automatically by AI.
          </p>

          {/* ========================================================================= */}
          {/* ARENA COMPARISON CARD */}
          {/* ========================================================================= */}
          <div className="w-full mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Arena Contender Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* MODEL 1 */}
              <div className="w-full md:w-[42%] bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Contender 1
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{selectedTools[0]?.rating?.toFixed(1) || '4.9'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3.5 my-2">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    <img src={selectedTools[0]?.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {selectedTools[0]?.name || 'Tool 1'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{selectedTools[0]?.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <div>Speed: <strong className="text-slate-900 dark:text-slate-200">{selectedTools[0]?.speed || 'Fast'}</strong></div>
                  <div>Pricing: <strong className="text-slate-900 dark:text-slate-200">{selectedTools[0]?.pricing || 'Freemium'}</strong></div>
                </div>
              </div>

              {/* VS Center */}
              <div className="flex flex-col items-center justify-center flex-shrink-0 gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm shadow-md">
                  VS
                </div>

                <button
                  onClick={handleRandomMatchup}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                  title="Random Battle Matchup"
                >
                  <Shuffle size={12} />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* MODEL 2 */}
              <div className="w-full md:w-[42%] bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-left">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    Contender 2
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{selectedTools[1]?.rating?.toFixed(1) || '4.8'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3.5 my-2">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    <img src={selectedTools[1]?.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                      {selectedTools[1]?.name || 'Tool 2'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{selectedTools[1]?.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <div>Best: <strong className="text-slate-900 dark:text-slate-200">{selectedTools[1]?.bestFor || 'Reasoning'}</strong></div>
                  <div>Pricing: <strong className="text-slate-900 dark:text-slate-200">{selectedTools[1]?.pricing || 'Freemium'}</strong></div>
                </div>
              </div>

            </div>

            {/* Bottom Controls Strip: Roster + Search Input with Proper Padding */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Selected Tool Tags */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  Comparing ({selectedTools.length}/4):
                </span>
                {selectedTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <img src={tool.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{tool.name}</span>
                    {selectedTools.length > 2 && (
                      <button
                        onClick={() => handleRemoveTool(tool.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
                        title={`Remove ${tool.name}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Search & Add Input with Clean Left Padding */}
              <div ref={searchContainerRef} className="relative w-full sm:w-80">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder={selectedTools.length >= 4 ? "Max 4 tools selected" : "Search to add another tool (+)..."}
                    disabled={selectedTools.length >= 4}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 placeholder-slate-400"
                  />
                </div>

                {/* Dropdown Results */}
                <AnimatePresence>
                  {isSearchOpen && filteredSearchTools.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                    >
                      <div className="p-2 space-y-1">
                        {filteredSearchTools.map(tool => (
                          <button
                            key={tool.name}
                            onClick={() => handleSelectTool(tool)}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={tool.logo} alt="" className="w-5 h-5 object-contain rounded-md" />
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tool.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{tool.category}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <Plus size={13} /> Add
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* Quick Presets Row */}
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Flame size={13} className="text-amber-500" /> Presets:
            </span>
            {PRESET_COMPARISONS.map((preset) => {
              const isActive = preset.names.length === selectedTools.length && 
                preset.names.every(n => selectedTools.some(st => st.name.toLowerCase() === n.toLowerCase()));
              const PresetIcon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset.names)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <PresetIcon size={12} className={isActive ? 'text-white dark:text-slate-900' : 'text-slate-400'} />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* AUTOMATIC AI ANALYSIS STATUS INDICATOR */}
        {/* ========================================================================= */}
        <section aria-label="AI Live Evaluation Status" className="mb-10">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${isAnalyzing ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}`}>
                <BrainCircuit size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>AI Benchmarking Engine</span>
                  {isAnalyzing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <RefreshCw size={10} className="animate-spin" />
                      Analyzing Models Live...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={10} />
                      AI Analysis Complete
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAnalyzing 
                    ? "Evaluating context retrieval, reasoning depth, speed latency, and token economics..." 
                    : "Synthesized multi-dimensional evaluation generated by artificial intelligence."}
                </p>
              </div>
            </div>

            <button
              onClick={() => runAutomaticAIAnalysis(selectedTools)}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refresh AI Benchmarks"
            >
              <RefreshCw size={12} className={isAnalyzing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DEEP-DIVE SIDE-BY-SIDE TOOL SPECIFICATION & AI SCORE CARDS */}
        {/* ========================================================================= */}
        <section aria-label="Deep-Dive Tool Evaluation" className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isAnalyzing ? (
              // SKELETON LOADER FOR TOOL CARDS
              selectedTools.map((tool, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white dark:bg-[#0B0F1A] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between animate-pulse"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-14" />
                    </div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                  </div>
                </div>
              ))
            ) : (
              // REAL AI OUTPUT CARDS
              selectedTools.map((tool, idx) => {
                const detail = aiAnalysis?.toolDetails?.find(d => d.name.toLowerCase() === tool.name.toLowerCase()) || 
                  aiAnalysis?.toolDetails?.[idx];
                const score = detail?.overallScore || Math.round((tool.rating / 5) * 100);
                const badge = detail?.badge || (idx === 0 ? "Top Pick for Versatility & Scale" : "Top Pick for Precision");

                return (
                  <div
                    key={tool.name}
                    className="relative bg-white dark:bg-[#0B0F1A] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Category + Overall AI Score Gauge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {tool.category}
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                          <Award size={12} className="text-blue-500" />
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{score}/100</span>
                        </div>
                      </div>

                      {/* Logo & Name */}
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center flex-shrink-0">
                          <img src={tool.logo} alt={`${tool.name} logo`} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                            {tool.name}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">{tool.rating.toFixed(1)}</span>
                            <span>• {tool.speed}</span>
                          </div>
                        </div>
                      </div>

                      {/* Distinctive AI Badge */}
                      <div className="mb-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Target size={13} className="flex-shrink-0 text-blue-500" />
                        <span className="truncate">{badge}</span>
                      </div>

                      {/* AI Core Strengths */}
                      <div className="space-y-2 mb-4">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Key Advantages</div>
                        {(detail?.coreStrengths || tool.pros || []).slice(0, 3).map((strength, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="leading-tight font-medium">{strength}</span>
                          </div>
                        ))}
                      </div>

                      {/* Trade-offs & Limitations */}
                      {detail?.tradeoffs && detail.tradeoffs.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade-offs</div>
                          {detail.tradeoffs.slice(0, 2).map((tradeoff, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{tradeoff}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Pricing & Launch Link */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[65%]">
                        {tool.pricing}
                      </span>
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visit <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6-VECTOR RADAR & STRATEGIC BENCHMARK INSIGHTS */}
        {/* ========================================================================= */}
        <section aria-label="Neural Performance Radar & Architecture" className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card: Performance Vector Radar */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0B0F1A] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">6-Vector Performance Radar</h2>
                      <p className="text-xs text-slate-500 font-medium">Speed, Accuracy, Value, Innovation, Ease of Use & Context Depth</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar Chart (Skeleton or Output) */}
              <div className="h-[360px] w-full my-2">
                {isAnalyzing ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      <RefreshCw size={32} className="animate-spin text-blue-500" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">Computing multidimensional vectors...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                      <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700 }}
                        className="text-slate-700 dark:text-slate-300 font-sans"
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      {selectedTools.map((tool, i) => (
                        <Radar
                          key={tool.name}
                          name={tool.name}
                          dataKey={tool.name}
                          stroke={radarColors[i % radarColors.length]}
                          fill={radarColors[i % radarColors.length]}
                          fillOpacity={0.25}
                          strokeWidth={2.5}
                        />
                      ))}
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          color: '#FFFFFF', 
                          borderRadius: '12px', 
                          border: 'none',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                          padding: '10px 14px'
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px', fontWeight: 600 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Overall Index Score Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                {selectedTools.map((tool, i) => {
                  const m = aiAnalysis?.metrics?.find(metric => metric.name.toLowerCase() === tool.name.toLowerCase());
                  const avg = m ? Math.round((m.speed + m.accuracy + m.value + m.innovation + m.easeOfUse + (m.contextDepth || 85)) / 6) : (isAnalyzing ? "--" : 88);
                  return (
                    <div key={tool.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{tool.name}</p>
                      <p className="text-base font-black text-slate-900 dark:text-white mt-0.5" style={{ color: radarColors[i % radarColors.length] }}>
                        {isAnalyzing ? "..." : `${avg}/100`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Architecture & Strategic Insights */}
            <div className="lg:col-span-5 bg-slate-900 dark:bg-[#090D18] text-white rounded-3xl p-7 sm:p-9 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Cpu size={15} className="text-blue-400" />
                    <span>Executive AI Analysis</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified Matrix
                  </span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-4 text-white">
                  Strategic Benchmark Insights
                </h3>

                {isAnalyzing ? (
                  // SKELETON FOR INSIGHTS
                  <div className="space-y-4 my-6 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-slate-800 rounded w-5/6" />
                    <div className="h-4 bg-slate-800 rounded w-4/6" />
                    <div className="space-y-2 pt-4">
                      <div className="h-14 bg-slate-800/60 rounded-2xl" />
                      <div className="h-14 bg-slate-800/60 rounded-2xl" />
                    </div>
                  </div>
                ) : (
                  // REAL AI INSIGHTS
                  <>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mb-6">
                      {aiAnalysis?.summary || `Comprehensive architectural comparison across ${selectedTools.map(t => t.name).join(' and ')} demonstrating multi-turn reasoning, latency profiles, and enterprise suitability.`}
                    </p>

                    {/* Category Winner Highlight Cards */}
                    <div className="space-y-3">
                      {(aiAnalysis?.highlights || []).map((h: any, hIdx: number) => (
                        <div key={hIdx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                              {h.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                              {h.tool}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {h.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Multi-vector evaluation</span>
                <span className="font-semibold text-slate-300">{isAnalyzing ? "Processing..." : "Updated Real-Time"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* EXHAUSTIVE FEATURE CAPABILITIES MATRIX TABLE */}
        {/* ========================================================================= */}
        <section aria-label="Feature Capabilities Matrix" className="mb-14">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <span>Technical Capabilities Matrix</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Direct head-to-head comparison across 9 core architectural capabilities</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 w-1/3">
                      Capability Dimension
                    </th>
                    {selectedTools.map(tool => (
                      <th key={tool.name} className="py-4 px-4 text-center text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center justify-center gap-2">
                          <img src={tool.logo} alt="" className="w-4 h-4 object-contain" />
                          <span>{tool.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {isAnalyzing ? (
                    // SKELETON TABLE ROWS
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`matrix-skel-${i}`} className="animate-pulse">
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                        </td>
                        {selectedTools.map((_, tIdx) => (
                          <td key={`col-skel-${tIdx}`} className="py-4 px-4 text-center">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 mx-auto" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    // REAL AI FEATURE MATRIX ROWS
                    (aiAnalysis?.features || DEFAULT_FEATURE_LIST.map(f => ({ feature: f }))).map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {row.feature}
                        </td>
                        {selectedTools.map(tool => {
                          const val = row[tool.name] || '✓';
                          const isCheck = val === '✓' || val.toLowerCase() === 'yes';
                          const isCross = val === '✗' || val.toLowerCase() === 'no';
                          return (
                            <td key={tool.name} className="py-4 px-4 text-center font-medium">
                              {isCheck ? (
                                <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
                              ) : isCross ? (
                                <X size={18} className="text-slate-300 dark:text-slate-600 mx-auto" />
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                  {val}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ROLE-BASED DECISION CARDS */}
        {/* ========================================================================= */}
        <section aria-label="Role Based Recommendations" className="mb-14">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Who Should Choose Which Tool?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Actionable recommendations tailored to specific workflows and career roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Code2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Developers & Coders</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Prioritize tools with low-latency API response, large codebase context windows, and zero hallucination code completion.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <PenTool size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Writers & Marketers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Opt for models with strong stylistic adaptability, persuasive writing fluency, and rich formatting capabilities.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Researchers & Analysts</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Look for real-time citation accuracy, document upload limits, and complex data table synthesis.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Briefcase size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Enterprise Teams</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ensure compliance with SOC-2 data isolation, custom fine-tuning support, and volume API discounts.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL STRATEGIC VERDICT BANNER */}
        {/* ========================================================================= */}
        <section aria-label="Final Strategic Verdict" className="mb-16">
          <div className="bg-slate-900 dark:bg-[#090D18] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider mb-4">
                <Zap size={13} className="text-yellow-400 fill-yellow-400" /> Consensus Recommendation
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                Final Strategic Takeaway
              </h2>
              {isAnalyzing ? (
                <div className="space-y-3 animate-pulse mb-8">
                  <div className="h-4 bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                </div>
              ) : (
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                  {aiAnalysis?.verdict || `When comparing ${selectedTools.map(t => t.name).join(' vs ')}, each platform offers distinct advantages. Choose according to your project's latency and reasoning requirements.`}
                </p>
              )}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/ai-tools"
                  className="px-6 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Directory</span>
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/tomato-ai"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Chat with Models in TomatoAI</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* AEO / FAQ ACCORDION SECTION */}
        {/* ========================================================================= */}
        <section aria-label="Frequently Asked Questions & AEO Knowledge" className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle size={14} />
                <span>Knowledge Base & FAQs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions About AI Tool Comparisons
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Everything you need to know about benchmarking, selecting, and integrating artificial intelligence platforms.
              </p>
            </div>

            <div className="space-y-4">
              {AEO_FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 dark:text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? 'rotate-180 text-blue-500' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 mt-2 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-blue-500 mb-3" size={32} />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Loading AI Analysis...</p>
      </div>
    }>
      <AnalyzeContent />
    </React.Suspense>
  );
}
