'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock3, Play, Search, X } from 'lucide-react';
import videoData from '../../../../public/data/ai-videos.json';

interface Video {
  videoId: string;
  title: string;
  author: string;
  category: string;
  duration: string;
  thumbnail: string;
}

const PAGE_SIZE = 24;
const catalog = videoData as Video[];
const categories = ['All', ...new Set(catalog.map((video) => video.category))];
const categoryCounts = Object.fromEntries(categories.map((item) => [item, item === 'All' ? catalog.length : catalog.filter((video) => video.category === item).length]));

// Mix topics on the main view while preserving search order within each category.
const mixedCatalog = (() => {
  const groups = categories.slice(1).map((category) => catalog.filter((video) => video.category === category));
  const mixed: Video[] = [];
  for (let index = 0; mixed.length < catalog.length; index++) {
    for (const group of groups) if (group[index]) mixed.push(group[index]);
  }
  return mixed;
})();

function durationSeconds(value: string) {
  return value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

export default function AIVideosPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState('Any length');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Video | null>(null);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return mixedCatalog.filter((video) => {
      if (category !== 'All' && video.category !== category) return false;
      if (search && !`${video.title} ${video.author} ${video.category}`.toLowerCase().includes(search)) return false;
      const seconds = durationSeconds(video.duration);
      if (duration === 'Under 10 min' && seconds >= 600) return false;
      if (duration === '10–30 min' && (seconds < 600 || seconds > 1800)) return false;
      if (duration === 'Over 30 min' && seconds <= 1800) return false;
      return true;
    });
  }, [category, query, duration]);

  useEffect(() => {
    if (!selected) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onEscape); };
  }, [selected]);

  const chooseCategory = (value: string) => { setCategory(value); setVisibleCount(PAGE_SIZE); };
  const clearFilters = () => { setQuery(''); setCategory('All'); setDuration('Any length'); setVisibleCount(PAGE_SIZE); };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" aria-label="TomatoTool home">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <span>tomato<span className="font-normal">Tool</span></span>
          </Link>
          <nav aria-label="Site navigation" className="flex items-center gap-5 text-sm text-slate-600 sm:gap-7">
            <Link href="/ai-tools" className="hover:text-slate-950">AI tools</Link>
            <Link href="/ai-workflows" className="hover:text-slate-950">Workflows</Link>
            <Link href="/prompts" className="hidden hover:text-slate-950 sm:block">Prompts</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <section className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Watch and learn</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">AI videos for every skill level.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore {catalog.length.toLocaleString()} videos across {categories.length - 1} topics. Find a quick walkthrough, a practical tutorial, or a deeper course on the tools you want to learn.
          </p>
        </section>

        <section aria-label="Find videos" className="mt-11">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex max-w-2xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Search videos, creators, or topics" aria-label="Search AI videos" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              {query && <button type="button" onClick={() => { setQuery(''); setVisibleCount(PAGE_SIZE); }} aria-label="Clear search" className="rounded p-1 text-slate-400 hover:text-slate-900"><X size={17} /></button>}
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 sm:w-48">
              <Clock3 size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="sr-only">Video length</span>
              <select value={duration} onChange={(event) => { setDuration(event.target.value); setVisibleCount(PAGE_SIZE); }} className="h-14 min-w-0 flex-1 bg-transparent text-slate-800 outline-none">
                {['Any length', 'Under 10 min', '10–30 min', 'Over 30 min'].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-7 flex flex-wrap gap-2" aria-label="Video categories">
            {categories.map((item) => <button key={item} type="button" onClick={() => chooseCategory(item)} aria-pressed={category === item}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${category === item ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}>
              {item} <span className={category === item ? 'ml-1 text-slate-300' : 'ml-1 text-slate-400'}>{categoryCounts[item]}</span>
            </button>)}
          </div>
        </section>

        <section aria-labelledby="video-results" className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div><h2 id="video-results" className="text-xl font-semibold tracking-tight">{category === 'All' ? 'Explore videos' : `${category} videos`}</h2><p className="mt-1 text-sm text-slate-500">{filtered.length.toLocaleString()} {filtered.length === 1 ? 'video' : 'videos'} found</p></div>
            {(query || category !== 'All' || duration !== 'Any length') && <button type="button" onClick={clearFilters} className="text-sm font-semibold text-blue-700 hover:underline">Clear filters</button>}
          </div>
          {filtered.length ? <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.slice(0, visibleCount).map((video) => <button key={video.videoId} type="button" onClick={() => setSelected(video)} className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md" aria-label={`Play ${video.title}`}>
                <div className="relative aspect-video bg-slate-200">
                  <img src={video.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" onError={(event) => {
                    if (event.currentTarget.src.endsWith('/mqdefault.jpg')) event.currentTarget.style.display = 'none';
                    else event.currentTarget.src = `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`;
                  }} />
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">{video.duration}</span>
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-950 opacity-90 shadow-sm transition-transform group-hover:scale-110"><Play size={16} fill="currentColor" /></span>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-blue-700">{video.category}</span>
                  <h3 className="mt-2 line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-slate-950 group-hover:text-blue-700">{video.title}</h3>
                  <p className="mt-3 truncate border-t border-slate-100 pt-3 text-xs text-slate-500">{video.author}</p>
                </div>
              </button>)}
            </div>
            {visibleCount < filtered.length && <div className="mt-10 flex justify-center"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:border-slate-500 hover:bg-slate-50">Show more videos</button></div>}
          </> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><p className="font-medium">No videos found</p><p className="mt-2 text-sm text-slate-500">Try another search, category, or length.</p><button type="button" onClick={clearFilters} className="mt-5 text-sm font-semibold text-blue-700 hover:underline">Clear filters</button></div>}
        </section>
      </main>

      {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <div role="dialog" aria-modal="true" aria-label={selected.title} className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3"><p className="truncate text-sm font-semibold text-slate-900">{selected.title}</p><button type="button" onClick={() => setSelected(null)} aria-label="Close video" className="rounded p-1 text-slate-600 hover:bg-slate-100"><X size={20} /></button></div>
          <div className="aspect-video bg-black"><iframe src={`https://www.youtube-nocookie.com/embed/${selected.videoId}?autoplay=1&rel=0`} title={selected.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
          <a href={`https://www.youtube.com/watch?v=${selected.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1 px-4 py-3 text-sm font-medium text-blue-700 hover:underline">Open on YouTube <ArrowUpRight size={14} /></a>
        </div>
      </div>}
    </div>
  );
}
