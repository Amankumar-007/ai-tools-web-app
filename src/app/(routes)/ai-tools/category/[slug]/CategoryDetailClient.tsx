'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowLeft, ArrowUp, ExternalLink, Plus, CheckCircle2,
  Trash2, Filter, Sparkles, Check, Info, LayoutGrid, List,
  Star, ShieldCheck, Zap, Globe, ArrowRight, Share2
} from 'lucide-react';
import { CategoryInfo, ALL_CATEGORIES } from '@/lib/categories';
import { Tool } from '@/app/(routes)/ai-tools/AIToolsDirectoryClient';
import CategoryIcon from '@/components/CategoryIcon';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from '@/lib/supabase';
import { getLogoFallbackChain } from '@/lib/logoHelper';

// --- Smart Logo with waterfall fallback ---
const ToolLogo = ({ tool, size = 32, className = '' }: { tool: Tool; size?: number; className?: string }) => {
  const chain = useMemo(() => getLogoFallbackChain(tool.website, tool.logo), [tool.website, tool.logo]);
  const [srcIdx, setSrcIdx] = useState(0);
  const handleError = React.useCallback(() => {
    setSrcIdx((prev) => (prev < chain.length - 1 ? prev + 1 : prev));
  }, [chain.length]);

  const initial = tool.name?.[0]?.toUpperCase() || '?';

  if (chain.length === 0 || srcIdx >= chain.length) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold shadow-xs select-none ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.42)) }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={chain[srcIdx]}
      alt={tool.name}
      width={size}
      height={size}
      loading="lazy"
      onError={handleError}
      className={`object-contain ${className}`}
      style={{ width: size, height: size, imageRendering: '-webkit-optimize-contrast' }}
    />
  );
};

