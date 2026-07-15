"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, HelpCircle, Shield, Zap, Cpu, Search, Database, Plus, Minus, Code, FileText, UserPlus } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    question: "Is TomatoAI really free?",
    answer: "Yes, you can use our top-tier AI models directly in your browser without requiring any sign-ups or payments. We want to provide a frictionless experience for everyone.",
    icon: Zap
  },
  {
    question: "Do I need an account to use the AI?",
    answer: "No account is required! You can start chatting, searching, and generating code instantly. If you choose to log in, you can sync your conversation history across devices.",
    icon: HelpCircle
  },
  {
    question: "Are my conversations private?",
    answer: "Absolutely. We prioritize your privacy above all else. Your conversations are stored locally in your browser and are not collected, tracked, or used for training our models.",
    icon: Shield
  },
  {
    question: "What AI models are available?",
    answer: "We provide access to the best open-source and commercial models, including Llama 3, Qwen Coder, Google Deepmind, and more, all optimized for high-speed inference.",
    icon: Cpu
  },
  {
    question: "How does TomatoAI process my prompts?",
    answer: "When you send a prompt, our secure backend routes the request to high-speed AI providers via our Next.js API. We support real-time streaming, allowing the AI's response to generate word-by-word instantly in your chat.",
    icon: Zap
  },
  {
    question: "What happens to my local chats when I sign in?",
    answer: "Nothing is lost! We automatically detect any conversations you started as a guest in your browser's local storage and seamlessly merge them into your account, continuing right where you left off.",
    icon: Database
  },
  {
    question: "How do document and image uploads work?",
    answer: "When you upload an image or document (like a PDF), our frontend extracts the text or processes the image URL, allowing our multimodal AI models to review, explain, or answer questions about your files instantly.",
    icon: Search
  },
  {
    question: "How many prompts can I send as a guest?",
    answer: "Guests can send exactly one free prompt to preview our AI capabilities. For continued usage, we prompt you to sign in or create a free account to ensure fair usage limits.",
    icon: UserPlus
  },
  {
    question: "Is there a character or word limit on prompts?",
    answer: "While there is no hard limit on your input, our models perform best on focused, descriptive queries. Long documents can be uploaded directly as PDF or text files for optimal comprehension.",
    icon: FileText
  },
  {
    question: "Which AI model should I choose for coding?",
    answer: "We recommend selecting Qwen 3 Coder or Llama 3.3 for programming tasks. They are heavily optimized for syntax generation, debugging, and code explanation.",
    icon: Code
  },
  {
    question: "Are there any usage limits for logged-in users?",
    answer: "Free registered users get a generous daily token allowance covering most standard search and chat needs. Premium models or higher frequency requests may have adaptive rate limits.",
    icon: Shield
  },
  {
    question: "How does the AI search feature work?",
    answer: "When search mode is enabled, our backend performs a quick web search to retrieve the latest articles and context, feeding that raw data directly to the AI model for accurate, up-to-date answers.",
    icon: Search
  },
  {
    question: "Does TomatoAI support multiple languages?",
    answer: "Absolutely. Our underlying models are multilingual and can translate, summarize, or converse in dozens of languages, including Spanish, French, German, Chinese, and Hindi.",
    icon: HelpCircle
  },
  {
    question: "Can I use TomatoAI on my mobile phone?",
    answer: "Yes, our web application is fully responsive and optimized for mobile browsers, giving you access to all the same AI models, search capabilities, and tools on the go.",
    icon: Cpu
  },
  {
    question: "Do you have API access or integrations?",
    answer: "Currently, we focus on providing the best consumer web experience. API access and developer SDKs are on our roadmap as we continue to expand the platform.",
    icon: Database
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-16 px-6 md:px-12 bg-white dark:bg-[#070709] transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Quick answers to questions you may have. Can&apos;t find what you&apos;re looking for? Check out our{" "}
              <Link href="/docs" className="text-slate-800 dark:text-slate-200 underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-blue-500 transition-colors">
                full documentation
              </Link>.
            </p>
          </div>
          
          <Link href="/docs">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              Documentation
              <ExternalLink className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Grid Section with Reveal Logic */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 transition-all duration-700 ease-in-out">
            {FAQS.slice(0, isRevealed ? FAQS.length : 8).map((faq, idx) => {
              const isOpen = openIndex === idx;
              const isBlurred = !isRevealed && idx >= 6;
              
              return (
                <div 
                  key={idx}
                  className={`flex gap-4 group transition-all duration-500 ${
                    isBlurred 
                      ? 'blur-[2px] opacity-20 pointer-events-none select-none' 
                      : 'cursor-pointer'
                  }`}
                  onClick={() => !isBlurred && toggleFAQ(idx)}
                >
                  <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300 shadow-sm transition-colors group-hover:border-blue-500/30 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                    <faq.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start w-full">
                      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 pr-4">
                        {faq.question}
                      </h3>
                      <div className="text-slate-400 dark:text-slate-500 mt-0.5 transition-colors group-hover:text-blue-500 flex-shrink-0">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pb-2">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load More Button */}
        {!isRevealed && (
          <div className="mt-8 flex justify-center relative z-10">
            <button 
              onClick={() => setIsRevealed(true)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Load more
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
