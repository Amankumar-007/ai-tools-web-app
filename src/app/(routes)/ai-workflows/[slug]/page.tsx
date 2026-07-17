import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { agentWorkflows } from '@/app/data/agent-workflows';
import { createPageMetadata } from '@/metadata-utils';
import JsonLd, { breadcrumbListStructuredData, howToStructuredData } from '@/components/JsonLd';
import WorkflowSteps from './WorkflowSteps';

export async function generateStaticParams() {
    return agentWorkflows.map((workflow) => ({ slug: workflow.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const agent = agentWorkflows.find((w) => w.slug === slug);
    if (!agent) return {};

    return createPageMetadata({
        title: `${agent.title} - Step-by-Step AI Agent Workflow`,
        description: agent.description,
        path: `/ai-workflows/${agent.slug}`,
        keywords: [agent.title, 'AI agent workflow', 'AI automation blueprint', agent.difficulty, 'n8n workflow', 'AI agent tutorial'],
    });
}

export default async function AgentWorkflowDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const agent = agentWorkflows.find((w) => w.slug === slug);

    if (!agent) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/20 transition-colors duration-500">
            <JsonLd
                data={breadcrumbListStructuredData([
                    { name: 'Home', url: 'https://tomatoai.in' },
                    { name: 'AI Workflows', url: 'https://tomatoai.in/ai-workflows' },
                    { name: agent.title, url: `https://tomatoai.in/ai-workflows/${agent.slug}` },
                ])}
            />
            <JsonLd
                data={howToStructuredData({
                    name: agent.title,
                    description: agent.description,
                    steps: agent.steps.map((step) => ({ name: step.title, text: step.description })),
                })}
            />

            {/* Header Section */}
            <header className="relative pt-32 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-500/5" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <Link href="/ai-workflows" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Agent Blueprints
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} p-[1px] shadow-lg`}>
                            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[15px] flex items-center justify-center">
                                <agent.icon className="w-8 h-8 text-slate-800 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-2">
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                    {agent.difficulty}
                                </span>
                                <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                    <Clock className="w-3 h-3" />
                                    {agent.estimatedTime}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                {agent.title}
                            </h1>
                        </div>
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
                        {agent.description}
                    </p>

                    {/* Architecture & Prerequisites Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Prerequisites
                            </h3>
                            <ul className="space-y-3">
                                {agent.prerequisites.map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <Database className="w-4 h-4" /> Agent Architecture
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">Trigger</span>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                                        {agent.architecture.trigger}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">Brain / Model</span>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                                        {agent.architecture.brain}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block mb-1">Action / Output</span>
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-100 dark:border-white/5">
                                        {agent.architecture.action}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Steps Timeline */}
            <main className="max-w-4xl mx-auto px-6 pb-32">
                <h2 className="text-2xl font-bold mb-10 text-slate-900 dark:text-white">Step-by-Step Implementation</h2>
                <WorkflowSteps steps={agent.steps} />
            </main>
        </div>
    );
}
