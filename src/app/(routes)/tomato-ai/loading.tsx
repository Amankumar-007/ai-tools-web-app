"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function TomatoAILoading() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="flex h-[100dvh] bg-[#f9f9f9] dark:bg-[#0A0A0A] overflow-hidden selection:bg-black/10 dark:selection:bg-white/10 transition-colors duration-500">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/5 transition-colors z-20">
        <div className="p-4 pt-6">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 animate-pulse" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 overflow-hidden px-3 mt-4">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-4 animate-pulse ml-2" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-lg mb-2 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
        <MainNavbar user={user} onSignOut={async () => { }} onProtectedLink={() => { }} />

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-pulse mt-16">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6 mx-auto" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4 mx-auto" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
        </div>

        {/* Input Area Skeleton */}
        <div className="p-4 mb-4">
          <div className="max-w-3xl mx-auto w-full h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
