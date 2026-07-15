"use client";

import React from "react";
import { motion } from "framer-motion";

const ROW_1 = [
  { name: "ChatGPT", domain: "openai.com" },
  { name: "Claude", domain: "anthropic.com" },
  { name: "Gemini", domain: "google.com" },
  { name: "Perplexity", domain: "perplexity.ai" },
  { name: "Midjourney", domain: "midjourney.com" },
];

const ROW_2 = [
  { name: "Mistral", domain: "mistral.ai" },
  { name: "Jasper", domain: "jasper.ai" },
  { name: "Copy.ai", domain: "copy.ai" },
  { name: "Grok", domain: "x.ai" },
  { name: "Llama", domain: "meta.com" },
];

const LogoCard = ({ tool }: { tool: (typeof ROW_1)[0] }) => (
  <div className="relative flex-shrink-0 flex items-center justify-center transition-all duration-500 hover:-translate-y-1 group px-4 md:px-6">
    <div className="flex items-center gap-3 md:gap-4 transition-transform duration-500 group-hover:scale-105">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`}
          alt={tool.name}
          className="relative w-8 h-8 md:w-10 md:h-10 object-contain transition-all duration-500"
        />
      </div>
      <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-bold text-base md:text-xl tracking-tight transition-colors duration-500 whitespace-nowrap">
        {tool.name}
      </span>
    </div>
  </div>
);

const MarqueeRow = ({ items, direction = "left", speed = 35 }: { items: typeof ROW_1, direction?: "left" | "right", speed?: number }) => {
  // Triple items for seamless loop
  const duplicated = [...items, ...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden py-4 md:py-8 select-none">
      <motion.div
        className="flex gap-8 md:gap-24 pr-8 md:pr-24"
        initial={{ x: direction === "left" ? "0%" : "-50%" }}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
      >
        {duplicated.map((item, i) => (
          <LogoCard key={`${item.name}-${i}`} tool={item} />
        ))}
      </motion.div>
    </div>
  );
};

export default function ProfessionalBentoMarquee() {
  return (
    <section className="relative w-full py-16 md:py-32 overflow-hidden bg-transparent">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-16 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-red-500 dark:text-red-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4">
            Trusted by Creators
          </h2>
          <p className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
            Seamless integration with the world&apos;s best AI.
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col gap-1 md:gap-4 relative z-20">
        {/* Row 1 */}
        <MarqueeRow items={ROW_1} direction="left" speed={30} />

        {/* Row 2: Staggered offset for the creative "broken grid" look */}
        <div className="md:pl-48">
          <MarqueeRow items={ROW_2} direction="right" speed={40} />
        </div>
      </div>
    </section>
  );
}
