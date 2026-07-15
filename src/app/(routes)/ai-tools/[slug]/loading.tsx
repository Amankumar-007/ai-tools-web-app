"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function AIToolSlugLoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={async () => {}} onProtectedLink={() => {}} />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2" />
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          </div>
          <div className="w-full sm:w-auto flex flex-col gap-3">
            <div className="h-12 w-full sm:w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
