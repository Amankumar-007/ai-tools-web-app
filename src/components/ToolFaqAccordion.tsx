"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";

/**
 * Questions and answers under a tool. The open/close movement is plain CSS (no animation library on every tool page),
 * and the answers are always in the page's HTML, so search engines and "find in page" can read them.
 */
export default function ToolFaqAccordion({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const id = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const panel = `${id}-answer-${idx}`;
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
              aria-expanded={isOpen}
              aria-controls={panel}
              className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
            >
              <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
              <span
                aria-hidden="true"
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                  isOpen
                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            <div
              id={panel}
              // A closed answer is invisible, so it is skipped by the keyboard and screen readers.
              className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out motion-reduce:transition-none ${
                isOpen ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
