'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, X, Zap, ArrowRight,
  CheckCircle2, Plus, Trash2, ExternalLink,
  BarChart3, ShieldCheck, Clock, Star, AlertCircle,
  Sparkles, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainNavbar from '@/components/MainNavbar';
import CategoryToolsResults from '@/components/CategoryToolsResults';
import { getCurrentUser, signOut, User } from "@/lib/supabase";

// --- 1. ROBUST DATA STRUCTURE ---
interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  speed: 'Fast' | 'Moderate' | 'Slow';
  founded: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  apiAvailable: boolean;
}

const CATEGORIES = [
  { id: 'All', label: 'All Ecosystems' },
];

const getCategories = (tools: Tool[]) => {
  const categoryGroups: { [key: string]: string[] } = {
    'AI Chat': ['AI Chat', 'Chatbot', 'Conversational AI', 'LLM'],
    'Image Generation': ['Image Generation', 'Image Editing', 'Design', 'Art'],
    'Video Generation': ['Video Generation', 'Video Editing', 'Animation'],
    'Coding': ['Coding', 'Development', 'Code Assistant', 'Programming'],
    'Productivity': ['Productivity', 'Writing', 'Automation', 'Presentation', 'Text'],
    'Other': []
  };

  const mainCategories = Object.keys(categoryGroups);

  return [
    { id: 'All', label: 'All AI Tools' },
    ...mainCategories.map(cat => ({ id: cat, label: cat }))
  ];
};

const belongsToCategory = (toolCategory: string, mainCategory: string): boolean => {
  const categoryGroups: { [key: string]: string[] } = {
    'AI Chat': ['AI Chat', 'Chatbot', 'Conversational AI', 'LLM'],
    'Image Generation': ['Image Generation', 'Image Editing', 'Design', 'Art'],
    'Video Generation': ['Video Generation', 'Video Editing', 'Animation'],
    'Coding': ['Coding', 'Development', 'Code Assistant', 'Programming'],
    'Productivity': ['Productivity', 'Writing', 'Automation', 'Presentation', 'Text'],
    'Other': []
  };

  if (mainCategory === 'All') return true;

  const groupCategories = categoryGroups[mainCategory] || [];
  return groupCategories.includes(toolCategory) ||
    toolCategory.toLowerCase().includes(mainCategory.toLowerCase());
};

const getLogoUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;

// --- 2. TOOL CARD COMPONENT ---
const ToolCard = ({ tool, isSelected, onToggle, isMaxReached }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`
      group relative rounded-2xl p-6 border transition-colors duration-200
      ${isSelected
        ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-900'
        : 'bg-white dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }
    `}
  >
    <button
      onClick={(e) => onToggle(e, tool)}
      className={`
        absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center border transition-all z-20
        ${isSelected
          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
          : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 hover:border-slate-300 dark:hover:text-white dark:hover:border-slate-600 opacity-0 group-hover:opacity-100'
        }
        ${!isSelected && isMaxReached ? 'hidden' : ''}
      `}
    >
      {isSelected ? <CheckCircle2 size={14} /> : <Plus size={14} />}
    </button>

    <div className="flex flex-col mb-6">
      <div className="w-12 h-12 rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-center mb-5 bg-white dark:bg-[#0B0F1A]">
        <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {tool.category}
        </span>
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mb-2">{tool.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.description}</p>
    </div>

    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/50">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {tool.pricing}
      </span>

      <a
        href={tool.website}
        target="_blank"
        className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-1 hover:opacity-70 transition-opacity"
      >
        Visit <ArrowRight size={12} />
      </a>
    </div>
  </motion.div>
);

// --- 3. MAIN CONTENT COMPONENT ---
function AIToolsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

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

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/ai-tools.json');
        const data = await response.json();

        const transformedTools = data.map((item: any, index: number) => ({
          id: `${item.name}-${index}`,
          name: item.name,
          category: item.category,
          description: item.description,
          website: item.website,
          logo: getLogoUrl(item.website),
          pricing: item.pricing,
          rating: item.rating || 4.5,
          speed: item.speed || 'Fast',
          founded: item.founded || '2020',
          pros: item.pros || ['High quality output', 'User friendly'],
          cons: item.cons || ['Learning curve required'],
          bestFor: item.bestFor || 'General Purpose',
          apiAvailable: item.apiAvailable !== false
        }));

        setTools(transformedTools);
      } catch (err) {
        console.error('Error loading tools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleToggle = (e: React.MouseEvent, tool: Tool) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.find(t => t.id === tool.id)) return prev.filter(t => t.id !== tool.id);
      if (prev.length < 4) return [...prev, tool];
      return prev;
    });
  };

  const handleAnalyze = () => {
    const names = compareList.map(t => t.name).join(',');
    router.push(`/ai-tools/analyze?names=${encodeURIComponent(names)}`);
  };

  const filtered = tools.filter(t =>
    belongsToCategory(t.category, activeCat) &&
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = getCategories(tools);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800">
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-16 px-6 text-center z-10">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs font-medium tracking-[0.2em] uppercase text-slate-400 mb-6"
        >
          2026 Intelligence Index
        </motion.p>

        <motion.h1
          className="text-5xl md:text-6xl font-semibold tracking-tight mb-10 text-slate-900 dark:text-white"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        >
          Master The <span className="text-slate-400 dark:text-slate-500 italic">AI Era</span>
        </motion.h1>

        <div className="max-w-md mx-auto relative group">
          <div className="relative flex items-center bg-transparent rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors">
            <Search className="ml-4 text-slate-400 w-4 h-4" />
            <input
              className="w-full py-3.5 px-4 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-900 dark:text-white"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* --- EXPLORER --- */}
      <main className="max-w-6xl mx-auto px-6 pb-40 relative z-10">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 justify-center no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCat(cat.id);
                if (categoryParam) router.push('/ai-tools');
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeCat === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* AI Recommendations Section */}
        {categoryParam && (
          <div className="mb-16">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => router.push('/ai-tools')}
                className="text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <X size={12} /> Clear Filter
              </button>
            </div>
            <CategoryToolsResults category={categoryParam} />
            <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Directory</h2>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16 mb-4"></div>
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            <AnimatePresence>
              {filtered.map((tool, idx) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isSelected={!!compareList.find(c => c.id === tool.id)}
                  isMaxReached={compareList.length >= 4}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* --- COMPARISON DOCK --- */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2 pr-3 rounded-full shadow-lg flex items-center gap-6 max-w-lg w-full">
              <div className="flex items-center -space-x-2 pl-2">
                {compareList.map(t => (
                  <img key={t.id} src={t.logo} className="w-8 h-8 rounded-full border border-slate-700 dark:border-slate-300 bg-white object-contain" />
                ))}
                {compareList.length < 2 && <div className="w-8 h-8 rounded-full border border-dashed border-slate-700 dark:border-slate-300 flex items-center justify-center text-xs text-slate-500">+</div>}
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">Compare</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{compareList.length} / 4 selected</p>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => setCompareList([])} className="p-2 hover:bg-white/10 dark:hover:bg-black/5 rounded-full text-slate-400 dark:text-slate-500 transition">
                  <Trash2 size={16} />
                </button>
                <button
                  disabled={compareList.length < 2}
                  onClick={handleAnalyze}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-full font-medium text-sm transition-colors"
                >
                  Analyze
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 4. MAIN PAGE COMPONENT ---
export default function AIToolsDirectory() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AIToolsContent />
    </React.Suspense>
  );
}