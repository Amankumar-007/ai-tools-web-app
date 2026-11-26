'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Prompt } from '@/data/prompt-library';

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <span className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{prompt.category}</span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{prompt.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{prompt.description}</p>
      <div className="mt-5 flex-1 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className={`whitespace-pre-wrap text-sm leading-6 text-slate-700 ${expanded ? '' : 'line-clamp-4'}`}>{prompt.content}</p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          {expanded ? 'Show less' : 'Read full prompt'}
        </button>
        <button type="button" onClick={handleCopy} aria-label={`Copy ${prompt.title} prompt`} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </article>
  );
}
