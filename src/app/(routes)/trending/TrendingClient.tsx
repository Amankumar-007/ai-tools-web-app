"use client";

import {
  TrendingUp,
  Globe,
  Clock,
  ArrowUpRight,
  Filter,
  Star,
  GitFork
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from "@/lib/supabase";

// --- TYPES ---
interface Tool {
  rank: number;
  id: string;
  name: string;
  category: string;
  website: string;
  growth: string;
  trendScore: number;
  utilityScore: number;
  description: string;
  graphData: number[];
}

interface NewsItem {
  id: number;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  tag: string;
  image: string | null;
  snippet: string;
}

interface Repo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  ownerAvatar: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
}

interface TrendingClientProps {
  initialTools: Tool[];
  initialNews: NewsItem[];
  initialRepos: Repo[];
  totalRepoCount: number;
  lastUpdated: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function TrendingClient({ initialTools, initialNews, initialRepos, totalRepoCount, lastUpdated }: TrendingClientProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setUser(await getCurrentUser());
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  const handleProtectedLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(user ? href : `/login?redirect=${encodeURIComponent(href)}`);
  };

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    setTools(category === 'All' ? initialTools : initialTools.filter(t => t.category === category));
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const pubDate = new Date(dateStr);
      if (isNaN(pubDate.getTime())) return "Recently";
      const diffInHours = Math.floor((Date.now() - pubDate.getTime()) / 3600000);
      if (diffInHours < 1) return `Just now`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return `${Math.floor(diffInHours / 24)}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">

        {/* HERO */}
        <div className="mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Data
            <span className="normal-case text-slate-400">&middot; Updated {formatTimeAgo(lastUpdated)}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
            Trending AI Tools <span className="text-slate-400">&</span> News.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Real-time tracking of developer activity, social signals, and breaking news to surface the fastest-growing AI products.
          </p>
        </div>

        {/* NEWS SECTION */}
        <div className="mb-24">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
            <h2 className="text-xl font-medium">Latest Intelligence</h2>
            <a href="https://techcrunch.com/category/artificial-intelligence/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              Source: TechCrunch <ArrowUpRight size={14} />
            </a>
          </div>

          {initialNews && initialNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {/* Featured News */}
              <a href={initialNews[0].link} target="_blank" rel="noopener noreferrer" className="group lg:col-span-2 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/2 aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {initialNews[0].image ? (
                    <img
                      src={initialNews[0].image}
                      alt={initialNews[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
                      <Globe size={28} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mb-3">
                    <span>{initialNews[0].source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {formatTimeAgo(initialNews[0].pubDate)}</span>
                  </div>
                  <h3 className="text-2xl font-medium leading-tight mb-3 group-hover:text-red-500 transition-colors">
                    {initialNews[0].title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {initialNews[0].snippet}
                  </p>
                </div>
              </a>

              {/* Sidebar News */}
              <div className="flex flex-col gap-8">
                {initialNews.slice(1, 4).map((news) => (
                  <a href={news.link} target="_blank" rel="noopener noreferrer" key={news.id} className="group flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="text-slate-900 dark:text-slate-300">{news.source}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(news.pubDate)}</span>
                    </div>
                    <h4 className="text-base font-medium leading-snug group-hover:text-red-500 transition-colors line-clamp-2">
                      {news.title}
                    </h4>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-slate-500 font-mono text-sm">No recent news available.</div>
          )}
        </div>

        {/* GITHUB TRENDING REPOS */}
        <div className="mb-24">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
            <h2 className="text-xl font-medium">Trending on GitHub</h2>
            <span className="text-sm font-medium text-slate-500">Last 7 days &middot; by stars</span>
          </div>

          {initialRepos && initialRepos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialRepos.map((repo) => (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={repo.id}
                    className="group flex flex-col gap-3 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={repo.ownerAvatar} alt={repo.owner} className="w-5 h-5 rounded-full flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-500 truncate">{repo.owner}</span>
                    </div>
                    <h3 className="text-base font-medium leading-snug group-hover:text-red-500 transition-colors truncate">
                      {repo.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Star size={12} /> {formatCount(repo.stars)}</span>
                      <span className="flex items-center gap-1"><GitFork size={12} /> {formatCount(repo.forks)}</span>
                    </div>
                  </a>
                ))}
              </div>

              {totalRepoCount > initialRepos.length && (
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/trending/repos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    View more repos <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-slate-500 font-mono text-sm">No trending repos available right now.</div>
          )}
        </div>

        {/* TOOLS LEADERBOARD */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 gap-4">
            <h2 className="text-xl font-medium">Trending Tools</h2>

            <div className="flex items-center gap-4 text-sm font-medium">
              <Filter size={14} className="text-slate-400" />
              {['All', 'Dev', 'IDE', 'Creative', 'Productivity'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilter(filter)}
                  className={`transition-colors ${activeFilter === filter ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {tools.map((tool, idx) => (
              <a href={`https://${tool.website}`} target="_blank" rel="noopener noreferrer" key={tool.id} className="group flex flex-col sm:flex-row items-start sm:items-center py-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors px-2 -mx-2 rounded-lg">

                {/* Rank & Identity */}
                <div className="flex items-center gap-4 sm:w-[35%] min-w-0 mb-3 sm:mb-0">
                  <span className="font-mono text-slate-400 w-6 text-sm">{idx + 1}</span>
                  <div className="w-10 h-10 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                    <img src={`https://www.google.com/s2/favicons?domain=${tool.website}&sz=64`} alt={tool.name} className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base font-medium truncate group-hover:text-red-500 transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-0.5">
                      <span>{tool.category}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="sm:w-[45%] w-full sm:px-4 mb-3 sm:mb-0">
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed truncate">
                    {tool.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-end gap-6 w-full sm:w-[20%] text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Growth</span>
                    <span className="font-mono flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <TrendingUp size={12} className="text-emerald-500" /> {tool.growth}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Score</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {tool.trendScore}
                    </span>
                  </div>
                </div>

              </a>
            ))}

            {tools.length === 0 && (
              <div className="py-12 text-slate-500 font-mono text-sm">No tools found matching this category.</div>
            )}
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 mt-12 bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 text-slate-400 text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} TomatoAi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
