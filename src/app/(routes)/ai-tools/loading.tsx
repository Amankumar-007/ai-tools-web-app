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
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      <header className="relative pt-32 pb-16 px-6 text-center z-10 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 mx-auto rounded mb-6" />
        <div className="h-16 w-3/4 max-w-2xl bg-slate-200 dark:bg-slate-800 mx-auto rounded-lg mb-10" />
        <div className="max-w-md mx-auto h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-40 relative z-10 animate-pulse">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 border border-slate-200 dark:bg-[#0B0F1A] dark:border-slate-800">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl mb-5" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
