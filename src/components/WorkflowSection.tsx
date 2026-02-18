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
    ChevronRight,
    Sparkles,
    Layout,
    Cpu,
    Zap,
    Globe
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
        color: "rose",
        tagline: "Validate ideas and prepare investor-ready materials faster than ever, in one AI workspace.",
        badge: "ENTREPRENEUR MODE",
        models: ["GPT-5.2", "Claude 4.5", "DeepSeek V3", "Gemini 3"],
        workflow: ["Idea Validation", "Market Research", "Pitch Deck Gen"]
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        icon: BarChart3,
        color: "blue",
        tagline: "Transform complex datasets into actionable insights with automated visualization and reporting.",
        badge: "ANALYST MODE",
        models: ["GPT-4o", "Claude 3.5 Sonnet", "Julius AI", "Gemini 1.5 Pro"],
        workflow: ["Clean Data", "Analyze Trends", "Visualize Insights"]
    },
    {
        id: "researcher",
        title: "Researcher",
        icon: Search,
        color: "emerald",
        tagline: "Synthesize hundreds of papers in minutes. Cite sources accurately and find hidden patterns.",
        badge: "RESEARCH MODE",
        models: ["Perplexity", "Consensus", "Elicit", "Claude 3.5"],
        workflow: ["Paper Synthesis", "Cross-Ref Citations", "Hypothesis Testing"]
    },
    {
        id: "marketer",
        title: "Marketer",
        icon: Megaphone,
        color: "orange",
        tagline: "Generate viral content schedules and high-converting ad copy across all platforms simultaneously.",
        badge: "MARKETING MODE",
        models: ["Jasper", "Copy.ai", "Midjourney V6", "GPT-4o"],
        workflow: ["Campaign Strategy", "SEO Copywriting", "Creative Asset Gen"]
    },
    {
        id: "student",
        title: "Student",
        icon: GraduationCap,
        color: "purple",
        tagline: "Master complex topics with personalized AI tutors that adapt to your unique learning style.",
        badge: "STUDY MODE",
        models: ["Gemini 1.5", "GPT-4o mini", "Khanmigo", "Claude 3 Haiku"],
        workflow: ["Concept Breakdown", "Exam Simulation", "Smart Flashcards"]
    },
    {
        id: "programmer",
        title: "Programmer",
        icon: Code2,
        color: "indigo",
        tagline: "Ship features faster with AI that understands your entire codebase and writes production-ready code.",
        badge: "DEV MODE",
        models: ["Claude 3.5 Sonnet", "GitHub Copilot", "Cursor", "GPT-4o"],
        workflow: ["Code Architecting", "Testing Suite Gen", "Refactoring Docs"]
    },
];

const AUTO_PLAY_INTERVAL = 8000; // 8 seconds

