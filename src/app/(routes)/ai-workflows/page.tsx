'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, Search, X } from 'lucide-react';
import { agentWorkflows } from '@/app/data/agent-workflows';

const categories = ['All', ...new Set(agentWorkflows.map((workflow) => workflow.category))];

export default function AIWorkflowsPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase();
    return agentWorkflows.filter((workflow) =>
      (category === 'All' || workflow.category === category) &&
      (!search || `${workflow.title} ${workflow.description} ${workflow.category} ${workflow.steps.map((step) => step.title).join(' ')}`.toLowerCase().includes(search))
    );
  }, [category, query]);

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
            <Link href="/prompts" className="hover:text-slate-950">Prompts</Link>
            <Link href="/trending" className="hidden hover:text-slate-950 sm:block">Trending</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <section className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">AI workflow guides</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Build a better way to work.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Practical, step-by-step guides for using AI in real work. Choose a workflow, gather what you need, follow the steps, and check the result before sharing it.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
            <span><strong className="text-slate-950">{agentWorkflows.length}</strong> guides</span>
            <span><strong className="text-slate-950">{categories.length - 1}</strong> topics</span>
            <span><strong className="text-slate-950">{agentWorkflows.reduce((count, workflow) => count + workflow.steps.length, 0)}</strong> build steps</span>
          </div>
        </section>

        <section aria-label="Find workflows" className="mt-12">
          <div className="flex max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workflows, tasks, or steps" aria-label="Search workflows" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="rounded p-1 text-slate-400 hover:text-slate-900"><X size={17} /></button>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2" aria-label="Workflow categories">
            {categories.map((item) => {
              const count = item === 'All' ? agentWorkflows.length : agentWorkflows.filter((workflow) => workflow.category === item).length;
              return <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${category === item ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}>
                {item} <span className={category === item ? 'ml-1 text-slate-300' : 'ml-1 text-slate-400'}>{count}</span>
              </button>;
            })}
          </div>
        </section>

        <section aria-labelledby="workflow-results" className="mt-12">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 id="workflow-results" className="text-xl font-semibold tracking-tight">{category === 'All' ? 'Explore workflows' : `${category} workflows`}</h2>
            <p className="mt-1 text-sm text-slate-500">{matches.length} {matches.length === 1 ? 'guide' : 'guides'} found</p>
          </div>
          {matches.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((workflow) => {
              const Icon = workflow.icon;
              return <Link key={workflow.slug} href={`/ai-workflows/${workflow.slug}`} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={21} /></div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{workflow.category}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-blue-700">{workflow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.description}</p>
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  {workflow.steps.slice(0, 3).map((step, index) => <div key={step.id} className="flex gap-2"><span className="font-medium text-blue-600">0{index + 1}</span><span>{step.title}</span></div>)}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> {workflow.estimatedTime} <span aria-hidden="true">·</span> {workflow.difficulty}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-blue-700">View guide <ArrowRight size={15} /></span>
                </div>
              </Link>;
            })}
          </div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-medium">No workflows found</p><p className="mt-2 text-sm text-slate-500">Try a different search or topic.</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-5 text-sm font-semibold text-blue-700 hover:underline">Clear filters</button>
          </div>}
        </section>
      </main>
    </div>
  );
}
