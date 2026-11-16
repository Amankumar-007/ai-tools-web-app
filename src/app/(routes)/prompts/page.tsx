'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import { PROMPTS, PROMPT_CATEGORIES } from '@/data/prompt-library';

const PAGE_SIZE = 24;

export default function PromptList() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categoryCounts = useMemo(() => Object.fromEntries(
    PROMPT_CATEGORIES.map((item) => [item, item === 'All' ? PROMPTS.length : PROMPTS.filter((prompt) => prompt.category === item).length])
  ), []);

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PROMPTS.filter((prompt) =>
      (category === 'All' || prompt.category === category) &&
      (!query || `${prompt.title} ${prompt.description} ${prompt.category} ${prompt.content}`.toLowerCase().includes(query))
    );
  }, [search, category]);

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 selection:bg-blue-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" aria-label="TomatoTool home">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <span>tomato<span className="font-normal">Tool</span></span>
          </Link>
          <nav aria-label="Site navigation" className="flex items-center gap-5 text-sm text-slate-600 sm:gap-7">
            <Link href="/ai-tools" className="hover:text-slate-950">AI tools</Link>
            <Link href="/trending" className="hover:text-slate-950">Trending</Link>
            <Link href="/" className="hidden items-center gap-1 hover:text-slate-950 sm:inline-flex">Home <ArrowUpRight size={14} /></Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <section className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">The prompt library</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">A useful starting point for your next idea.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {PROMPTS.length} ready-to-use prompts for writing, coding, research, design, and more. Pick a task, replace the bracketed details, and make it yours.
          </p>
        </section>

        <section aria-label="Find prompts" className="mt-11">
          <div className="flex max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search by task, topic, or keyword" aria-label="Search prompts" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {search && <button type="button" onClick={() => { setSearch(''); setVisibleCount(PAGE_SIZE); }} aria-label="Clear search" className="rounded p-1 text-slate-400 hover:text-slate-900"><X size={17} /></button>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2" aria-label="Prompt categories">
            {PROMPT_CATEGORIES.map((item) => (
              <button key={item} type="button" onClick={() => selectCategory(item)} aria-pressed={category === item}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${category === item ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}>
                {item} <span className={category === item ? 'ml-1 text-slate-300' : 'ml-1 text-slate-400'}>{categoryCounts[item]}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="results-heading" className="mt-12">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 id="results-heading" className="text-xl font-semibold tracking-tight">{category === 'All' ? 'Explore prompts' : `${category} prompts`}</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found</p>
          </div>
          {filteredPrompts.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPrompts.slice(0, visibleCount).map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
              </div>
              {visibleCount < filteredPrompts.length && <div className="mt-10 flex justify-center">
                <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-slate-500 hover:bg-slate-50">Show more prompts</button>
              </div>}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="font-medium">No prompts found</p>
              <p className="mt-2 text-sm text-slate-500">Try a different search or category.</p>
              <button type="button" onClick={() => { setSearch(''); selectCategory('All'); }} className="mt-5 text-sm font-semibold text-blue-700 hover:underline">Clear filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
