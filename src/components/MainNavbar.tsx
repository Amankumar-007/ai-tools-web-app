"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";

// Define types for user
interface User {
  subscription_tier?: string;
}

interface MainNavbarProps {
  user: User | null;
  onSignOut: () => void;
  onProtectedLink: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => void;
}

const NAV_LINKS = [
  { href: "/ai-tools", label: "AI Tools" },
  { href: "/#categories", label: "Categories" },
  { href: "/trending", label: "Trending" },
  { href: "/About", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

const EXPLORE_LINKS = [
  { path: '/tomato-ai', label: 'AI Assistant' },
  { path: '/prompts', label: 'Prompts Library' },
  { path: '/n8n-templates', label: 'n8n Templates' },
  { path: '/ai-workflows', label: 'AI Workflows' },
  { path: '/ai-videos', label: 'AI Video Tools' },
  { path: '/content-generator', label: 'Content Generator' },
  { path: '/prompt-generator', label: 'Prompt Generator' },
  { path: '/roadmap-generator', label: 'Roadmap Gen' },
  { path: '/resume-analyzer', label: 'Resume Analyzer' },
  { path: '/summarization', label: 'Summarization' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/roadmap', label: 'App Roadmap' },
];

export default function MainNavbar({ user, onSignOut, onProtectedLink }: MainNavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      if (drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ===================== MOBILE TOP BAR ===================== */}
      <header className={`md:hidden fixed left-0 right-0 z-50 transition-all duration-300 
        ${isScrolled
          ? 'top-0 bg-transparent py-4'
          : 'top-2 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md py-4'
        }`}
      >
        <div className="flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeDrawer}>
            <Image src="/logo.png" alt="TomatoTool Logo" width={32} height={32} priority className="w-8 h-8" />
            <span className="font-bold tracking-tight bg-gradient-to-r from-[#ff512f] to-[#dd2476] bg-clip-text text-transparent font-[Montserrat] text-lg">
              tomato<span className="font-light">Tool</span>
            </span>
          </Link>

          {/* Right: Theme + Hamburger (2-line minimal icon) */}
          <div className="flex items-center gap-3">
            <ThemeToggleButton variant="circle-blur" start="top-right" />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="w-10 h-10 flex flex-col justify-center items-end gap-1.5 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <span className="w-6 h-0.5 bg-slate-800 dark:bg-slate-200 rounded-full" />
              <span className="w-4 h-0.5 bg-slate-800 dark:bg-slate-200 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE DRAWER ===================== */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop (Removed backdrop-blur-sm for high-performance mobile paint) */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-[60] bg-black/40"
              onClick={closeDrawer}
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-[70] w-[85vw] max-w-sm bg-white dark:bg-[#070708] flex flex-col"
            >
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                  Navigation
                </span>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-4">
                {/* Main Nav Links (Rendered statically to prevent GPU layout calculation bottlenecks during transitions) */}
                <nav className="flex flex-col gap-6 mb-8">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeDrawer}
                      className="text-2xl font-light tracking-tight text-slate-800 dark:text-slate-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors block py-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                  <button
                    onClick={() => setExploreOpen(!exploreOpen)}
                    className="flex items-center justify-between w-full text-slate-400 dark:text-slate-500 text-sm font-semibold tracking-wider uppercase mb-4"
                  >
                    <span>Explore Tools</span>
                    <motion.span animate={{ rotate: exploreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {exploreOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 py-2">
                          {EXPLORE_LINKS.map((item) => (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={closeDrawer}
                              className="text-base font-light text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors block py-0.5"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="px-8 py-8 border-t border-slate-100 dark:border-white/5">
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-md">
                      {user.subscription_tier}
                    </span>
                    <button
                      onClick={() => { closeDrawer(); onSignOut(); }}
                      className="text-xs font-semibold uppercase tracking-wider text-red-500 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={closeDrawer}
                      className="w-full text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeDrawer}
                      className="w-full text-center text-xs font-bold uppercase tracking-wider text-white py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===================== DESKTOP NAV ===================== */}
      <motion.nav
        className={`hidden md:block fixed left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled ? 'top-0 py-4 bg-transparent' : 'top-4 py-4 bg-transparent'}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between px-6 relative">
          {/* Desktop Logo */}
          <Link href="/" className="flex items-center z-30">
            <div className="flex items-center">
              <Image src="/logo.png" alt="TomatoTool Logo" width={40} height={40} priority className="w-9 h-9" />
              <span className="ml-3 font-bold tracking-wide bg-gradient-to-r from-[#ff512f] to-[#dd2476] bg-clip-text text-transparent font-[Montserrat] text-xl">
                tomato<span className="font-light">Tool</span>
              </span>
            </div>
          </Link>

          {/* Liquid Glass Nav Pill */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1 
              backdrop-blur-2xl bg-white/60 dark:bg-black/30
              border border-white/40 dark:border-white/10
              shadow-xl shadow-black/10 dark:shadow-black/30
              rounded-full px-5 py-2.5
              relative overflow-visible
              hover:bg-white/70 hover:dark:bg-black/40
              hover:border-white/60 hover:dark:border-white/20
              transition-all duration-300"
            >

              <span className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 py-1 rounded-full font-semibold shadow-sm mr-1">
                Beta
              </span>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => link.href !== "/#categories" && link.href !== "/trending" ? onProtectedLink(e, link.href) : undefined}
                  className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-full font-medium text-sm transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}

              {/* Desktop Explore Dropdown */}
              <div className="relative group/dropdown">
                <button className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-full font-medium text-sm transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10">
                  Explore
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-300 group-hover/dropdown:rotate-180" />
                </button>

                <div className="absolute top-full right-0 mt-2 pt-2 w-48 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 origin-top-right scale-95 group-hover/dropdown:scale-100 z-50">
                  <div className="backdrop-blur-2xl bg-white/95 dark:bg-[#111111]/95 border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-2xl p-1.5 flex flex-col max-h-[60vh] overflow-y-auto no-scrollbar">
                    {EXPLORE_LINKS.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Right */}
          <div className="flex items-center gap-2 ml-auto z-30">
            <ThemeToggleButton variant="circle-blur" start="top-right" />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30 font-medium">
                  {user.subscription_tier}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-sm font-medium text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-semibold text-white px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-90 transition-all shadow-md shadow-orange-500/20">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Self-contained style block for hiding scrollbars without globals.css edits */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />
    </>
  );
}