export default function CategoryDetailClient({
  category,
  tools: initialTools,
  relatedCategories,
}: {
  category: CategoryInfo;
  tools: Tool[];
  relatedCategories: CategoryInfo[];
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'freemium' | 'paid'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'upvotes' | 'name'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareList, setCompareList] = useState<Tool[]>([]);
  const [upvotesState, setUpvotesState] = useState<Record<number, number>>({});
  const [upvotedTools, setUpvotedTools] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setUser);
    try {
      const savedUpvotes = localStorage.getItem('tomato_ai_upvotes_map');
      if (savedUpvotes) setUpvotesState(JSON.parse(savedUpvotes));
      const savedUserVotes = localStorage.getItem('tomato_ai_user_upvotes');
      if (savedUserVotes) setUpvotedTools(new Set(JSON.parse(savedUserVotes)));
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpvote = (toolId: number) => {
    const isAlreadyUpvoted = upvotedTools.has(toolId);
    const newUpvoted = new Set(upvotedTools);
    let diff = 1;
    if (isAlreadyUpvoted) {
      newUpvoted.delete(toolId);
      diff = -1;
    } else {
      newUpvoted.add(toolId);
    }
    setUpvotedTools(newUpvoted);
    setUpvotesState((prev) => {
      const tool = initialTools.find((t) => t.id === toolId);
      const current = prev[toolId] ?? (tool?.upvotes || 0);
      const updated = { ...prev, [toolId]: Math.max(0, current + diff) };
      try {
        localStorage.setItem('tomato_ai_upvotes_map', JSON.stringify(updated));
        localStorage.setItem('tomato_ai_user_upvotes', JSON.stringify(Array.from(newUpvoted)));
      } catch {}
      return updated;
    });
    if (!isAlreadyUpvoted) showToast('Thanks for upvoting!');
  };

  const handleToggleCompare = (tool: Tool) => {
    setCompareList((prev) => {
      if (prev.find((t) => t.id === tool.id)) return prev.filter((t) => t.id !== tool.id);
      if (prev.length < 4) return [...prev, tool];
      showToast('Maximum 4 tools can be compared.');
      return prev;
    });
  };

  const handleAnalyze = () => {
    const names = compareList.map((t) => t.name).join(',');
    router.push(`/ai-tools/analyze?names=${encodeURIComponent(names)}`);
  };

  // Filter & Sort
  const filteredTools = useMemo(() => {
    return initialTools
      .filter((tool) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = tool.name.toLowerCase().includes(q);
          const matchDesc = tool.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (onlyVerified && !tool.isVerified) return false;
        if (pricingFilter === 'free' && tool.pricing !== 'Free') return false;
        if (pricingFilter === 'freemium' && tool.pricing !== 'Freemium') return false;
        if (pricingFilter === 'paid' && tool.pricing !== 'Paid') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          const upA = upvotesState[a.id] ?? (a.upvotes || 0);
          const upB = upvotesState[b.id] ?? (b.upvotes || 0);
          return upB - upA;
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [initialTools, searchTerm, onlyVerified, pricingFilter, sortBy, upvotesState]);

  // Key Category Metrics
  const stats = useMemo(() => {
    const freeCount = initialTools.filter((t) => t.pricing === 'Free').length;
    const verifiedCount = initialTools.filter((t) => t.isVerified).length;
    return {
      total: initialTools.length,
      freeCount,
      verifiedCount,
    };
  }, [initialTools]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070A13] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      <MainNavbar user={user} onSignOut={async () => signOut()} onProtectedLink={() => {}} />

      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-36">
        {/* Breadcrumb Navigation & Back Link */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/ai-tools" className="hover:text-slate-900 dark:hover:text-white transition">AI Tools</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{category.name}</span>
          </nav>

          <Link
            href="/ai-tools"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Directory
          </Link>
        </div>

        {/* --- PREMIUM CATEGORY HERO BANNER --- */}
        <header className="relative rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200/90 dark:border-slate-800 p-8 md:p-10 mb-10 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Top Rainbow/Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-purple-400 to-amber-400" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              {/* Category Icon Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 shadow-xs">
                <CategoryIcon
                  slug={category.slug}
                  iconName={category.iconName}
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  size={32}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {category.name} AI Tools
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                    {stats.total} Curated Tools
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Quick Category Stat Pills */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-medium">Free Tools</p>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{stats.freeCount} Tools</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-medium">Source Checked</p>
                <p className="text-lg font-extrabold text-blue-600 mt-0.5">{stats.verifiedCount}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-medium">Tools Listed</p>
                <p className="text-lg font-extrabold text-amber-500 mt-0.5">{stats.total}</p>
              </div>
            </div>
          </div>
        </header>

        {/* --- SEARCH, FILTERS & SORTING TOOLBAR --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#0E1322] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          {/* In-category Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${category.name} tools...`}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Pricing & Verified Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(['all', 'free', 'freemium', 'paid'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPricingFilter(p)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize transition cursor-pointer ${
                  pricingFilter === p
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p === 'all' ? 'All Pricing' : p}
              </button>
            ))}

            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                onlyVerified
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ✓ Source checked
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="upvotes">Sort: Community Votes</option>
              <option value="name">Sort: Name A-Z</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* --- TOOLS RESULTS --- */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0E1322] rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No tools found matching your search and filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPricingFilter('all');
                setOnlyVerified(false);
              }}
              className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* --- GRID VIEW --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const count = upvotesState[tool.id] ?? (tool.upvotes || 0);
              const isUpvoted = upvotedTools.has(tool.id);
              const isComparing = compareList.some((c) => c.id === tool.id);

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200/90 dark:border-slate-800/90 p-6 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Logo, Name, Rating & Upvote Button */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <ToolLogo tool={tool} size={40} className="rounded-lg" />
                        </div>

                        <div>
                          <Link
                            href={tool.slug ? `/ai-tools/${tool.slug}` : tool.website}
                            className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
                          >
                            <span>{tool.name}</span>
                            {tool.isVerified && (
                              <span title="Official source checked" className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                ✓
                              </span>
                            )}
                          </Link>

                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{tool.pricing}</div>
                        </div>
                      </div>

                      {/* Upvote Pill */}
                      <button
                        onClick={() => handleUpvote(tool.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          isUpvoted
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <ArrowUp size={12} className={isUpvoted ? 'stroke-[2.5]' : ''} />
                        <span>{count}</span>
                      </button>
                    </div>

                    {/* Tool Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    {/* Pros / Highlights Tags */}
                    {tool.pros && tool.pros.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {tool.pros.slice(0, 2).map((pro, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            ✓ {pro}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Compare Toggle & Visit Button */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleCompare(tool)}
                      className={`flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                        isComparing
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {isComparing ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                      <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                    </button>

                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <ExternalLink size={12} />
                      <span>Visit</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* --- LIST VIEW --- */
          <div className="rounded-3xl bg-white dark:bg-[#0E1322] border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTools.map((tool) => {
              const count = upvotesState[tool.id] ?? (tool.upvotes || 0);
              const isUpvoted = upvotedTools.has(tool.id);
              const isComparing = compareList.some((c) => c.id === tool.id);

              return (
                <div
                  key={tool.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <ToolLogo tool={tool} size={32} className="rounded-md" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link
                          href={tool.slug ? `/ai-tools/${tool.slug}` : tool.website}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 transition truncate"
                        >
                          {tool.name}
                        </Link>
                        {tool.isVerified && (
                          <span title="Official source checked" className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">
                            ✓
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tool.pricing}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleUpvote(tool.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        isUpvoted
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <ArrowUp size={11} />
                      <span>{count}</span>
                    </button>

                    <button
                      onClick={() => handleToggleCompare(tool)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                      title="Compare tool"
                    >
                      {isComparing ? <CheckCircle2 size={16} className="text-blue-600" /> : <Plus size={16} />}
                    </button>

                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Visit</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- EXPLORE ALL 70 CATEGORIES SECTION --- */}
        <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Explore All 70 AI Categories
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse our complete index of specialized AI tools.
              </p>
            </div>
            <Link
              href="/ai-tools"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Full Directory <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ALL_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/ai-tools/category/${c.slug}`}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center group ${
                  c.slug === category.slug
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-[#0E1322] border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-2xs'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CategoryIcon
                    slug={c.slug}
                    iconName={c.iconName}
                    className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-blue-600"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate w-full">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* --- COMPARISON FLOATING DOCK --- */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-2.5 pr-4 rounded-full shadow-2xl flex items-center gap-5 max-w-lg w-full border border-slate-700/50 dark:border-slate-300">
              <div className="flex items-center -space-x-2 pl-2">
                {compareList.map((t) => (
                  <img
                    key={t.id}
                    src={t.logo}
                    alt={t.name}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-white bg-white object-contain shadow-xs"
                  />
                ))}
                {compareList.length < 2 && (
                  <div className="w-8 h-8 rounded-full border border-dashed border-slate-600 dark:border-slate-400 flex items-center justify-center text-xs text-slate-400">
                    +
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-sm">Compare AI Tools</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {compareList.length} / 4 selected
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareList([])}
                  className="p-2 hover:bg-white/10 dark:hover:bg-black/5 rounded-full text-slate-400 dark:text-slate-500 transition cursor-pointer"
                  title="Clear selection"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  disabled={compareList.length < 2}
                  onClick={handleAnalyze}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
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
