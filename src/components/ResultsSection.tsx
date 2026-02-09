
import React, { Suspense } from 'react';
import { AnalysisResult } from '../types/types';
import dynamic from 'next/dynamic';

const GaugeChart = dynamic(() => import('./GaugeChart'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-48 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
});

interface ResultsSectionProps {
  result: AnalysisResult;
  onReset: () => void;
  onOptimize?: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ result, onReset, onOptimize }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Analysis Results</h2>
          <p className="text-slate-500 dark:text-slate-400">Here's how your resume stacks up.</p>
        </div>
        <div className="flex gap-4">
          {onOptimize && (
            <button
              onClick={onOptimize}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all font-bold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fix Resume for this Role
            </button>
          )}
          <button
            onClick={onReset}
            className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center gap-2 px-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <Suspense fallback={<div className="flex items-center justify-center h-48 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.score} label="Overall Score" color="#f97316" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-48 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.atsCompatibility} label="ATS Compatibility" color="#10b981" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-48 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.grammarAndStyleScore} label="Grammar & Style" color="#8b5cf6" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-48 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.experienceRelevanceScore} label="Career Flow" color="#f43f5e" />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              {result.summary}
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Critical Fixes & Improvements
            </h3>
            <div className="space-y-4">
              {result.weaknesses.map((point, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-red-200 dark:hover:border-red-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{point.issue}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Location: {point.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${point.impact === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                      point.impact === 'Medium' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                        'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      }`}>
                      {point.impact} Impact
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    <span className="font-semibold text-orange-600 dark:text-orange-400">How to fix:</span> {point.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {result.missingKeywords && result.missingKeywords.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                ATS Keyword Optimization
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Include these terms from the job description to improve your ranking:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-bold border border-orange-100 dark:border-orange-800/50">
                    + {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {result.improvementTips && result.improvementTips.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Growth Strategy
              </h3>
              <ul className="space-y-4">
                {result.improvementTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.layoutSuggestions && result.layoutSuggestions.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 10H7a2 2 0 01-2-2V4a2 2 0 012-2h7l5 5v13a2 2 0 01-2 2z" />
                </svg>
                ATS-Friendly Layout
              </h3>
              <ul className="space-y-3">
                {result.layoutSuggestions.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.grammarIssues && result.grammarIssues.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20h9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                Grammar & Style Fixes
              </h3>
              <div className="space-y-4">
                {result.grammarIssues.map((g, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">{g.issue}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          Location: {g.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-red-100 dark:border-red-900/40 bg-white/60 dark:bg-slate-900/30 p-3">
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Before</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{g.originalText}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/40 bg-white/60 dark:bg-slate-900/30 p-3">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">After</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{g.correctedText}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      <span className="font-semibold">Why:</span> {g.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.ats100Checklist && result.ats100Checklist.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3h6v4H9V3z" />
                </svg>
                100% ATS Checklist
              </h3>
              <ul className="space-y-3">
                {result.ats100Checklist.map((item, idx) => (
                  <li key={idx} className="flex gap-3 p-3 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100/60 dark:border-orange-800/30 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-8 lg:sticky lg:top-24 self-start">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Key Strengths
            </h3>
            <ul className="space-y-3">
              {result.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Suggested Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.suggestedRoles.map((role, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
                  {role}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
};

export default ResultsSection;
