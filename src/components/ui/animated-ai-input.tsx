"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { motionReveal } from "@/lib/motion";
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
            if (document.visibilityState === "visible") setCurrentIndex((prev) => (prev + 1) % AI_MODELS.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const queryValue = inputValue.trim();
        const query = encodeURIComponent(queryValue);

        // Save to localStorage so it can be restored if user is redirected to login
        localStorage.setItem('pending_prompt', queryValue);

        router.push(`/tomato-ai?q=${query}`);
        setInputValue("");
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-2">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "relative flex items-center w-full min-h-[60px] sm:min-h-[72px] md:min-h-[80px] px-3.5 sm:px-5 md:px-6 py-2 sm:py-3",
                    "bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-full shadow-[0_18px_35px_rgba(0,0,0,0.07),_0_3px_10px_rgba(0,0,0,0.035)] dark:shadow-[0_18px_35px_rgba(0,0,0,0.35),_0_3px_10px_rgba(0,0,0,0.15)]",
                    "transition-all duration-300 focus-within:border-black/20 dark:focus-within:border-white/20 focus-within:shadow-[0_22px_45px_rgba(0,0,0,0.09),_0_4px_12px_rgba(0,0,0,0.04)] dark:focus-within:shadow-[0_22px_45px_rgba(0,0,0,0.45),_0_4px_12px_rgba(0,0,0,0.2)]"
                )}
            >
                {/* Animated Icon Section */}
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={AI_MODELS[currentIndex].icon}
                            src={AI_MODELS[currentIndex].icon}
                            alt=""
                            width={32}
                            height={32}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-sm opacity-80"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 0.8 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={motionReveal}
                        />
                    </AnimatePresence>
                </div>

                {/* Input & Animated Placeholder Section */}
                <div className="relative flex-grow h-full ml-3 sm:ml-5 md:ml-6">
                    <input
                        ref={inputRef}
                        type="text"
                        aria-label="Ask any AI model"
                        enterKeyHint="send"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-black/90 dark:text-white/90 text-sm sm:text-base md:text-xl py-1.5 sm:py-2 focus:ring-0 placeholder-transparent"
                    />

                    <AnimatePresence mode="wait">
                        {!inputValue && (
                            <motion.div
                                key={AI_MODELS[currentIndex].placeholder}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.65, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={motionReveal}
                                className="absolute inset-0 flex items-center pointer-events-none text-black dark:text-white overflow-hidden whitespace-nowrap"
                            >
                                <span className="text-sm sm:text-base md:text-xl truncate">
                                    {AI_MODELS[currentIndex].placeholder}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    aria-label="Send"
                    className={cn(
                        "flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-black dark:bg-white text-white dark:text-black shadow-lg",
                        "hover:scale-105",
                        "hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                        !inputValue.trim() && "opacity-90"
                    )}
                >
                    <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[3px]" />
                </button>
            </form>
        </div>
    );
}
