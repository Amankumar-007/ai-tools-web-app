'use client';

import React from 'react';

export default function AgentWorkflowLoading() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 animate-pulse">
            <header className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-slate-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded mb-8" />

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                        <div className="w-full">
                            <div className="flex gap-2 mb-2">
                                <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                            </div>
                            <div className="h-10 w-3/4 max-w-md bg-slate-200 dark:bg-white/10 rounded-lg" />
                        </div>
                    </div>

                    <div className="h-4 w-full max-w-2xl bg-slate-200 dark:bg-white/10 rounded mb-2" />
                    <div className="h-4 w-4/5 max-w-xl bg-slate-200 dark:bg-white/10 rounded mb-10" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-48 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 p-6">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded mb-6" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded" />
                                <div className="h-4 w-5/6 bg-slate-100 dark:bg-white/5 rounded" />
                                <div className="h-4 w-4/5 bg-slate-100 dark:bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="h-48 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 p-6">
                            <div className="h-4 w-40 bg-slate-200 dark:bg-white/10 rounded mb-6" />
                            <div className="space-y-4">
                                <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-lg" />
                                <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-10 pb-32">
                <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-lg mb-10" />

                <div className="space-y-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col md:odd:flex-row-reverse items-center justify-between md:justify-normal gap-8">
                            <div className="hidden md:block w-[calc(50%-3rem)]" />
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
                            <div className="w-full md:w-[calc(50%-3rem)] h-64 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 p-6">
                                <div className="h-6 w-3/4 bg-slate-100 dark:bg-white/5 rounded mb-4" />
                                <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded mb-2" />
                                <div className="h-4 w-5/6 bg-slate-100 dark:bg-white/5 rounded mb-6" />
                                <div className="h-24 w-full bg-slate-100 dark:bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
