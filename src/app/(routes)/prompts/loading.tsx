"use client";

import React, { useState, useEffect } from 'react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

export default function PromptsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 selection:bg-yellow-500/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 animate-pulse">
        <header className="text-center mb-16 flex flex-col items-center">
          <div className="h-16 md:h-20 w-3/4 max-w-2xl bg-white/10 rounded-lg mb-6" />
          <div className="h-6 w-full max-w-md bg-white/5 rounded-md" />
        </header>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-white/10 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="h-4 bg-white/10 rounded w-20 mb-4" />
              <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-full mb-4" />
              <div className="h-20 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
