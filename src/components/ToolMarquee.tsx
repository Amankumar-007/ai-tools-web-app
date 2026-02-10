"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity } from "framer-motion";

const TOOLS = [
  { name: "ChatGPT", domain: "openai.com", color: "from-green-500/20" },
  { name: "Claude", domain: "anthropic.com", color: "from-orange-500/20" },
  { name: "Midjourney", domain: "midjourney.com", color: "from-purple-500/20" },
  { name: "Perplexity", domain: "perplexity.ai", color: "from-blue-500/20" },
  { name: "Framer", domain: "framer.com", color: "from-pink-500/20" },
  { name: "GitHub", domain: "github.com", color: "from-slate-800/20" },
  { name: "Gemini", domain: "google.com", color: "from-blue-400/20" },
  { name: "Notion", domain: "notion.so", color: "from-gray-500/20" },
];

const ToolCard = ({ tool, index }: { tool: typeof TOOLS[0], index: number }) => {
  // Increased wave amplitude for a more dramatic curved effect
  const yOffset = Math.sin(index * 0.7) * 35;

  return (
    <motion.div
      style={{ y: yOffset }}
      whileHover={{
        y: yOffset - 10,
        scale: 1.1,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className={`
        relative flex items-center gap-4 px-8 py-5 rounded-3xl
        bg-white/40 backdrop-blur-md border border-white/50
        shadow-[0_20px_50px_rgba(0,0,0,0.05)]
        group cursor-pointer overflow-hidden
      `}
    >
      {/* Dynamic Glow Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative w-12 h-12 rounded-2xl overflow-hidden  shadow-sm flex items-center justify-center border border-slate-100 p-2">
        <img
          src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`}
          alt={tool.name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="relative flex flex-col">
        <span className="text-slate-900 font-bold text-lg tracking-tight">
          {tool.name}
        </span>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          {tool.domain.split('.')[0]}
        </span>
      </div>
    </motion.div>
  );
};

export default function EnhancedMarquee() {
  // 4 sets for an infinite feel even on wide screens
  const duplicatedTools = [...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS];

  return (
    <section className="relative w-full py-5  overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] " />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] " />
      </div>



      <div className="relative flex items-center">
        {/* Superior Edge Fading with Gradual Transparency */}
        <div className="absolute inset-y-0 left-0 w-64  pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-64  pointer-events-none" />

        <motion.div
          className="flex gap-4 md:gap-8 py-15 md:py-20 px-4"
          animate={{
            x: ["0%", "-25%"],
          }}
          transition={{
            ease: "linear",
            duration: 35, // Slower is often more premium
            repeat: Infinity,
          }}
        >
          {duplicatedTools.map((tool, i) => (
            <ToolCard
              key={`${tool.name}-${i}`}
              tool={tool}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}