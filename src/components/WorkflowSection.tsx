"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rocket,
    BarChart3,
    Search,
    Megaphone,
    GraduationCap,
    Code2,
    Sparkles,
    Layout,
    Globe,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const logoMap: Record<string, string> = {
    "GPT-5.2": "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    "GPT-4o": "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    "GPT-4o mini": "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    "Claude 4.5": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Claude_AI_symbol.svg",
    "Claude 3.5 Sonnet": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Claude_AI_symbol.svg",
    "Claude 3.5": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Claude_AI_symbol.svg",
    "Claude 3 Haiku": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Claude_AI_symbol.svg",
    "Gemini 3": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Google_Gemini_logo.svg",
    "Gemini 1.5 Pro": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Google_Gemini_logo.svg",
    "Gemini 1.5": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Google_Gemini_logo.svg",
    "DeepSeek V3": "https://upload.wikimedia.org/wikipedia/commons/7/7b/DeepSeek_logo.svg",
    "Perplexity": "https://upload.wikimedia.org/wikipedia/commons/9/91/Perplexity_AI_logo.svg",
    "GitHub Copilot": "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    "Cursor": "https://cdn.opttab.com/images/logos/cursor-ai.svg",
    "Midjourney V6": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Midjourney_Emblem.svg",
    "Jasper": "https://www.google.com/s2/favicons?domain=jasper.ai&sz=128",
    "Copy.ai": "https://www.google.com/s2/favicons?domain=copy.ai&sz=128",
    "Julius AI": "https://www.google.com/s2/favicons?domain=julius.ai&sz=128",
    "Consensus": "https://www.google.com/s2/favicons?domain=consensus.app&sz=128",
    "Elicit": "https://www.google.com/s2/favicons?domain=elicit.com&sz=128",
    "Khanmigo": "https://www.google.com/s2/favicons?domain=khanacademy.org&sz=128"
};

const roles = [
    {
        id: "entrepreneur",
        title: "Entrepreneur",
        icon: Rocket,
        tagline: "Validate ideas and prepare investor-ready materials faster than ever.",
        badge: "Strategy",
        models: ["GPT-5.2", "Claude 4.5", "DeepSeek V3", "Gemini 3"],
        workflow: ["Idea Validation", "Market Research", "Pitch Deck"]
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        icon: BarChart3,
        tagline: "Transform complex datasets into actionable insights with automated reporting.",
        badge: "Analysis",
        models: ["GPT-4o", "Claude 3.5 Sonnet", "Julius AI", "Gemini 1.5 Pro"],
        workflow: ["Clean Data", "Analyze Trends", "Visualize"]
    },
    {
        id: "researcher",
        title: "Researcher",
        icon: Search,
        tagline: "Synthesize hundreds of papers in minutes and find hidden patterns.",
        badge: "Discovery",
        models: ["Perplexity", "Consensus", "Elicit", "Claude 3.5"],
        workflow: ["Synthesis", "Citations", "Hypothesis"]
    },
    {
        id: "marketer",
        title: "Marketer",
        icon: Megaphone,
        tagline: "Generate viral schedules and high-converting copy across all platforms.",
        badge: "Growth",
        models: ["Jasper", "Copy.ai", "Midjourney V6", "GPT-4o"],
        workflow: ["Strategy", "SEO Copy", "Assets"]
    },
    {
        id: "student",
        title: "Student",
        icon: GraduationCap,
        tagline: "Master complex topics with personalized AI tutors that adapt to you.",
        badge: "Learning",
        models: ["Gemini 1.5", "GPT-4o mini", "Khanmigo", "Claude 3 Haiku"],
        workflow: ["Breakdown", "Simulation", "Flashcards"]
    },
    {
        id: "programmer",
        title: "Programmer",
        icon: Code2,
        tagline: "Ship features faster with AI that understands your entire codebase.",
        badge: "Engineering",
        models: ["Claude 3.5 Sonnet", "GitHub Copilot", "Cursor", "GPT-4o"],
        workflow: ["Architecture", "Testing", "Refactoring"]
    },
];

const AUTO_PLAY_INTERVAL = 8000;

