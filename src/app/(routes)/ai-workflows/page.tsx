'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight, Play, CheckCircle2, Zap,
    Layers, Command, Sparkles, ChevronRight,
    ExternalLink, MousePointer2, Rocket,
    ArrowRight, Box, Cpu, Workflow,
    MoreHorizontal, Plus, Info, ExternalLink as LaunchIcon,
    ArrowDown
} from 'lucide-react';
import { workflows } from '@/app/data/workflows';
import { toast } from 'sonner';

// --- Background Component ---

const Background = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        {/* Dynamic Orbs - Adapt to theme */}
        <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15]">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] -right-[10%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(244,63,94,0.05)_0%,transparent_70%)]"
            />
        </div>

        {/* Neural Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15] dark:opacity-[0.1]" />
    </div>
);

// --- Compact Step Icon ---

const CompactStep = ({ step, index }: { step: any, index: number }) => (
    <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 flex items-center justify-center">
            <step.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
    </div>
);

// --- Premium Compact Card ---

const WorkflowCard = ({ workflow, index }: { workflow: any, index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLaunchAll = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Simple sequential opening as requested
        workflow.steps.forEach((step: any) => {
            window.open(step.toolUrl, '_blank');
        });

        toast.success(`Launching ${workflow.steps.length} tools`, {
            description: "If only one tab opened, please enable popups for this site.",
            duration: 5000,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group/card relative flex flex-col bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-white/5 hover:border-blue-500/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/5"
        >
            <div className={`h-1 w-full bg-gradient-to-r ${workflow.color}`} />

            <div className="p-6 flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workflow.color} p-[1px] shadow-lg`}>
                        <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[0.7rem] flex items-center justify-center">
                            <workflow.icon className="w-6 h-6 text-slate-800 dark:text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                            {workflow.title}
                        </h3>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                            {workflow.steps.length} Tool Sequence
                        </p>
                    </div>
                </div>

                {/* Vertical Step Icons (Compact) */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-white/5">
                    {workflow.steps.map((step: any, idx: number) => (
                        <React.Fragment key={idx}>
                            <CompactStep step={step} index={idx} />
                            {idx < workflow.steps.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Description - Single line until hover/expand */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                    {workflow.description}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleLaunchAll}
                        className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
                    >
                        <Rocket className="w-3.5 h-3.5" />
                        Launch Flow
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ArrowDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </motion.div>
                    </button>
                </div>

                {/* Expandable Section */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 space-y-3 border-t border-slate-100 dark:border-white/5">
                                {workflow.steps.map((step: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {idx + 1}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {step.title}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => window.open(step.toolUrl, '_blank')}
                                            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const AIWorkflowsPage = () => {
    return (
        <div className="min-h-screen font-sans text-foreground pb-32 overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-500">
            <Background />

            {/* Navigation Spacer */}
            <div className="h-20" />

            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm mb-10"
                    >
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                            Curated Productivity Architectures
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.85]"
                    >
                        Master the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                            AI Multitask.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
                    >
                        We've engineered the perfect tool chains so you don't have to.
                        One switch, complete focus.
                    </motion.p>
                </div>
            </section>

            {/* Grid Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {workflows.map((workflow, idx) => (
                        <WorkflowCard key={workflow.id} workflow={workflow} index={idx} />
                    ))}
                </div>
            </main>

            {/* Bottom Section */}
            <section className="mt-40 px-4 text-center">
                <div className="max-w-xl mx-auto">
                    <div className="w-16 h-1 w-16 bg-blue-500/20 mx-auto mb-10 rounded-full" />
                    <h2 className="text-2xl font-bold dark:text-white mb-4 italic font-serif">
                        Built for speed, refined for focus.
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        New workflows added every Tuesday. Stay ahead of the curve.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AIWorkflowsPage;
