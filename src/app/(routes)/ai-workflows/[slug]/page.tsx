import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3 } from 'lucide-react';
import { agentWorkflows } from '@/app/data/agent-workflows';
import { createPageMetadata, SITE_URL } from '@/metadata-utils';
import JsonLd, { breadcrumbListStructuredData, howToStructuredData } from '@/components/JsonLd';
import WorkflowSteps from './WorkflowSteps';

export async function generateStaticParams() {
  return agentWorkflows.map((workflow) => ({ slug: workflow.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const workflow = agentWorkflows.find((item) => item.slug === slug);
  if (!workflow) return {};
  return createPageMetadata({
    title: `${workflow.title} - Step-by-Step AI Workflow`,
    description: workflow.description,
    path: `/ai-workflows/${workflow.slug}`,
    keywords: [workflow.title, 'AI workflow guide', workflow.category, 'AI automation', 'step-by-step tutorial'],
  });
}

export default async function WorkflowDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workflow = agentWorkflows.find((item) => item.slug === slug);
  if (!workflow) notFound();
  const Icon = workflow.icon;

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900">
      <JsonLd data={breadcrumbListStructuredData([
        { name: 'Home', url: SITE_URL },
        { name: 'AI Workflows', url: `${SITE_URL}/ai-workflows` },
        { name: workflow.title, url: `${SITE_URL}/ai-workflows/${workflow.slug}` },
      ])} />
      <JsonLd data={howToStructuredData({
        name: workflow.title,
        description: workflow.description,
        steps: workflow.steps.map((step) => ({ name: step.title, text: `${step.description} ${step.content}` })),
      })} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight" aria-label="TomatoTool home">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <span>tomato<span className="font-normal">Tool</span></span>
          </Link>
          <nav aria-label="Site navigation" className="flex items-center gap-5 text-sm text-slate-600 sm:gap-7">
            <Link href="/ai-workflows" className="hover:text-slate-950">All workflows</Link>
            <Link href="/prompts" className="hover:text-slate-950">Prompts</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Link href="/ai-workflows" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16} /> All workflows</Link>
        <div className="mt-9 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon size={23} /></span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{workflow.category}</span>
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{workflow.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{workflow.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <span className="flex items-center gap-2"><Clock3 size={16} /> {workflow.estimatedTime}</span>
          <span>{workflow.difficulty}</span>
          <span>{workflow.steps.length} steps</span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">Before you start</h2>
            <ul className="mt-4 space-y-3">
              {workflow.prerequisites.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"><CheckCircle2 size={16} className="mt-1 shrink-0 text-blue-600" />{item}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold">What you will make</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{workflow.outcome}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-md bg-slate-100 px-2.5 py-1.5">{workflow.architecture.trigger}</span>
              <span aria-hidden="true">→</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1.5">{workflow.architecture.brain}</span>
              <span aria-hidden="true">→</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1.5">{workflow.architecture.action}</span>
            </div>
          </section>
        </div>

        <section aria-labelledby="steps-heading" className="mt-16">
          <div className="mb-7 border-b border-slate-200 pb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Build guide</span>
            <h2 id="steps-heading" className="mt-2 text-2xl font-semibold tracking-tight">Follow the steps</h2>
            <p className="mt-2 text-sm text-slate-600">Work through each step in order. Review the final output before you share or publish it.</p>
          </div>
          <WorkflowSteps steps={workflow.steps} workflowId={workflow.slug} />
        </section>

        <div className="mt-14 border-t border-slate-200 pt-7">
          <Link href="/ai-workflows" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"><ArrowLeft size={16} /> Explore more workflows</Link>
        </div>
      </main>
    </div>
  );
}
