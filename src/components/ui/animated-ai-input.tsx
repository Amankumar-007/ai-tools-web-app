"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const AI_MODELS = [
    {
        name: "ChatGPT",
        placeholder: "How can I help you today?",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com",
    },
    {
        name: "Claude",
        placeholder: "Ask me anything...",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=claude.ai",
    },
    {
        name: "Gemini",
        placeholder: "What's on your mind?",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=gemini.google.com",
    },
    {
        name: "Perplexity",
        placeholder: "Search anything...",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=perplexity.ai",
    },
    {
        name: "DeepSeek",
        placeholder: "Translate this paragraph into French",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=deepseek.com",
    },
];

export default function AnimatedAiInput() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % AI_MODELS.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const query = encodeURIComponent(inputValue.trim());
        router.push(`/tomato-ai?q=${query}`);
        setInputValue("");
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-12">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "relative flex items-center w-full min-h-[80px] px-6 py-3",
                    "bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-full shadow-xl dark:shadow-2xl",
                    "transition-all duration-300 focus-within:border-black/20 dark:focus-within:border-white/20 focus-within:shadow-black/5 dark:focus-within:shadow-white/5"
                )}
            >
                {/* Animated Icon Section */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={AI_MODELS[currentIndex].icon}
                            src={AI_MODELS[currentIndex].icon}
                            alt={AI_MODELS[currentIndex].name}
                            className="w-8 h-8 rounded-sm opacity-80"
                            initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                            animate={{ y: 0, opacity: 0.8, filter: "blur(0px)" }}
                            exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </AnimatePresence>
                </div>

                {/* Input & Animated Placeholder Section */}
                <div className="relative flex-grow h-full ml-6">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-black/90 dark:text-white/90 text-xl py-2 focus:ring-0 placeholder-transparent"
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />

                    <AnimatePresence mode="wait">
                        {!inputValue && (
                            <motion.div
                                key={AI_MODELS[currentIndex].placeholder}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.4, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 flex items-center pointer-events-none text-black dark:text-white overflow-hidden whitespace-nowrap"
                            >
                                <span className="text-xl truncate">
                                    {AI_MODELS[currentIndex].placeholder}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-black dark:bg-white text-white dark:text-black shadow-lg",
                        "hover:scale-105",
                        "hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                        !inputValue.trim() && "opacity-90"
                    )}
                >
                    <ArrowUp className="w-6 h-6 stroke-[3px]" />
                </button>
            </form>
        </div>
    );
}
