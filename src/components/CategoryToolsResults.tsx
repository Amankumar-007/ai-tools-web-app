'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star, ExternalLink, RefreshCw, Sparkles, AlertCircle, ArrowUpRight
} from 'lucide-react';

interface CategoryTool {
  id: number;
  name: string;
  description: string;
  website: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  category: string;
}

interface CategoryToolsResultsProps {
  category: string;
}

const getFaviconUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
  }
};

const ToolCard = ({ tool }: { tool: CategoryTool; index: number }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col justify-between bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none"
    >
      <div>
        {/* Header: Logo & Badges */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 bg-white dark:bg-[#0B0F1A] rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-center shadow-sm">
            {!imgError ? (
              <img
                src={getFaviconUrl(tool.website)}
                alt={tool.name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="text-slate-400 font-bold text-lg">{tool.name.charAt(0)}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
              <Star size={12} className="text-amber-500" fill="currentColor" />
              {tool.rating.toFixed(1)}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${tool.pricing === 'Free' ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400' :
                tool.pricing === 'Paid' ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400'
              }`}>
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mb-2 truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-10 mb-6">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors group/link"
        >
          Visit Platform <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 animate-pulse flex flex-col justify-between min-h-[220px]">
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="w-16 h-6 bg-slate-100 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="w-2/3 h-5 bg-slate-100 dark:bg-slate-800 rounded-md mb-3" />
      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-md mb-2" />
      <div className="w-4/5 h-4 bg-slate-100 dark:bg-slate-800 rounded-md mb-6" />
    </div>
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
    </div>
  </div>
);

export default function CategoryToolsResults({ category }: CategoryToolsResultsProps) {
  const [tools, setTools] = useState<CategoryTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/category-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setTools(data.tools || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [category]);

  if (error) {
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <AlertCircle size={32} className="mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Discovery Failed</h3>
        <p className="text-slate-500 text-sm mb-6">Could not retrieve tools for this category.</p>
        <button
          onClick={fetchTools}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Sparkles size={18} className="text-slate-900 dark:text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Discovery Results
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Top picks for "{category}"
            </p>
          </div>
        </div>

        <button
          onClick={fetchTools}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          title="Refresh results"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))
        }
      </div>
    </div>
  );
}