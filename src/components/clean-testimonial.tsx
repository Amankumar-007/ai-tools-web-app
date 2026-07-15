"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { User } from "lucide-react"

// --- TYPES ---
interface TestimonialData {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

const testimonials: TestimonialData[] = [
  {
    quote: "Finding the right LLM or AI tool used to take hours of searching. Tomato AI brings everything into a clean interface with solid workflow integrations.",
    author: "Rohan Mehta",
    role: "AI Engineer",
    company: "Swiggy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "The playground features and comparative AI testing helped our design team prototype dynamic AI features in days instead of weeks.",
    author: "Priya Sharma",
    role: "Product Designer",
    company: "Razorpay",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "As a solo founder, saving time is everything. I found three prompt engineering tools here that cut my development cycle in half.",
    author: "Aarav Patel",
    role: "Founder",
    company: "DevFlow AI",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "The tool discovery and prompt templates saved us dozens of hours. The attention to detail in this platform is unmatched.",
    author: "Sarah Chen",
    role: "Design Director",
    company: "Linear",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "Finally, a platform that understands what developers actually need when integrating AI into their modern stack.",
    author: "Marcus Webb",
    role: "Creative Lead",
    company: "Vercel",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "We integrated the recommended agent workflows into our customer support system. The transition was incredibly seamless.",
    author: "Kabir Joshi",
    role: "Tech Lead",
    company: "TCS",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    quote: "This catalog is the most comprehensive and well-curated index of productivity AI tools on the web right now.",
    author: "Elena Frost",
    role: "Head of Product",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120",
  },
]

function SplitText({ text }: { text: string }) {
  const words = text.split(" ")

  return (
    <span className="inline">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: i * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [liveTestimonials] = useState<TestimonialData[]>(testimonials)

  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % liveTestimonials.length)
  }

  const currentTestimonial = liveTestimonials[activeIndex]

  return (
    <div className="relative group w-full py-2">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
          What Our Users Say
        </h2>
        <p className="text-neutral-500 mt-4 text-lg">
          Join thousands of creators who are building the future with Fresh AI.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-auto py-10 px-8"
        style={{ cursor: "none" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNext}
      >
        {/* Custom magnetic cursor */}
        <motion.div
          className="pointer-events-none absolute z-50 mix-blend-difference"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <motion.div
            className="rounded-full bg-foreground flex items-center justify-center"
            animate={{
              width: isHovered ? 80 : 0,
              height: isHovered ? 80 : 0,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <motion.span
              className="text-background text-xs font-medium tracking-wider uppercase"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 }}
            >
              Next
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Floating index indicator */}
        <motion.div
          className="absolute top-8 right-8 flex items-baseline gap-1 font-mono text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="text-2xl font-light text-foreground"
            key={activeIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{String(liveTestimonials.length).padStart(2, "0")}</span>
        </motion.div>

        {/* Stacked avatar previews for other testimonials */}
        <motion.div
          className="absolute top-8 left-8 flex -space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.6 }}
        >
          {liveTestimonials.map((t, i) => (
            <motion.div
              key={i}
              className={`w-6 h-6 rounded-full border-2 border-background overflow-hidden relative transition-all duration-300 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 ${i === activeIndex ? "ring-1 ring-accent ring-offset-1 ring-offset-background" : "opacity-50"
                }`}
              whileHover={{ scale: 1.1, opacity: 1 }}
            >
              <User size={12} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={`${activeIndex}-${currentTestimonial.author}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="text-3xl md:text-5xl font-light leading-relaxed tracking-tight text-foreground"
            >
              <SplitText text={currentTestimonial.quote} />
            </motion.blockquote>
          </AnimatePresence>

          {/* Author with reveal line */}
          <motion.div className="mt-12 relative" layout>
            <div className="flex items-center gap-4">
              {/* Avatar container with all images stacked */}
              <div className="relative w-12 h-12">
                <motion.div
                  className="absolute -inset-1.5 rounded-full border border-accent/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                {liveTestimonials.map((t, i) => (
                  <motion.div
                    key={`${t.author}-${i}`}
                    className="absolute inset-0 w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 overflow-hidden transition-[filter] duration-500"
                    animate={{
                      opacity: i === activeIndex ? 1 : 0,
                      zIndex: i === activeIndex ? 1 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <User size={24} />
                  </motion.div>
                ))}
              </div>

              {/* Author info with accent line */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  className="relative pl-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-px bg-accent"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originY: 0 }}
                  />
                  <span className="block text-sm font-medium text-foreground tracking-wide">
                    {currentTestimonial.author}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-widest">
                    {currentTestimonial.role} — {currentTestimonial.company}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-16 h-px bg-border relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${((activeIndex + 1) / liveTestimonials.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Keyboard hint */}
        <motion.div
          className="absolute bottom-8 left-8 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.4 : 0.2 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Click anywhere</span>
        </motion.div>
      </div>
    </div>
  )
}
