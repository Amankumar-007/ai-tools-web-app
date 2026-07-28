"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function ToolFaqAccordion({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={faq.question}
            className={`rounded-2xl border transition-colors ${
              isOpen
                ? "border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-white/[0.03]"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
            >
              <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                  isOpen
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                    : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                }`}
              >
                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
