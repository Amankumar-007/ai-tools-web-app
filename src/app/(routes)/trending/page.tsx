"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Flame, 
  Zap, 
  Globe, 
  Code, 
  Video, 
  Search, 
  Activity,
  ExternalLink,
  Filter,
  Newspaper,
  Clock,
  ChevronRight,
  Cpu,
  Briefcase,
  Palette,
  LucideIcon
} from 'lucide-react';

// --- TYPES ---
interface Tool {
  rank: number;
  id: string;
  name: string;
  category: string;
  website: string;
  growth: string;
  trendScore: number;
  utilityScore: number;
  hypeScore: number;
  description: string;
  graphData: number[];
  icon: LucideIcon;
}

// --- DATA: TRENDING TOOLS ---
const ALL_TOOLS: Tool[] = [
  {
    rank: 1,
    id: 'deepseek',
    name: 'DeepSeek R1',
    category: 'Dev',
    website: 'deepseek.com',
    growth: '+4,200%',
    trendScore: 99,
    utilityScore: 95,
    hypeScore: 98,
    description: 'Open-source reasoning model beating proprietary giants. The new king of math & code.',
    graphData: [20, 45, 30, 80, 85, 95, 100],
    icon: Cpu
  },
  {
    rank: 2,
    id: 'lovable',
    name: 'Lovable',
    category: 'Dev',
    website: 'lovable.dev',
    growth: '+850%',
    trendScore: 97,
    utilityScore: 90,
    hypeScore: 92,
    description: 'Generative UI builder. Describe your app, and it writes the full-stack code instantly.',
    graphData: [10, 20, 40, 60, 85, 90, 97],
    icon: Code
  },
  {
    rank: 3,
    id: 'sora',
    name: 'Sora',
    category: 'Creative',
    website: 'openai.com',
    growth: '+620%',
    trendScore: 95,
    utilityScore: 80,
    hypeScore: 99,
    description: 'The standard for AI video generation. High-fidelity physics simulation from text.',
    graphData: [50, 55, 60, 90, 85, 92, 95],
    icon: Video
  },
  {
    rank: 4,
    id: 'perplexity',
    name: 'Perplexity',
    category: 'Productivity',
    website: 'perplexity.ai',
    growth: '+310%',
    trendScore: 94,
    utilityScore: 99,
    hypeScore: 85,
    description: 'Real-time search engine with citations. The most reliable "Google killer" yet.',
    graphData: [60, 65, 70, 75, 80, 90, 94],
    icon: Globe
  },
  {
    rank: 5,
    id: 'cursor',
    name: 'Cursor',
    category: 'Dev',
    website: 'cursor.com',
    growth: '+280%',
    trendScore: 92,
    utilityScore: 98,
    hypeScore: 88,
    description: 'The AI-first code editor. Predicts your next edit before you even type it.',
    graphData: [40, 50, 60, 70, 85, 88, 92],
    icon: Code
  },
  {
    rank: 6,
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'Creative',
    website: 'elevenlabs.io',
    growth: '+180%',
    trendScore: 88,
    utilityScore: 92,
    hypeScore: 85,
    description: 'Cinema-quality AI voice and sound effects. Now featuring instant dubbing.',
    graphData: [50, 50, 55, 65, 75, 80, 88],
    icon: Zap
  },
];

// --- DATA: NEWS FEED ---
const NEWS_ITEMS = [
  {
    id: 1,
    title: "OpenAI Announces GPT-5 Release Date Rumors",
    source: "TechCrunch",
    time: "2 hours ago",
    tag: "Models",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800" 
  },
  {
    id: 2,
    title: "NVIDIA Stock Surges as New AI Chip 'Blackwell' Ships",
    source: "Bloomberg",
    time: "4 hours ago",
    tag: "Hardware",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Google Gemini 2.5 Update: 10M Token Context Window?",
    source: "The Verge",
    time: "6 hours ago",
    tag: "Google",
    image: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Midjourney Launches Web Editor for In-Painting",
    source: "Ars Technica",
    time: "12 hours ago",
    tag: "Creative",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"
  }
];

