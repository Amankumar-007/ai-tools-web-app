"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { NewsletterSignup } from "@/components/growth/newsletter-signup"

const GITHUB_USER = "Amankumar-007"

/** The maker's GitHub profile as a small chip: avatar, handle, and an arrow that nudges on hover. */
function GithubChip() {
  return (
    <a
      href={`https://github.com/${GITHUB_USER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-black/10 dark:bg-white/50 dark:hover:border-black/20 dark:hover:bg-white"
    >
      {/* The GitHub mark sits underneath, so it still shows if the avatar cannot load. */}
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 dark:bg-black/10">
        <Github className="h-4 w-4" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://github.com/${GITHUB_USER}.png?size=64`}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          onError={(event) => { event.currentTarget.style.display = "none" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500">Built by</span>
        {/* Takes the footer's own text colour: white on the dark footer (light theme), black on the pale one (dark theme). */}
        <span className="text-sm font-semibold text-inherit">@{GITHUB_USER}</span>
      </span>
      <span className="sr-only">on GitHub (opens in a new tab)</span>
      <ArrowUpRight className="h-4 w-4 text-neutral-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500" aria-hidden="true" />
    </a>
  )
}

export default function Footer() {
  const links = [
    { name: "AI Tools", href: "/ai-tools" },
    { name: "Daily Tools", href: "/tools" },
    { name: "N8n Automation", href: "/n8n-templates" },
    { name: "Resume", href: "/resume-analyzer" },
    { name: "Summarizer", href: "/summarization" },
    { name: "Pricing", href: "/pricing" },
  ]

  const socials = [
    { icon: Github, href: "https://github.com/Amankumar-007" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/aman-kumar-web" },
    // Point at the final URLs: twitter.com and the bare linkedin.com host both
    // 301 elsewhere, and these run in the footer of every page on the site.
    { icon: Twitter, href: "https://x.com/AmanCodex" },
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
            <p className="text-neutral-400 dark:text-neutral-600 text-sm font-medium leading-relaxed">
              Synthesizing intelligence into intuitive tools. Precise automation for the modern creator.
            </p>
            <NewsletterSignup source="footer" tone="footer" title="New AI tools, weekly" blurb="The best new tools and tips, in your inbox." />
          </div>

          {/* Minimalist Nav */}
          <div className="flex flex-wrap gap-x-20 gap-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Product</h4>
              <div className="flex flex-col gap-1 md:gap-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    prefetch={false}
                    href={link.href}
                    className="py-1.5 md:py-0 text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Connect</h4>
              <div className="flex flex-col gap-1 md:gap-4">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 md:py-0 text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300"
                  >
                    {social.href.includes("github") ? "GitHub" : social.href.includes("linkedin") ? "LinkedIn" : "Twitter"}
                  </a>
                ))}
                <a href="mailto:contact@tomatoai.com" className="py-1.5 md:py-0 text-sm text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-black transition-all duration-300">
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

          <GithubChip />
        </div>
      </div>
    </footer>
  )
}