export default function WorkflowSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeRole = roles[activeIdx];

    const nextRole = useCallback(() => {
        setActiveIdx((prev) => (prev + 1) % roles.length);
        setProgress(0);
    }, []);

    useEffect(() => {
        if (isPaused) return;

        const interval = 100;
        const increment = (interval / AUTO_PLAY_INTERVAL) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextRole();
                    return 0;
                }
                return prev + increment;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isPaused, nextRole]);

    const handleRoleClick = (idx: number) => {
        setActiveIdx(idx);
        setProgress(0);
        setIsPaused(true);
    };

    return (
        <section className="relative w-full py-24 overflow-hidden bg-transparent font-sans">
            <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-2xl mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-white/5 text-black dark:text-white/60 text-xs font-black mb-6 border border-black dark:border-white/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                    >
                        <Sparkles size={12} />
                        <span>Adaptive Workspaces</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-medium tracking-tight text-black dark:text-white leading-[1.1] mb-6 text-balance"
                    >
                        One platform. <br className="hidden md:block" />
                        Infinite specialized minds.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-black/60 dark:text-white/60 leading-relaxed max-w-xl"
                    >
                        Switch contexts effortlessly. Lorka provides specialized AI environments that adapt to your specific workflows, curating the right models and tools for the task at hand.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-4 flex flex-col gap-1 relative z-20">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide snap-x lg:snap-none">
                            {roles.map((role, idx) => {
                                const Icon = role.icon;
                                const isActive = activeIdx === idx;

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleClick(idx)}
                                        className={cn(
                                            "relative flex-shrink-0 snap-center flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden border",
                                            isActive
                                                ? "bg-white dark:bg-white/10 border-black dark:border-white/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                                                : "bg-transparent border-transparent hover:border-black/10 dark:hover:border-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                                            isActive
                                                ? "text-black dark:text-white"
                                                : "text-black/40 dark:text-white/40"
                                        )}>
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <div>
                                            <h4 className={cn(
                                                "text-sm font-medium transition-colors duration-300",
                                                isActive ? "text-black dark:text-white" : "text-black/50 dark:text-white/50"
                                            )}>
                                                {role.title}
                                            </h4>
                                            {isActive && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: 2 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-xs text-black/50 dark:text-white/50 mt-0.5"
                                                >
                                                    {role.badge} active
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Minimal Progress Indicator */}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-4 right-4 lg:left-0 lg:right-auto lg:top-1/4 lg:bottom-1/4 lg:w-0.5 h-0.5 lg:h-auto bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full w-full bg-black dark:bg-white lg:w-full lg:h-full origin-left lg:origin-top"
                                                    initial={false}
                                                    animate={{
                                                        scaleX: mounted && window.innerWidth < 1024 ? progress / 100 : 1,
                                                        scaleY: mounted && window.innerWidth >= 1024 ? progress / 100 : 1
                                                    }}
                                                    transition={{ duration: 0.1, ease: "linear" }}
                                                />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area - Sleek Window */}
                    <div className="lg:col-span-8 relative">
                        <motion.div
                            className="relative rounded-[2rem] bg-white dark:bg-white/[0.02] border-2 border-black dark:border-white/10 overflow-hidden flex flex-col min-h-[500px] backdrop-blur-sm shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                            initial={false}
                        >
                            {/* Minimal Browser Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20" />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-black dark:border-white/10 rounded-lg">
                                    <Layout size={12} className="text-black/40 dark:text-white/40" />
                                    <span className="text-[11px] font-medium text-black/50 dark:text-white/50">workspace.lorka.ai</span>
                                </div>
                            </div>

                            {/* Main Content Viewer */}
                            <div className="flex-1 p-8 lg:p-12 relative flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeRole.id}
                                        initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {activeRole.workflow.map((w, i) => (
                                                    <div key={w} className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white/60 bg-white dark:bg-white/10 px-3 py-1 rounded-full border border-black dark:border-white/20">
                                                            {w}
                                                        </span>
                                                        {i < activeRole.workflow.length - 1 && (
                                                            <ArrowRight size={12} className="text-black/30 dark:text-white/30" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <h3 className="text-3xl lg:text-4xl font-medium tracking-tight text-black dark:text-white mb-4">
                                                {activeRole.title} Environment
                                            </h3>

                                            <p className="text-lg text-black/60 dark:text-white/60 max-w-lg leading-relaxed">
                                                {activeRole.tagline}
                                            </p>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
                                            <p className="text-xs font-medium text-black/40 dark:text-white/40 mb-4">
                                                INTEGRATED MODELS
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                {activeRole.models.map((model) => {
                                                    const logoUrl = logoMap[model];
                                                    return (
                                                        <div
                                                            key={model}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.03] border border-black dark:border-white/10 text-xs font-bold text-black dark:text-white/80 transition-all hover:-translate-y-0.5"
                                                        >
                                                            <div className="w-4 h-4 flex items-center justify-center opacity-80">
                                                                {logoUrl ? (
                                                                    <img
                                                                        src={logoUrl}
                                                                        alt={model}
                                                                        className={cn(
                                                                            "w-full h-full object-contain",
                                                                            (model.includes("GPT") || model.includes("GitHub") || model.includes("Claude") || model.includes("Cursor") || model.includes("Perplexity")) && "dark:invert"
                                                                        )}
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${model.toLowerCase().replace(/ /g, '')}.ai&sz=64`;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Globe size={14} />
                                                                )}
                                                            </div>
                                                            {model}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}