export default function WorkflowSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

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
        setIsPaused(true); // Stop auto-play once user interacts
    };

    return (
        <section className="relative w-full py-12 md:py-20 overflow-hidden bg-white dark:bg-black">
            {/* Background patterns */}
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-3xl mb-10 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold mb-4 tracking-wide uppercase"
                    >
                        <Zap size={10} className="fill-current" />
                        AI Workflow Engine
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tighter text-neutral-900 dark:text-white leading-[1.05]"
                    >
                        The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">Innovation</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium"
                    >
                        Switch roles seamlessly. Lorka provides specialized AI environments that adapt to your specific goals and methodologies instance by instance.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-16 items-stretch">
                    {/* Left Navigation - Desktop Vertical / Mobile Horizontal */}
                    <div className="lg:col-span-4 flex flex-col gap-2">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide no-scrollbar snap-x lg:snap-none">
                            {roles.map((role, idx) => {
                                const Icon = role.icon;
                                const isActive = activeIdx === idx;

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleClick(idx)}
                                        className={cn(
                                            "flex-shrink-0 snap-center flex items-center justify-between p-3 lg:p-4 rounded-[1.2rem] lg:rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden",
                                            isActive
                                                ? "bg-neutral-100 dark:bg-white/[0.08] shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.03)]"
                                                : "hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 lg:gap-4">
                                            <div className={cn(
                                                "w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center transition-all duration-700",
                                                isActive
                                                    ? `bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg`
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                            )}>
                                                <Icon size={isActive ? 18 : 16} className={cn("lg:w-5 lg:h-5", isActive && "animate-pulse")} />
                                            </div>
                                            <div className="flex flex-col items-start leading-tight">
                                                <span className={cn(
                                                    "font-bold text-xs lg:text-base transition-colors whitespace-nowrap",
                                                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 group-hover:text-black dark:group-hover:text-white"
                                                )}>
                                                    {role.title}
                                                </span>
                                                {isActive && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                                        className="text-[7px] lg:text-[8px] uppercase tracking-[0.2em] font-black text-rose-500 hidden lg:block"
                                                    >
                                                        Live Performance
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Visual active indicator for mobile */}
                                        <div className={cn(
                                            "absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transition-transform lg:hidden",
                                            isActive ? "scale-x-100" : "scale-x-0"
                                        )} />

                                        {/* Progress indicator for active role (Desktop) */}
                                        {isActive && (
                                            <div className="absolute left-0 bottom-0 top-0 w-1 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden hidden lg:block">
                                                <motion.div
                                                    className="w-full bg-rose-500"
                                                    initial={{ height: "0%" }}
                                                    animate={{ height: `${progress}%` }}
                                                    transition={{ duration: 0.1, ease: "linear" }}
                                                />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Content - Advanced Browser Mockup */}
                    <div className="lg:col-span-8 flex-1">
                        <motion.div
                            className="h-full relative rounded-[1.5rem] lg:rounded-[2rem] p-px bg-gradient-to-b from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-900 shadow-3xl overflow-hidden"
                            initial={false}
                        >
                            <div className="h-full bg-neutral-50/80 dark:bg-black/95 backdrop-blur-3xl rounded-[1.4rem] lg:rounded-[1.9rem] overflow-hidden flex flex-col">

                                {/* Browser Header Bar */}
                                <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-neutral-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                                    <div className="flex items-center gap-2 lg:gap-4">
                                        <div className="flex gap-1.5 lg:gap-2">
                                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-rose-500/30 border border-rose-500/50" />
                                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
                                            <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                                        </div>
                                        <div className="h-4 lg:h-5 w-px bg-neutral-300 dark:bg-white/10 mx-1 lg:mx-1.5" />
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 lg:px-3 lg:py-1 bg-neutral-200/50 dark:bg-white/5 rounded-lg border border-neutral-300/30 dark:border-white/10">
                                            <Layout size={10} className="text-neutral-500 lg:w-3 lg:h-3" />
                                            <span className="text-[8px] lg:text-[10px] font-black text-neutral-500 uppercase tracking-widest whitespace-nowrap">Workspace v2.0</span>
                                        </div>
                                    </div>

                                    <motion.div
                                        key={activeRole.id + "-badge"}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="px-2 lg:px-4 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500 text-[7px] lg:text-[10px] font-black tracking-[0.1em] lg:tracking-[0.2em] uppercase whitespace-nowrap"
                                    >
                                        {activeRole.badge}
                                    </motion.div>
                                </div>

                                {/* Main Window Progress Loader */}
                                <div className="h-0.5 lg:h-1 w-full bg-neutral-200 dark:bg-white/5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.1, ease: "linear" }}
                                    />
                                </div>

                                {/* Window Main Content */}
                                <div className="flex-1 p-6 lg:p-12 relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeRole.id}
                                            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                                            className="h-full flex flex-col justify-between"
                                        >
                                            <div className="space-y-6 lg:space-y-8 group/content">
                                                <div className="flex items-start gap-4 lg:gap-5">
                                                    <motion.div
                                                        initial={{ rotate: -10, scale: 0.8 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        className={cn(
                                                            "flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform duration-700 group-hover/content:rotate-3",
                                                            `bg-neutral-900 dark:bg-white text-white dark:text-black`
                                                        )}
                                                    >
                                                        <activeRole.icon size={24} className="lg:w-7 lg:h-7" strokeWidth={2} />
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2 lg:mb-3">
                                                            {activeRole.workflow.map((w, i) => (
                                                                <React.Fragment key={w}>
                                                                    <span className="text-[8px] lg:text-[10px] font-black text-rose-500 uppercase tracking-widest">{w}</span>
                                                                    {i < activeRole.workflow.length - 1 && <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/10" />}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                        <h3 className="text-2xl lg:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white leading-[1] mb-2 lg:mb-6">
                                                            Real-time <br />
                                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-600">
                                                                {activeRole.title} Logic
                                                            </span>
                                                        </h3>
                                                    </div>
                                                </div>

                                                <p className="text-lg lg:text-3xl font-bold leading-tight text-neutral-800 dark:text-neutral-200 max-w-2xl tracking-tight">
                                                    "{activeRole.tagline}"
                                                </p>
                                            </div>

                                            <div className="mt-8 lg:pt-10 border-t border-neutral-200 dark:border-white/5 pt-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-8">
                                                    <div className="flex-1">
                                                        <p className="text-[8px] lg:text-[9px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.25em] mb-3 lg:mb-4 flex items-center gap-2">
                                                            <Cpu size={10} className="lg:w-3 lg:h-3" /> Integrated Intelligence Layer
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 lg:gap-3">
                                                            {activeRole.models.map((model) => {
                                                                const logoUrl = logoMap[model];
                                                                return (
                                                                    <motion.div
                                                                        key={model}
                                                                        whileHover={{ y: -3, scale: 1.05 }}
                                                                        className="flex items-center gap-2 px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 text-[9px] lg:text-xs font-black shadow-sm transition-all hover:border-rose-500/50 hover:shadow-[0_10px_30px_rgba(244,63,94,0.1)]"
                                                                    >
                                                                        <div className="relative w-3.5 h-3.5 lg:w-4 lg:h-4 flex items-center justify-center overflow-hidden">
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
                                                                                <Globe size={10} className="text-neutral-400" />
                                                                            )}
                                                                        </div>
                                                                        {model}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:flex flex-col items-end gap-2.5">
                                                        <div className="flex -space-x-3">
                                                            {[1, 2, 3].map((i) => (
                                                                <div key={i} className="w-10 h-10 rounded-[1rem] border-[3px] border-neutral-50 dark:border-black bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shadow-lg">
                                                                    <Sparkles size={14} className="text-rose-500 animate-pulse" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Multi-Agent Ready</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Internal grid effect decoration */}
                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-rose-500/5 dark:from-rose-500/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Advanced window-specific background glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[140%] h-[140%] opacity-20 dark:opacity-40">
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 via-purple-500/40 to-blue-500/40 blur-[120px] rounded-full" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Cinematic Overlays */}
            <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-[0.05] dark:opacity-[0.08]"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        </section>
    );
}
