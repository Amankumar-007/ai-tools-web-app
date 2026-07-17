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
    <section className="relative w-full py-20 px-6 md:px-12 bg-[#F5F4EF] dark:bg-transparent transition-colors duration-500 overflow-hidden rounded-[2.5rem] my-16 border border-slate-200/50 dark:border-white/5">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[30vw] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* ===================== LEFT: AI MODELS CARD ===================== */}
        <div className="lg:col-span-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[340px] bg-black text-slate-100 rounded-3xl border border-white/10 shadow-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
          >
            {/* Glossy top border light */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {MODELS.map((model) => (
              <motion.div
                key={model.id}
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`flex items-center gap-4.5 p-3 rounded-2xl transition-all duration-300 cursor-pointer ${
                  hoveredModel === model.id ? "bg-white/5 border-white/10" : "bg-transparent border-transparent"
                } border`}
              >
                {/* Icon Box */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${model.iconBg} flex-shrink-0 transition-transform overflow-hidden ${
                  hoveredModel === model.id ? "scale-110 rotate-3" : ""
                }`}>
                  <img src={model.logoUrl} alt={model.name} className="w-7 h-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm tracking-tight truncate">{model.name}</span>
                    {model.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded ${
                          tag === "PRO" 
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" 
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide block mt-1">
                    {model.desc}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ===================== CENTER: COPY & ASK ANYTHING ===================== */}
        <div className="lg:col-span-5 flex flex-col justify-center text-center items-center px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6 max-w-[460px]"
          >
            <p className="text-slate-800 dark:text-slate-200 text-base md:text-[17px] font-medium leading-relaxed tracking-tight">
              We&apos;ve created a platform that&apos;s faster, simpler, and more responsive to the latest advancements in AI. 
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500"> No accounts required</span>, 
              no downloads, no data collection – just powerful AI at your fingertips.
            </p>

            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] leading-relaxed">
              We believe AI should enhance human capability while respecting human dignity. It should be a tool for exploration and creation, 
              not surveillance and control. Venice exists to make this vision a reality.
            </p>

            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-[15px] font-medium leading-relaxed">
              Join over <span className="font-bold text-slate-800 dark:text-slate-100">1,000,000+ users</span> and experience AI as it should be – powerful, private, and permissionless.
            </p>

            {/* Ask Anything Input Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full relative mt-4">
              <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Anything..."
                  className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/20 active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ===================== RIGHT: ANIMATED VECTOR CARD ===================== */}
        <div className="lg:col-span-3 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[280px] aspect-square bg-black text-slate-100 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center group"
          >
            <Image
              src="/ai.jpg"
              alt="AI Graphic"
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 768px) 100vw, 280px"
              priority
            />
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 pointer-events-none" />
            
            {/* Main Vector Logo */}
            <div className="relative z-10 w-32 h-32 border border-white/20 rounded-full flex items-center justify-center p-3 backdrop-blur-sm bg-black/20">
              <div className="w-full h-full border border-white/30 rounded-full flex items-center justify-center p-3 relative">
                <img src="/apple-touch-icon.png" alt="Logo" className="w-12 h-12 object-contain rounded-xl" />
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
