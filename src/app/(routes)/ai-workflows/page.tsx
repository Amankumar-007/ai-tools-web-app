'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight, Play, CheckCircle2, Zap,
    Layers, Command, Sparkles, ChevronRight
} from 'lucide-react';
import { workflows } from '@/app/data/workflows';

// --- Components ---

const Background = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Breathing Orbs */}
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[100px]"
        />
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-200/40 blur-[120px]"
        />
    </div>
);

const StepItem = ({ step, index, total, onOpen }: { step: any, index: number, total: number, onOpen: (url: string) => void }) => {
    return (
        <div className="relative pl-8 pb-6 last:pb-0 group/step">
            {/* Timeline Line */}
            {index !== total - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-slate-100 group-hover/card:bg-indigo-50 transition-colors" />
            )}

            {/* Number Bubble */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400 flex items-center justify-center z-10 shadow-sm group-hover/step:border-indigo-200 group-hover/step:text-indigo-600 group-hover/step:scale-110 transition-all">
                {index + 1}
            </div>

            {/* Content */}
            <button
                onClick={(e) => { e.stopPropagation(); onOpen(step.toolUrl); }}
                className="w-full text-left group/btn"
            >
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700 group-hover/btn:text-[#E84E1B] transition-colors">
                        {step.title}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-500 border border-slate-200 group-hover/btn:bg-white transition-colors">
                    <Command className="w-3 h-3" />
                    {step.toolName}
                </div>
            </button>
        </div>
    );
};

const WorkflowCard = ({ workflow, index }: { workflow: any, index: number }) => {
    const handleOpenTool = (url: string) => {
        if (url) window.open(url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group/card relative flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 hover:border-[#E84E1B]/50 hover:shadow-2xl hover:shadow-[#E84E1B]/10 transition-all duration-500 overflow-hidden"
        >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${workflow.color} opacity-0 group-hover/card:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />

            <div className="p-6 md:p-8 flex flex-col h-full relative z-10">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${workflow.color} bg-opacity-10 flex items-center justify-center shadow-inner ring-1 ring-black/5`}>
                            <workflow.icon className="w-6 h-6 text-slate-700" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover/card:text-indigo-700 transition-colors">
                                {workflow.title}
                            </h3>
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                                <Layers className="w-3 h-3" /> {workflow.steps.length} Step Sequence
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                    {workflow.description}
                </p>

                {/* Timeline Steps */}
                <div className="mt-auto space-y-1 mb-8">
                    {workflow.steps.map((step: any, idx: number) => (
                        <StepItem
                            key={idx}
                            step={step}
                            index={idx}
                            total={workflow.steps.length}
                            onOpen={handleOpenTool}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={() => handleOpenTool(workflow.steps[0].toolUrl)}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-[#E84E1B] text-white text-sm font-semibold flex items-center justify-center gap-2 group-hover/card:bg-[#E84E1B] group-hover/card:shadow-lg group-hover/card:shadow-[#E84E1B]/20 transition-all duration-300 active:scale-[0.98]"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Sequence
                </button>
            </div>
        </motion.div>
    );
};

const AIWorkflowsPage = () => {
    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-indigo-100 pb-32">
            <Background />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-4">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
                    >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#E84E1B] px-4 py-1.5 rounded-full border border-[#E84E1B] shadow-sm mb-8">
                            Workflow Library v2.0
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight"
                    >
                        Supercharge your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84E1B] via-orange-600 to-[#E84E1B] animate-gradient-x">
                            creative velocity.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        Don't just use AI tools randomly. Use our engineered
                        <span className="font-semibold text-slate-800 mx-1">Power Packs</span>
                        to execute complex workflows 10x faster.
                    </motion.p>
                </div>
            </section>

            {/* Grid Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {workflows.map((workflow, idx) => (
                        <WorkflowCard key={workflow.id} workflow={workflow} index={idx} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AIWorkflowsPage;
