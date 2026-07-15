"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function TrendingReposLoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 animate-pulse">
        <div className="mb-20 max-w-3xl">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-6" />
          <div className="h-12 sm:h-16 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6" />
          <div className="h-6 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="flex items-center gap-4 pt-1">
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
