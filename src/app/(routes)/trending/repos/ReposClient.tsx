"use client";

import { Star, GitFork, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from "@/lib/supabase";

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

interface ReposClientProps {
  repos: Repo[];
  lastUpdated: string;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function ReposClient({ repos, lastUpdated }: ReposClientProps) {
  const [activeLanguage, setActiveLanguage] = useState('All');
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

  const languages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => r.language && set.add(r.language));
    return ['All', ...Array.from(set).sort()];
  }, [repos]);

  const filteredRepos = activeLanguage === 'All' ? repos : repos.filter((r) => r.language === activeLanguage);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">

        {/* HERO */}
        <div className="mb-14 max-w-3xl">
          <Link href="/trending" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Trending
          </Link>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Data
            <span className="normal-case text-slate-400">&middot; Updated {new Date(lastUpdated).toLocaleString()}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-tight mb-6">
            Trending on <span className="text-slate-400">GitHub.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Repositories created in the last 7 days, ranked by stars gained.
          </p>
        </div>

        {/* LANGUAGE FILTER */}
        {languages.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 text-sm font-medium">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`px-3 py-1.5 rounded-full border transition-colors ${activeLanguage === lang
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* REPO GRID */}
        {filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo, idx) => (
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                key={repo.id}
                className="group flex flex-col gap-3 p-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={repo.ownerAvatar} alt={repo.owner} className="w-5 h-5 rounded-full flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-500 truncate">{repo.owner}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex-shrink-0">#{idx + 1}</span>
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
        ) : (
          <div className="py-12 text-slate-500 font-mono text-sm">No repos found for this language.</div>
        )}

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 mt-12 bg-slate-50 dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 text-slate-400 text-xs font-mono">
          <p>&copy; {new Date().getFullYear()} TomatoAi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
