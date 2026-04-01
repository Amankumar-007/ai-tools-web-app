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
  <div className="relative flex-shrink-0 w-36 h-24 md:w-56 md:h-32 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 md:p-6 border border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1.5 hover:bg-white/80 dark:hover:bg-slate-800/60 group">
    <div className="flex flex-col items-center gap-2 md:gap-3 transition-transform duration-500 group-hover:scale-110">
      <div className="relative">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`}
          alt={tool.name}
          className="relative w-8 h-8 md:w-12 md:h-12 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white font-semibold text-[11px] md:text-[13px] tracking-tight transition-colors duration-500 whitespace-nowrap">
        {tool.name}
      </span>
    </div>
  </div>
);

const MarqueeRow = ({ items, direction = "left", speed = 35 }: { items: typeof ROW_1, direction?: "left" | "right", speed?: number }) => {
  // Triple items for seamless loop
  const duplicated = [...items, ...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden py-2 md:py-4 select-none">
      <motion.div
        className="flex gap-4 md:gap-8 pr-4 md:pr-8"
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
    <section className="relative w-full py-16 md:py-32 overflow-hidden bg-slate-50/50 dark:bg-transparent">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(239,68,68,0.03)_0%,transparent_70%)] pointer-events-none" />

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

      {/* Modern Gradient Fades */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-80 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-30 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 md:w-80 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-30 pointer-events-none" />
    </section>
  );
}