"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  const links = [
    { name: "AI Tools", href: "/ai-tools" },
    { name: "N8n Automation", href: "/n8n-templates" },
    { name: "Resume", href: "/resume-analyzer" },
    { name: "Summarizer", href: "/summarization" },
  ]

  const socials = [
    { icon: Github, href: "https://github.com/Amankumar-007" },
    { icon: Linkedin, href: "https://linkedin.com/in/aman-kumar-web" },
    { icon: Twitter, href: "https://twitter.com/AmanCodex" },
  ]

  return (
    <footer className="w-full bg-[#02040a] dark:bg-[#e6ebe0] text-white dark:text-black pt-24 pb-12 relative overflow-hidden font-sans">
      {/* Sharp top border with glow */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          {/* Logo & Vision */}
          <div className="flex flex-col gap-6 max-w-xs">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="TomatoAI Logo" width={32} height={32} className="rounded-md" />
              <span>TOMATOAI<span className="text-indigo-500 text-3xl leading-[0]">.</span></span>
            </Link>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
              Synthesizing intelligence into intuitive tools. Precise automation for the modern creator.
            </p>
          </div>

          {/* Minimalist Nav */}
          <div className="flex flex-wrap gap-x-20 gap-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Product</h4>
              <div className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Connect</h4>
              <div className="flex flex-col gap-4">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300"
                  >
                    {social.href.includes("github") ? "GitHub" : social.href.includes("linkedin") ? "LinkedIn" : "Twitter"}
                  </a>
                ))}
                <a href="mailto:contact@tomatoai.com" className="text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300">
                  Mail
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Status */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
            <span>© 2026 TOMATO AI INC.</span>
            <Link href="/privacy" className="hover:text-white dark:hover:text-black transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-white dark:hover:text-black transition-colors">TERMS</Link>
          </div>

        </div>
      </div>
    </footer>
  )
}