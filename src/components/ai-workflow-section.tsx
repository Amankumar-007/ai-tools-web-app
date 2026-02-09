'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Youtube, Image as ImageIcon, Mic, Video, ArrowRight, Sparkles, Zap
} from 'lucide-react';

interface AIWorkflowSectionProps {
    onOpenAllTools: () => void;
}

export const AIWorkflowSection: React.FC<AIWorkflowSectionProps> = ({ onOpenAllTools }) => {
    const steps = [
        {
            icon: <Zap className="w-5 h-5 text-yellow-500" />,
            title: "Script",
            desc: "Use Chat AI to generate script",
            toolType: "AI Chat",
            color: "bg-yellow-100 text-yellow-700 from-yellow-500/20 to-yellow-500/5",
            delay: 0.1
        },
        {
            icon: <ImageIcon className="w-5 h-5 text-pink-500" />,
            title: "Thumbnail",
            desc: "Use Image AI for thumbnail",
            toolType: "Image Gen",
            color: "bg-pink-100 text-pink-700 from-pink-500/20 to-pink-500/5",
            delay: 0.2
        },
        {
            icon: <Mic className="w-5 h-5 text-cyan-500" />,
            title: "Voiceover",
            desc: "Use Voice AI for narration",
            toolType: "Voice AI",
            color: "bg-cyan-100 text-cyan-700 from-cyan-500/20 to-cyan-500/5",
            delay: 0.3
        },
        {
            icon: <Video className="w-5 h-5 text-indigo-500" />,
            title: "Edit",
            desc: "Use Video AI to edit",
            toolType: "Video AI",
            color: "bg-indigo-100 text-indigo-700 from-indigo-500/20 to-indigo-500/5",
            delay: 0.4
        }
    ];

    return (
        <section className="relative py-20 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Workflow Magic</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        🚀 What do you want to do?
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Don't just use tools, build entire workflows. Combine the power of multiple AI agents to achieve incredible results.
                    </p>
                </motion.div>

                {/* Workflow Showcase Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* Decorative Elements */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 rounded-[2.5rem] opacity-30 blur-2xl" />

                    <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm transform rotate-3">
                                    <Youtube className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Start a YouTube Channel</h3>
                                    <p className="text-slate-500">From idea to publish in minutes</p>
                                </div>
                            </div>
                            <button
                                onClick={onOpenAllTools}
                                className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span>Find Tools for this</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Workflow Steps */}
                        <div className="p-8 md:p-10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">

                                {/* Connecting Line (Desktop) */}
                                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200" />

                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: step.delay }}
                                        className="relative flex flex-col items-center text-center group"
                                    >
                                        {/* Step Number Badge */}
                                        <div className="absolute -top-3 right-1/2 translate-x-1/2 md:translate-x-0 md:right-4 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 z-10 shadow-sm">
                                            {index + 1}
                                        </div>

                                        {/* Icon Circle */}
                                        <div className={`w-24 h-24 rounded-full ${step.color} bg-gradient-to-br flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 shadow-sm ring-4 ring-white`}>
                                            {step.icon}
                                        </div>

                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h4>
                                        <p className="text-sm text-slate-500 mb-3 px-2">{step.desc}</p>

                                        <div className="mt-auto">
                                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                                                {step.toolType}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Call to Action Area */}
                        <div className="bg-slate-50/80 border-t border-slate-100 p-6 flex items-center justify-center">
                            <button
                                onClick={onOpenAllTools}
                                className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-2 hover:underline decoration-2 underline-offset-4 transition-all"
                            >
                                <Zap className="w-4 h-4" />
                                Explore all 50+ AI Tools available
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Action Button for Mobile / "Open All Tools" Main Button */}
                <div className="mt-16 text-center flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onOpenAllTools}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-white/50"
                    >
                        <span>Open All Tools</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <a
                        href="/ai-workflows"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-300"
                    >
                        <span>View All Workflows</span>
                        <Zap className="w-5 h-5" />
                    </a>
                </div>

            </div>
        </section>
    );
};
