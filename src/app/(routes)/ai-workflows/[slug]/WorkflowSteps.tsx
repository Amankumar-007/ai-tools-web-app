'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, ExternalLink, Terminal, Settings, PenTool, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { AgentStep } from '@/app/data/agent-workflows';

const getActionIcon = (type: string) => {
    switch (type) {
        case 'setup': return Settings;
        case 'code': return Terminal;
        case 'prompt': return PenTool;
        case 'deploy': return Zap;
        default: return CheckCircle2;
    }
};

export default function WorkflowSteps({ steps }: { steps: AgentStep[] }) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {steps.map((step, idx) => {
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
    );
}
