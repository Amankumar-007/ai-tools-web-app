'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import type { AgentStep } from '@/app/data/agent-workflows';

export default function WorkflowSteps({ steps, workflowId }: { steps: AgentStep[]; workflowId: string }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(`workflow-progress:${workflowId}`) || '[]');
      if (Array.isArray(saved)) setCompleted(saved.filter((id): id is string => typeof id === 'string' && steps.some((step) => step.id === id)));
    } catch { /* Storage is optional. */ }
  }, [workflowId, steps]);

  const toggleCompleted = (id: string) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    try { window.localStorage.setItem(`workflow-progress:${workflowId}`, JSON.stringify(next)); } catch { /* Storage is optional. */ }
  };
  const copy = async (step: AgentStep) => {
    try {
      await navigator.clipboard.writeText(step.content);
      setCopied(step.id);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div>
      <p className="mb-5 text-sm text-slate-500" role="status">{completed.length} of {steps.length} steps marked complete</p>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${completed.includes(step.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {completed.includes(step.id) ? <Check size={17} /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                  <a href={step.toolUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">Open {step.toolName} <ExternalLink size={14} /></a>
                </div>
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{step.actionType === 'prompt' ? 'Prompt to adapt' : 'How to do it'}</span>
                    <button type="button" onClick={() => copy(step)} aria-label={`Copy instructions for ${step.title}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950">
                      {copied === step.id ? <Check size={14} /> : <Copy size={14} />} {copied === step.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-700">{step.content}</p>
                </div>
                <button type="button" onClick={() => toggleCompleted(step.id)} aria-pressed={completed.includes(step.id)} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${completed.includes(step.id) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400'}`}>{completed.includes(step.id) && <Check size={12} />}</span>
                  {completed.includes(step.id) ? 'Completed' : 'Mark complete'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