export default function TrendingPageBright() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tools, setTools] = useState(ALL_TOOLS);

  // Filter Logic
  const handleFilter = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setTools(ALL_TOOLS);
    } else {
      setTools(ALL_TOOLS.filter(t => t.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* 1. NAVBAR (Clean White) */}


      {/* 2. LIVE TICKER */}
      <div className="bg-blue-50 border-b border-blue-100 text-[11px] sm:text-xs py-2 overflow-hidden whitespace-nowrap text-blue-800 font-medium">
        <div className="inline-flex animate-marquee gap-8 items-center px-4">
          <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> BREAKING: DeepSeek R1 outperforms GPT-4o in benchmarks</span>
          <span className="flex items-center gap-1 text-slate-500">● OpenAI rumors: GPT-5 training complete?</span>
          <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> Trending: "Vibe Coding" is taking over Twitter/X</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

        {/* 3. HERO SECTION (Compact / 50% Height Feel) */}
        <div className="relative mb-12 text-center py-8 sm:py-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Market Data • Feb 2026
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            Discover the next <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">AI Super Tools</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            We track social signals and developer activity to find the fastest-growing AI products before they go mainstream.
          </p>

          {/* Search Bar - Floating */}
          <div className="relative max-w-lg mx-auto z-10">
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-2 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="ml-4 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search tools (e.g. 'Video Gen')" 
                className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 px-4 py-2 outline-none"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* 4. FILTERS & CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
             {['All', 'Dev', 'Creative', 'Productivity'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter 
                    ? 'bg-slate-100 text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
             ))}
          </div>
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
             Sorted by <span className="text-slate-700 font-semibold">Momentum</span> <Filter size={12}/>
          </div>
        </div>

        {/* 5. TRENDING GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          
          {/* Top 2 Featured */}
          <div className="lg:col-span-2 space-y-4">
             {tools.slice(0, 2).map((tool: Tool, idx: number) => (
                <FeaturedCardBright key={tool.id} tool={tool} rank={idx + 1} />
             ))}
          </div>

          {/* List View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 h-fit">
             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Activity size={18} className="text-blue-500"/> Rising Fast
                </h3>
                <span className="text-xs text-slate-400">Last 24h</span>
             </div>
             <div className="flex flex-col">
                {tools.slice(2).map((tool: Tool, idx: number) => (
                   <CompactRowBright key={tool.id} tool={tool} rank={idx + 3} />
                ))}
             </div>
             <button className="w-full py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors mt-2">
                View All 50+ Tools
             </button>
          </div>
        </div>

        {/* 6. NEWS SECTION (New Feature) */}
        <div className="border-t border-slate-200 pt-12">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Newspaper className="text-blue-600" /> Latest AI News
                 </h2>
                 <p className="text-slate-500 mt-1">Daily digest of what's happening in the industry.</p>
              </div>
              <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                 Read Archive <ChevronRight size={16} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {NEWS_ITEMS.map((news) => (
                 <div key={news.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="h-40 overflow-hidden relative">
                       <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">
                          {news.tag}
                       </div>
                    </div>
                    <div className="p-4">
                       <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <span className="font-medium text-blue-600">{news.source}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {news.time}</span>
                       </div>
                       <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {news.title}
                       </h3>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>&copy; 2026 TrendRadar AI. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS (Bright Theme) ---

function FeaturedCardBright({ tool, rank }: { tool: Tool; rank: number }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Icon Area */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
             <img 
               src={`https://www.google.com/s2/favicons?domain=${tool.website}&sz=128`}
               alt={tool.name}
               className="w-8 h-8 object-contain"
             />
          </div>
          <span className="text-2xl font-black text-slate-200">#{rank}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-100">
               {tool.category}
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            {tool.description}
          </p>

          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Growth</span>
                <span className="text-green-600 font-bold text-lg flex items-center gap-1">
                   <TrendingUp size={16}/> {tool.growth}
                </span>
             </div>
             <div className="h-8 w-px bg-slate-100"></div>
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                <span className="text-orange-500 font-bold text-lg flex items-center gap-1">
                   <Flame size={16}/> {tool.trendScore}
                </span>
             </div>
          </div>
        </div>

        {/* Action & Graph */}
        <div className="flex flex-col justify-between items-end min-w-[100px]">
           {/* Tiny Graph */}
           <div className="h-10 w-24 flex items-end gap-1 mb-2 opacity-30 group-hover:opacity-100 transition-opacity">
              {tool.graphData.map((h: number, i: number) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-blue-500 rounded-t-sm" />
              ))}
           </div>
           
           <a 
             href={`https://${tool.website}`} 
             target="_blank"
             rel="noopener noreferrer"
             className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-md"
           >
             Visit
           </a>
        </div>
      </div>
    </div>
  );
}

function CompactRowBright({ tool, rank }: { tool: Tool; rank: number }) {
   return (
      <div className="group flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-b border-slate-50 last:border-0">
         <span className="font-mono text-slate-300 font-bold w-6 text-sm">#{rank}</span>
         
         <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img 
               src={`https://www.google.com/s2/favicons?domain=${tool.website}&sz=64`}
               alt={tool.name}
               className="w-4 h-4 object-contain"
            />
         </div>

         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
               <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                  {tool.name}
               </h4>
               <span className="text-green-600 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded">
                  {tool.growth}
               </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{tool.description}</p>
         </div>
      </div>
   )
}