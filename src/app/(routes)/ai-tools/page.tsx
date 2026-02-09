'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, X, LayoutGrid, List, Zap, ArrowRight,
  CheckCircle2, Plus, Trash2, ExternalLink,
  BarChart3, ShieldCheck, Clock, Star, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from "@/lib/supabase";

// --- 1. ROBUST DATA STRUCTURE ---
interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  // Deep Comparison Data
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number; // 0-5
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

// Extract and group categories from the data
const getCategories = (tools: Tool[]) => {
  const categoryGroups: { [key: string]: string[] } = {
    'AI Chat': ['AI Chat', 'Chatbot', 'Conversational AI', 'LLM'],
    'Image Generation': ['Image Generation', 'Image Editing', 'Design', 'Art'],
    'Video Generation': ['Video Generation', 'Video Editing', 'Animation'],
    'Coding': ['Coding', 'Development', 'Code Assistant', 'Programming'],
    'Productivity': ['Productivity', 'Writing', 'Automation', 'Presentation', 'Text'],
    'Other': []
  };

  // Group tools into main categories
  const mainCategories = Object.keys(categoryGroups);

  return [
    { id: 'All', label: 'All AI Tools' },
    ...mainCategories.map(cat => ({ id: cat, label: cat }))
  ];
};

// Helper function to check if tool belongs to a main category
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

const MOCK_TOOLS: Tool[] = [
  {
    id: 1, name: 'ChatGPT-4o', category: 'LLM', website: 'https://openai.com',
    description: 'The industry standard for conversational AI with reasoning capabilities.',
    pricing: 'Freemium', rating: 4.9, speed: 'Fast', founded: '2015',
    pros: ['Multimodal (Voice/Image)', 'Huge Plugin Store', 'Top reasoning'],
    cons: ['Usage limits on free tier', 'Can be verbose'],
    bestFor: 'General Purpose', apiAvailable: true
  },
  {
    id: 2, name: 'Claude 3.5', category: 'LLM', website: 'https://anthropic.com',
    description: 'Anthropic’s safest and most "human-feeling" AI model.',
    pricing: 'Freemium', rating: 4.8, speed: 'Fast', founded: '2021',
    pros: ['Massive Context Window', 'Natural Writing Style', 'Artifacts UI'],
    cons: ['Fewer plugins', 'Strict safety rails'],
    bestFor: 'Writing & Analysis', apiAvailable: true
  },
  {
    id: 3, name: 'Midjourney v6', category: 'Image', website: 'https://midjourney.com',
    description: 'Generates the most artistic and high-fidelity images available.',
    pricing: 'Paid', rating: 4.9, speed: 'Moderate', founded: '2022',
    pros: ['Unmatched aesthetics', 'Stylization control'],
    cons: ['Discord interface only', 'Steep learning curve'],
    bestFor: 'High-End Art', apiAvailable: false
  },
  {
    id: 4, name: 'Gemini Advanced', category: 'LLM', website: 'https://google.com',
    description: 'Google’s native AI deeply integrated with Workspace.',
    pricing: 'Freemium', rating: 4.7, speed: 'Fast', founded: '2023',
    pros: ['Google Ecosystem native', 'Real-time web data'],
    cons: ['Inconsistent logic sometimes', 'History privacy concerns'],
    bestFor: 'Research & Workspace', apiAvailable: true
  },
  {
    id: 5, name: 'Runway Gen-2', category: 'Video', website: 'https://runwayml.com',
    description: 'Text-to-video magic for filmmakers and creators.',
    pricing: 'Freemium', rating: 4.5, speed: 'Slow', founded: '2018',
    pros: ['Motion brush control', 'Cinematic quality'],
    cons: ['Expensive credits', 'Short clip duration'],
    bestFor: 'Video Production', apiAvailable: true
  },
  {
    id: 6, name: 'GitHub Copilot', category: 'Code', website: 'https://github.com',
    description: 'The world’s most widely adopted AI pair programmer.',
    pricing: 'Paid', rating: 4.8, speed: 'Fast', founded: '2008',
    pros: ['IDE Integration', 'Context awareness'],
    cons: ['Paid only', 'Can hallucinate APIs'],
    bestFor: 'Developers', apiAvailable: false
  },
  {
    id: 7, name: 'Perplexity', category: 'LLM', website: 'https://perplexity.ai',
    description: 'A conversational search engine that cites its sources.',
    pricing: 'Freemium', rating: 4.8, speed: 'Fast', founded: '2022',
    pros: ['Real-time citations', 'Focused mode'],
    cons: ['Less creative writing', 'Search dependent'],
    bestFor: 'Fact Checking', apiAvailable: true
  },
  {
    id: 8, name: 'Stable Diffusion', category: 'Image', website: 'https://stability.ai',
    description: 'Open source image generation you can run locally.',
    pricing: 'Free', rating: 4.6, speed: 'Moderate', founded: '2019',
    pros: ['Open Source', 'Run offline', 'Infinite control'],
    cons: ['Requires good GPU', 'Technical setup'],
    bestFor: 'Power Users', apiAvailable: true
  },
];

const getLogoUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;

// --- 2. TOOL CARD COMPONENT ---
const ToolCard = ({ tool, isSelected, onToggle, isMaxReached }: any) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className={`
      relative bg-white rounded-[2rem] p-6 border transition-all duration-300
      ${isSelected
        ? 'border-indigo-600 ring-4 ring-indigo-50/50 shadow-2xl'
        : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200'
      }
    `}
  >
    {/* Header */}
    <div className="flex justify-between items-start mb-6">
      <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center justify-center">
        <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" />
      </div>
      <button
        onClick={(e) => onToggle(e, tool)}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center border transition-all
          ${isSelected
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
          }
          ${!isSelected && isMaxReached ? 'opacity-30 cursor-not-allowed' : ''}
        `}
      >
        {isSelected ? <CheckCircle2 size={18} /> : <Plus size={20} />}
      </button>
    </div>

    {/* Info */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
          {tool.category}
        </span>
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
          <Star size={12} fill="currentColor" /> {tool.rating}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{tool.name}</h3>
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 h-10 mb-6">{tool.description}</p>

      {/* Mini Specs */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${tool.pricing === 'Free' ? 'bg-green-100 text-green-700' : tool.pricing === 'Paid' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {tool.pricing}
        </span>
        <a href={tool.website} target="_blank" className="text-sm font-bold text-indigo-600 flex items-center gap-1 group">
          View <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  </motion.div>
);

// --- 3. MAIN APP COMPONENT ---
export default function AIToolsDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

        // Transform the data to match our interface and add logos
        const transformedTools = data.map((item: any) => ({
          id: item.id || Math.random(),
          name: item.name,
          category: item.category,
          description: item.description,
          website: item.website,
          logo: getLogoUrl(item.website),
          pricing: item.pricing,
          rating: item.rating || 4.5, // Default rating if not provided
          speed: item.speed || 'Fast',
          founded: item.founded || '2020',
          pros: item.pros || ['High quality output', 'User friendly'],
          cons: item.cons || ['Learning curve required'],
          bestFor: item.bestFor || 'General Purpose',
          apiAvailable: item.apiAvailable !== false // Default to true
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
      if (prev.length < 3) return [...prev, tool];
      return prev;
    });
  };

  const filtered = tools.filter(t =>
    belongsToCategory(t.category, activeCat) &&
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = getCategories(tools);

  return (
    <div className="min-h-screen  text-slate-900 font-sans selection:bg-indigo-100">
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />
      {/* BACKGROUND FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />
      </div>

      {/* --- HERO HEADER --- */}
      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-16 px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E84E1B] border border-[#E84E1B] text-white shadow-sm mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">2026 Intelligence Index</p>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          Master the AI <span className="text-indigo-600 italic">Era.</span>
        </motion.h1>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <Search className="ml-5 text-slate-400 w-5 h-5" />
            <input
              className="w-full py-5 px-4 text-lg outline-none placeholder:text-slate-400"
              placeholder="Search 5,000+ AI tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>
      {/* --- EXPLORER --- */}
      <main className="max-w-7xl mx-auto px-6 pb-40 relative z-10">

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCat === cat.id
                ? 'bg-[#E84E1B] border-[#E84E1B] text-white shadow-lg scale-105'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading Skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-20"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence>
              {filtered.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isSelected={!!compareList.find(c => c.id === tool.id)}
                  isMaxReached={compareList.length >= 3}
                  onToggle={handleToggle}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* --- COMPARISON DOCK --- */}
      <AnimatePresence>
        {compareList.length > 0 && !isComparing && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-[#E84E1B] text-white p-3 pr-4 rounded-[2rem] shadow-2xl flex items-center gap-6 max-w-xl w-full border border-[#E84E1B]/50">
              <div className="flex items-center -space-x-3 pl-2">
                {compareList.map(t => (
                  <img key={t.id} src={t.logo} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-white object-contain" />
                ))}
                {compareList.length < 2 && <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-bold">+</div>}
              </div>

              <div className="flex-1">
                <p className="font-bold text-sm">Comparison Deck</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{compareList.length} / 3 Selected</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setCompareList([])} className="p-3 hover:bg-white/10 rounded-full text-slate-400 transition">
                  <Trash2 size={18} />
                </button>
                <button
                  disabled={compareList.length < 2}
                  onClick={() => setIsComparing(true)}
                  className="bg-[#E84E1B] hover:bg-[#E84E1B] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#E84E1B]/50"
                >
                  Analyze
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FULL SCREEN REAL-LIFE COMPARISON --- */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#FAFAFA] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Technical Comparison</h2>
                <p className="text-slate-500 text-sm">Analyzing {compareList.length} tools side-by-side</p>
              </div>
              <button onClick={() => setIsComparing(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-7xl mx-auto">

                {/* 1. PRODUCT HEADER ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {compareList.map(tool => (
                    <div key={tool.id} className="text-center">
                      <div className="w-24 h-24 mx-auto bg-white rounded-[2rem] shadow-lg border border-slate-100 p-4 mb-6 flex items-center justify-center">
                        <img src={tool.logo} className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-2xl font-black mb-2">{tool.name}</h3>
                      <div className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        {tool.category}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. THE SPEC SHEET TABLE */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">

                  {/* Row: Ratings */}
                  <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
                    <div className="p-6 bg-slate-50/50 flex items-center gap-3 font-bold text-slate-500">
                      <BarChart3 className="text-indigo-500" /> Overall Rating
                    </div>
                    {compareList.map(tool => (
                      <div key={tool.id} className="p-6 flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900">{tool.rating}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(tool.rating) ? "currentColor" : "none"} className={i < Math.floor(tool.rating) ? "" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Row: Pricing */}
                  <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
                    <div className="p-6 bg-slate-50/50 flex items-center gap-3 font-bold text-slate-500">
                      <Zap className="text-amber-500" /> Pricing Model
                    </div>
                    {compareList.map(tool => (
                      <div key={tool.id} className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${tool.pricing === 'Free' ? 'bg-green-100 text-green-700' :
                          tool.pricing === 'Paid' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {tool.pricing}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Row: Pros */}
                  <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
                    <div className="p-6 bg-slate-50/50 flex items-center gap-3 font-bold text-slate-500">
                      <CheckCircle2 className="text-green-500" /> Key Strengths
                    </div>
                    {compareList.map(tool => (
                      <div key={tool.id} className="p-6">
                        <ul className="space-y-3">
                          {tool.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Row: Cons */}
                  <div className="grid grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
                    <div className="p-6 bg-slate-50/50 flex items-center gap-3 font-bold text-slate-500">
                      <AlertCircle className="text-red-400" /> Limitations
                    </div>
                    {compareList.map(tool => (
                      <div key={tool.id} className="p-6">
                        <ul className="space-y-3">
                          {tool.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                              <X size={16} className="text-red-400 mt-0.5 shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Row: Technical Specs */}
                  <div className="grid grid-cols-4 divide-x divide-slate-100">
                    <div className="p-6 bg-slate-50/50 flex items-center gap-3 font-bold text-slate-500">
                      <ShieldCheck className="text-blue-500" /> Speed & API
                    </div>
                    {compareList.map(tool => (
                      <div key={tool.id} className="p-6 space-y-2">
                        <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                          <span className="text-slate-400">Speed</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Clock size={14} /> {tool.speed}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">API Access</span>
                          <span className={`font-bold ${tool.apiAvailable ? 'text-green-600' : 'text-slate-400'}`}>
                            {tool.apiAvailable ? 'Available' : 'No API'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-2">
                          <span className="text-slate-400">Founded</span>
                          <span className="font-bold text-slate-900">{tool.founded}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* 3. CTA BUTTONS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-20">
                  {compareList.map(tool => (
                    <div key={tool.id} className="text-center">
                      <a
                        href={tool.website}
                        target="_blank"
                        className="inline-flex items-center justify-center w-full py-4 bg-[#E84E1B] text-white font-bold rounded-xl shadow-xl hover:bg-[#E84E1B] hover:scale-105 transition-all"
                      >
                        Visit {tool.name} <ExternalLink size={16} className="ml-2" />
                      </a>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}