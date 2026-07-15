"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function N8nTemplatesLoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 animate-pulse">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-12 sm:h-16 w-3/4 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg mb-6" />
          <div className="h-6 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md" />
        </header>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-3" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md mb-6" />
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
