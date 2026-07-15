'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { agentWorkflows } from '@/app/data/agent-workflows';
import Link from 'next/link';

// --- Background Component ---
const Background = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15]">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -left-[10%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] -right-[10%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(244,63,94,0.05)_0%,transparent_70%)]"
            />
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15] dark:opacity-[0.1]" />
    </div>
);

const AgentWorkflowCard = ({ agent, index }: { agent: any, index: number }) => {
    return (
        <Link href={`/ai-workflows/${agent.slug}`} className="block">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10"
            >
                {/* Top Gradient Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${agent.color}`} />

                <div className="p-6 flex flex-col flex-grow gap-5">
                    {/* Header: Icon & Title */}
                    <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} p-[1px] shadow-lg`}>
                            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[15px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                <agent.icon className="w-7 h-7 text-slate-800 dark:text-white" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{agent.estimatedTime}</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                            {agent.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {agent.description}
                        </p>
                    </div>

                    {/* Tags / Metadata */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {agent.difficulty}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                            {agent.steps.length} Steps
                        </span>
                    </div>

                    {/* View Guide Button */}
                    <div className="flex items-center justify-between mt-2 pt-4 group/btn">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors">
                            View Building Guide
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default function AIWorkflowsPage() {
    return (
        <div className="min-h-screen font-sans text-foreground pb-32 overflow-x-hidden selection:bg-blue-500/20 transition-colors duration-500">
            <Background />

            <div className="h-20" />

            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm mb-10"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                            Production-Ready Agent Blueprints
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.1]"
                    >
                        Learn How To Build <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                            Autonomous AI Agents.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
                    >
                        Step-by-step guides, architectures, and exact prompts to build powerful AI agents for your business. No fluff, just execution.
                    </motion.p>
                </div>
            </section>

            {/* Grid Section */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {agentWorkflows.map((agent, idx) => (
                        <AgentWorkflowCard key={agent.id} agent={agent} index={idx} />
                    ))}
                </div>
            </main>
        </div>
    );
}
