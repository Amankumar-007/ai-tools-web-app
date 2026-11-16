"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function AIToolsLoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      {/* Hero Skeleton */}
      <header className="relative pt-32 pb-14 px-6 text-center animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800/80 mx-auto rounded-full mb-5" />
        <div className="h-12 w-3/4 max-w-xl bg-slate-200 dark:bg-slate-800/80 mx-auto rounded-2xl mb-4" />
        <div className="h-4 w-1/2 max-w-md bg-slate-200 dark:bg-slate-800/80 mx-auto rounded-lg mb-8" />
        <div className="max-w-2xl mx-auto h-14 bg-slate-200 dark:bg-slate-800/80 rounded-2xl mb-5" />
        <div className="flex gap-2 justify-center flex-wrap max-w-lg mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-7 w-20 bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
          ))}
        </div>
      </header>

      {/* Main Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-36 animate-pulse">
        {/* Featured 4 cards */}
        <div className="mb-14">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800/80 rounded-md mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800" />
            ))}
          </div>
        </div>

        {/* Categories 8 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[480px] rounded-3xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800" />
          ))}
        </div>
      </main>
    </div>
  );
}

