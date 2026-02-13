
import React, { Suspense } from 'react';
import { AnalysisResult } from '../types/types';
import dynamic from 'next/dynamic';
import { Zap, RotateCcw, Layout, FileText, AlertTriangle, Lightbulb, Target, Sparkles, Wand2, Edit } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Analysis Results</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Here's how your resume stacks up.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full sm:w-auto">
          {onOptimize && (
            <button
              onClick={onOptimize}
              className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all font-bold flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
            >
              <Wand2 className="w-4 h-4 md:w-5 md:h-5" />
              Fix Resume for this Role
            </button>
          )}
          <button
            onClick={onReset}
            className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center justify-center gap-2 px-4 py-2 text-sm md:text-base order-2 sm:order-1"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            Re-upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <Suspense fallback={<div className="flex items-center justify-center h-32 md:h-48 w-full"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.score} label="Overall Score" color="#f97316" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-32 md:h-48 w-full"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.atsCompatibility} label="ATS Score" color="#10b981" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-32 md:h-48 w-full"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.grammarAndStyleScore} label="Grammar" color="#8b5cf6" />
          </Suspense>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Suspense fallback={<div className="flex items-center justify-center h-32 md:h-48 w-full"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
            <GaugeChart value={result.experienceRelevanceScore} label="Career Flow" color="#f43f5e" />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
              {result.summary}
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              Critical Fixes & Improvements
            </h3>
            <div className="space-y-4">
              {result.weaknesses.map((point, idx) => (
                <div key={idx} className="p-4 md:p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-red-200 dark:hover:border-red-500 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">{point.issue}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Location: {point.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${point.impact === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
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
            <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                ATS Keyword Optimization
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-4">
                Include these terms from the job description to improve your ranking:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-[11px] md:text-sm font-bold border border-orange-100 dark:border-orange-800/50">
                    + {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {result.improvementTips && result.improvementTips.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                Growth Strategy
              </h3>
              <ul className="space-y-3 md:space-y-4">
                {result.improvementTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] md:text-xs">
                      {idx + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.layoutSuggestions && result.layoutSuggestions.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                ATS-Friendly Layout
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {result.layoutSuggestions.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.grammarIssues && result.grammarIssues.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Edit className="w-5 h-5 md:w-6 md:h-6 text-violet-500" />
                Grammar & Style Fixes
              </h3>
              <div className="space-y-4">
                {result.grammarIssues.map((g, idx) => (
                  <div key={idx} className="p-4 md:p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">{g.issue}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          Location: {g.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-red-100 dark:border-red-900/40 bg-white/60 dark:bg-slate-900/30 p-3">
                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1">Before</p>
                        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{g.originalText}</p>
                      </div>
                      <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/40 bg-white/60 dark:bg-slate-900/30 p-3">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">After</p>
                        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{g.correctedText}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                      <span className="font-semibold">Why:</span> {g.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.ats100Checklist && result.ats100Checklist.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                100% ATS Checklist
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {result.ats100Checklist.map((item, idx) => (
                  <li key={idx} className="flex gap-3 p-2.5 md:p-3 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 border border-orange-100/60 dark:border-orange-800/30 text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[10px] md:text-xs">
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
          <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
              Key Strengths
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {result.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 md:mt-2 shrink-0"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
              Suggested Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.suggestedRoles.map((role, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-semibold border border-indigo-100 dark:border-indigo-800">
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
