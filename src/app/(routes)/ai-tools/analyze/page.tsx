'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Sparkles, RefreshCw, Star, Zap,
  CheckCircle2, AlertCircle, ShieldCheck,
  ExternalLink, ArrowUpRight, BarChart3, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, User } from "@/lib/supabase";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo?: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  speed: 'Fast' | 'Moderate' | 'Slow';
  founded: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  apiAvailable: boolean;
}

const getLogoUrl = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=128`;
  }
};

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const namesParam = searchParams.get('names');

  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadTools = async () => {
      if (!namesParam) return;

      try {
        setIsLoadingTools(true);
        const names = namesParam.split(',');
        const response = await fetch('/data/ai-tools.json');
        const allTools = await response.json();

        const filtered = allTools
          .filter((t: any) => names.includes(t.name))
          .map((item: any, index: number) => ({
            id: `${item.name}-${index}`,
            name: item.name,
            category: item.category,
            description: item.description,
            website: item.website,
            logo: getLogoUrl(item.website),
            pricing: item.pricing,
            rating: item.rating || 4.5,
            speed: item.speed || 'Fast',
            founded: item.founded || '2020',
            pros: item.pros || ['High quality output', 'User friendly'],
            cons: item.cons || ['Learning curve required'],
            bestFor: item.bestFor || 'General Purpose',
            apiAvailable: item.apiAvailable !== false
          }));

        setSelectedTools(filtered);

        // Start AI Analysis automatically
        if (filtered.length >= 2) {
          performAIAnalysis(filtered);
        }
      } catch (err) {
        console.error('Error loading tools for analysis:', err);
      } finally {
        setIsLoadingTools(false);
      }
    };

    loadTools();
  }, [namesParam]);

  const performAIAnalysis = async (tools: Tool[]) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const response = await fetch('/api/analyze-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      });

      const data = await response.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to generate analysis');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setAiAnalysis("### Analysis Failed\n\nSorry, we couldn't generate the AI comparison at this time. Please check your connection or try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoadingTools) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] flex flex-col items-center justify-center">
        <RefreshCw className="animate-spin text-slate-400 mb-4" size={32} />
        <p className="text-slate-500 font-medium">Gathering tool data...</p>
      </div>
    );
  }

  if (selectedTools.length < 2) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-amber-500 mb-6" size={48} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Insufficient Data</h2>
        <p className="text-slate-500 max-w-md mb-8">Please select at least 2 AI tools to perform a deep comparison analysis.</p>
        <button
          onClick={() => router.push('/ai-tools')}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 font-sans pb-20">
      <MainNavbar user={user} onSignOut={() => { }} onProtectedLink={(e, href) => router.push(href)} />

      <div className="max-w-6xl mx-auto px-6 pt-32">
        {/* Header and Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ai-tools')}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-[#0B0F1A]"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Intelligence Index</h1>
              <p className="text-slate-500 text-sm mt-1">Deep architectural comparison of {selectedTools.length} platforms</p>
            </div>
          </div>

          <button
            onClick={() => performAIAnalysis(selectedTools)}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold shadow-xl shadow-slate-200 dark:shadow-none hover:opacity-90 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {selectedTools.map((tool, idx) => (
            <div
              key={tool.id}
              className="group relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 dark:border-slate-800 flex flex-col text-center items-center h-full group-hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full">INDEX {idx + 1}</span>
              </div>
              <div className="w-24 h-24 bg-white dark:bg-[#0B0F1A] rounded-3xl border border-slate-100 dark:border-slate-800 p-5 mb-8 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-500">
                <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tool.name}</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-6">{tool.category}</p>

              <div className="space-y-4 w-full mt-auto">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>RATING</span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-slate-900 dark:text-white">{tool.rating}</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${(tool.rating / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- DYNAMIC AI DASHBOARD --- */}
        <div className="space-y-12">

          {/* Section 1: The Radar Map & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/20 dark:border-slate-800"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Neural Distribution</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Multi-dimensional Metrics</p>
                </div>
              </div>

              <div className="h-[400px] w-full">
                {isAnalyzing ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="animate-spin text-slate-300" size={48} />
                  </div>
                ) : aiAnalysis?.metrics ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'Speed', fullMark: 100 },
                      { subject: 'Accuracy', fullMark: 100 },
                      { subject: 'Value', fullMark: 100 },
                      { subject: 'Innovation', fullMark: 100 },
                      { subject: 'Ease of Use', fullMark: 100 },
                    ].map(s => {
                      const item: any = { ...s };
                      aiAnalysis.metrics.forEach((m: any) => {
                        item[m.name] = m[s.subject.toLowerCase().replace(/ /g, '')] || m[s.subject.toLowerCase()];
                      });
                      return item;
                    })}>
                      <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      {aiAnalysis.metrics.map((m: any, i: number) => (
                        <Radar
                          key={m.name}
                          name={m.name}
                          dataKey={m.name}
                          stroke={i === 0 ? '#0f172a' : i === 1 ? '#64748b' : '#94a3b8'}
                          fill={i === 0 ? '#0f172a' : i === 1 ? '#64748b' : '#94a3b8'}
                          fillOpacity={0.4}
                        />
                      ))}
                      <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Waiting for analysis...</div>
                )}
              </div>
            </div>

            <div
              className="bg-slate-900 text-white rounded-[3rem] p-12 relative overflow-hidden flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Sparkles className="text-white/40 mb-6" size={48} />
                <h2 className="text-4xl font-bold mb-6 italic leading-tight">Architecture <br />Insights</h2>
                <div className="prose prose-invert prose-p:text-slate-300 prose-p:leading-relaxed max-w-none">
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-4/6 animate-pulse" />
                    </div>
                  ) : (
                    <p className="text-xl font-medium text-slate-200">
                      {aiAnalysis?.summary || "Comprehensive analysis of selected tools across various performance vectors and ecosystem capabilities."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Feature Matrix */}
          <div
            className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-10 border border-white/20 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <ShieldCheck className="text-slate-900 dark:text-white" /> Feature Capabilities Matrix
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="py-6 px-4 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-400">Capabilities</th>
                    {selectedTools.map(t => (
                      <th key={t.id} className="py-6 px-4 text-center text-sm font-bold">{t.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isAnalyzing ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                        <td className="py-6 px-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32 animate-pulse" /></td>
                        {selectedTools.map(t => (
                          <td key={t.id} className="py-6 px-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-8 mx-auto animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : aiAnalysis?.features?.map((f: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-6 px-4 font-bold text-slate-500">{f.feature}</td>
                      {selectedTools.map(t => {
                        const val = f[t.name];
                        return (
                          <td key={t.id} className="py-6 px-4 text-center">
                            {val === '✓' ? <CheckCircle2 className="mx-auto text-green-500" size={20} /> :
                              val === '✗' ? <AlertCircle className="mx-auto text-slate-300" size={20} /> :
                                <span className="text-xs font-bold text-blue-500 uppercase">{val || 'N/A'}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: The Verdict Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isAnalyzing ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[3rem] animate-pulse" />
              ))
            ) : aiAnalysis?.highlights?.map((h: any, i: number) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">Classification</span>
                  <h3 className="text-2xl font-bold mb-4">{h.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{h.reason}</p>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl">
                    {h.tool.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">{h.tool}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final Verdict Section - Professional Redesign */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-4 bg-slate-900 p-12 flex flex-col justify-between text-white">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold tracking-widest uppercase mb-6">
                    <Zap size={10} className="fill-white" /> Expert Consensus
                  </div>
                  <h2 className="text-4xl font-black tracking-tight mb-4 italic leading-[1.1]">Strategic <br/>Verdict.</h2>
                </div>
                <div className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                  Final Recommendation Index
                </div>
              </div>
              <div className="lg:col-span-8 p-12 flex flex-col justify-center">
                <div className="max-w-2xl">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white leading-snug mb-8">
                    {aiAnalysis?.verdict || "Analysis in progress. Our multi-dimensional engine is cross-referencing capabilities to determine the optimal strategic fit."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => router.push('/ai-tools')}
                      className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      Browse Directory <ExternalLink size={16} />
                    </button>
                    <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-slate-400" /> System Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#0B0F1A] flex items-center justify-center">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    }>
      <AnalyzeContent />
    </React.Suspense>
  );
}
