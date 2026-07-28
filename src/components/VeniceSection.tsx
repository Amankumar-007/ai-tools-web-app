"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import Image from "next/image";

// AI Models data with custom SVG path generators
const MODELS = [
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    tags: ["LARGE"],
    desc: "OPENAI FOUNDATION",
    iconBg: "bg-[#00A699]/10 text-[#00A699]",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/openai.svg"
  },
  {
    id: "nemotron-3-ultra",
    name: "Nemotron 3 Ultra 550B",
    tags: ["LARGE"],
    desc: "NVIDIA SUPERCOMPUTER",
    iconBg: "bg-[#76B900]/10 text-[#76B900]",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/nvidia.svg"
  },
  {
    id: "gemma-4-31b",
    name: "Gemma 4 31B IT",
    tags: ["BALANCED"],
    desc: "GOOGLE DEEPMIND",
    iconBg: "bg-[#4285F4]/10 text-[#4285F4]",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/gemma-color.svg"
  },
  {
    id: "llama-3-3",
    name: "Llama 3.3 70B Instruct",
    tags: ["BALANCED"],
    desc: "META AI OPEN SOURCE",
    iconBg: "bg-[#0467F1]/10 text-[#0467F1]",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/meta-color.svg"
  },
  {
    id: "cohere-north-mini",
    name: "Cohere North Mini Code",
    tags: ["CODE"],
    desc: "COHERE ENTERPRISE",
    iconBg: "bg-white/10 text-white",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/cohere-color.svg"
  },
  {
    id: "qwen-3-coder",
    name: "Qwen 3 Coder",
    tags: ["CODE"],
    desc: "ALIBABA GROUP",
    iconBg: "bg-[#FF6A00]/10 text-[#FF6A00]",
    logoUrl: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/qwen-color.svg"
  }
];

export default function VeniceSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryValue = query.trim();
    if (queryValue) {
      localStorage.setItem('pending_prompt', queryValue);
      router.push(`/tomato-ai?q=${encodeURIComponent(queryValue)}`);
    }
  };

  return (
    <section className="relative w-full py-20 px-6 md:px-12  duration-500 overflow-hidden rounded-[2.5rem] my-4 border border-slate-200/50 dark:border-white/5">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[30vw] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

        {/* ===================== LEFT: CONTENT & INPUT ===================== */}
        <div className="flex flex-col justify-center text-left px-2 lg:px-0 lg:pr-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-7 max-w-[540px]"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Intelligence, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Unleashed.</span>
            </h2>

            <p className="text-slate-700 dark:text-slate-300 text-lg md:text-[19px] font-medium leading-relaxed tracking-tight">
              We&apos;ve created a platform that&apos;s faster, simpler, and more responsive to the latest advancements in AI.
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500"> No accounts required</span>,
              no downloads, no data collection.
            </p>

            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              We believe AI should enhance human capability while respecting human dignity. It should be a tool for exploration and creation,
              not surveillance and control. Venice exists to make this vision a reality.
            </p>

            {/* Ask Anything Input Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full relative mt-6 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
                <Search className="w-6 h-6 text-slate-400 ml-4 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Anything..."
                  className="w-full bg-transparent border-none outline-none pl-4 pr-14 py-3 text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ===================== RIGHT: BIG IMAGE ===================== */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-slate-200/50 dark:shadow-black/50 flex items-center justify-center"
        >
          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-black/10 z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

          <Image
            src="/the.png"
            alt="AI Platform"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          {/* Inner border */}
          <div className="absolute inset-0 border-[2px] border-white/40 dark:border-white/10 rounded-[2.5rem] pointer-events-none z-20" />

          {/* Center Logo */}
          <div className="relative z-30 w-32 h-32 border border-white/30 dark:border-white/20 rounded-full flex items-center justify-center p-3 backdrop-blur-md bg-white/10 dark:bg-black/30 shadow-2xl transition-transform duration-500 group-hover:scale-110">
            <div className="w-full h-full border border-white/40 dark:border-white/30 rounded-full flex items-center justify-center p-3 relative bg-white/20 dark:bg-black/20">
              <img src="/apple-touch-icon.png" alt="Tomato AI Logo" className="w-14 h-14 object-contain drop-shadow-xl" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
