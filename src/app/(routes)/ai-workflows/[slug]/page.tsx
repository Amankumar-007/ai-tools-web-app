'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap, CheckCircle2, Copy, ExternalLink, Terminal, ShieldCheck, Settings, PenTool, Database } from 'lucide-react';
import { agentWorkflows } from '@/app/data/agent-workflows';
import Link from 'next/link';
import { toast } from 'sonner';

const getActionIcon = (type: string) => {
    switch (type) {
        case 'setup': return Settings;
        case 'code': return Terminal;
        case 'prompt': return PenTool;
        case 'deploy': return Zap;
        default: return CheckCircle2;
    }
};

export default function AgentWorkflowDetail() {
    const params = useParams();
    const slug = params.slug as string;

    const agent = agentWorkflows.find((w) => w.slug === slug);

    if (!agent) {
        return notFound();
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/20 transition-colors duration-500">
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

                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                    {agent.steps.map((step, idx) => {
                        const Icon = getActionIcon(step.actionType);
                        
                        return (
                            <motion.div 
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                            >
                                {/* Icon Marker */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 dark:border-[#0A0A0A] bg-white dark:bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-blue-500 dark:text-blue-400">
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {step.title}
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-slate-500">
                                            Step {idx + 1}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Tool Link */}
                                    <a href={step.toolUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4">
                                        Open {step.toolName} <ExternalLink className="w-3 h-3" />
                                    </a>

                                    {/* Code/Prompt Snippet block */}
                                    {step.content && (
                                        <div className="relative mt-2 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group/code">
                                            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                                <span className="text-[10px] uppercase font-mono text-slate-400">
                                                    {step.actionType === 'prompt' ? 'System Prompt' : step.actionType === 'code' ? 'Code Snippet' : 'Instructions'}
                                                </span>
                                                <button 
                                                    onClick={() => copyToClipboard(step.content!)}
                                                    className="text-slate-500 hover:text-white transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="p-4 overflow-x-auto">
                                                <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                                                    <code>{step.content}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
