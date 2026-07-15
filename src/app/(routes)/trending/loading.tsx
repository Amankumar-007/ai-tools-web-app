"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

export default function TrendingLoading() {
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-500">
      <MainNavbar user={user} onSignOut={handleSignOut} onProtectedLink={handleProtectedLink} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 animate-pulse">
        
        {/* HERO SKELETON */}
        <div className="mb-20 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-12 sm:h-16 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6" />
          <div className="h-6 w-full max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
          <div className="h-6 w-4/5 max-w-xl bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        {/* NEWS SECTION SKELETON */}
        <div className="mb-24">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {/* Featured News */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/2 aspect-[4/3] rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="w-full sm:w-1/2 flex flex-col justify-center">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-3" />
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
                <div className="h-8 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-1.5" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-1.5" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
            </div>

            {/* Sidebar News */}
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GITHUB TRENDING REPOS SKELETON */}
        <div className="mb-24">
          <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </div>

        {/* TOOLS LEADERBOARD SKELETON */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 gap-4">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center py-5 border-b border-slate-100 dark:border-slate-800/50 px-2 -mx-2">
                
                <div className="flex items-center gap-4 sm:w-[35%] w-full mb-3 sm:mb-0">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                  <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>

                <div className="sm:w-[45%] w-full sm:px-4 mb-3 sm:mb-0 flex flex-col gap-1.5">
                  <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>

                <div className="flex items-center justify-end gap-6 w-full sm:w-[20%]">
                  <div className="flex flex-col items-end gap-1">
                    <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="h-2.5 w-10 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
