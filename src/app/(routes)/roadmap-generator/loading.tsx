"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function GenericLoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 animate-pulse">
        <div className="mb-12 max-w-3xl">
          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6" />
          <div className="h-6 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
          <div className="h-6 w-4/5 max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
