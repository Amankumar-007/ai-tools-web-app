"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import Link from "next/link";
import { getCurrentUser, signOut } from "@/lib/supabase";
import Image from "next/image";

// Define types for user
interface User {
  subscription_tier?: string;
}

interface MainNavbarProps {
  user: User | null;
  onSignOut: () => void;
  onProtectedLink: (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, href: string) => void;
}

export default function MainNavbar({ user, onSignOut, onProtectedLink }: MainNavbarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll listener for navbar animation and mobile menu
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Close mobile menu when scrolling
      if (navOpen) {
        setNavOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navOpen]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${isScrolled
        ? 'py-2'
        : 'py-4'
        }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-6 relative">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex items-center px-2 py-1 border rounded text-gray-600 z-30"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                navOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Logo - Hidden on scroll for desktop, always visible on mobile */}
        <AnimatePresence>
          {(!isScrolled || window.innerWidth < 768) && (
            <Link href="/" className="px-2 py-2 md:p-0 flex items-center z-30">
              <motion.div
                className="flex items-center"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/logo.png"
                  alt="QuickAI Logo"
                  width={40}
                  height={40}
                  priority
                  className="inline-block w-8 h-8 md:w-10 md:h-10"
                />
                <span className="ml-3 font-bold tracking-wide bg-gradient-to-r from-[#ff512f] to-[#dd2476] bg-clip-text text-transparent drop-shadow-sm font-[Montserrat] text-base sm:text-lg md:text-2xl">
                  tomato<span className="font-light">Tool</span>
                </span>
              </motion.div>
            </Link>
          )}
        </AnimatePresence>

        {/* Liquid Glass Navigation Links */}
        <motion.div
          className={`fixed inset-x-0 ${navOpen ? 'top-16' : 'top-full'} md:top-4 md:left-1/2 md:inset-x-auto md:-translate-x-1/2 z-20 transition-all duration-500 ease-out ${navOpen ? "flex" : "hidden"
            } md:flex`}
          animate={isScrolled ? { scale: 0.95, y: -5 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >

          <div className="w-full md:w-auto mx-4 md:mx-0 flex flex-col md:flex-row items-center gap-2 md:gap-4 
            backdrop-blur-2xl bg-white/5 dark:bg-black/5 
            border border-white/20 dark:border-white/10
            shadow-2xl shadow-black/5 dark:shadow-black/20
            rounded-2xl md:rounded-full px-6 py-3
            relative overflow-hidden group
            hover:bg-white/10 hover:dark:bg-black/10
            hover:border-white/30 hover:dark:border-white/20
            hover:shadow-3xl hover:scale-[1.02]
            transition-all duration-500 ease-out
            before:absolute before:inset-0 before:rounded-2xl md:before:rounded-full 
            before:bg-gradient-to-r before:from-white/10 before:via-transparent before:to-white/10
            before:opacity-0 before:group-hover:opacity-100
            before:transition-opacity before:duration-500
            after:absolute after:inset-0 after:rounded-2xl md:after:rounded-full
            after:bg-gradient-to-b after:from-white/5 after:to-transparent
            after:pointer-events-none"
          >
            {/* Logo inside nav for scrolled state */}
            <AnimatePresence>
              {isScrolled && (
                <Link href="/" className="hidden md:flex items-center mr-2">
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, scale: 0.7, x: -16 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: -16 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.23, 1, 0.32, 1],
                      type: "tween"
                    }}
                  >
                    <Image
                      src="/logo.png"
                      alt="QuickAI Logo"
                      width={32}
                      height={32}
                      priority
                      className="inline-block w-5 h-5 md:w-7 md:h-7"
                    />
                  </motion.div>
                </Link>
              )}
            </AnimatePresence>

            {/* Beta Badge */}
            <motion.span
              className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 
text-white px-2.5 py-1 rounded-full mx-0 font-medium
shadow-lg shadow-orange-500/30
hover:shadow-orange-500/50 hover:scale-105
transition-all duration-200 relative z-10"
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.15, ease: "easeOut" }
              }}
              whileTap={{
                scale: 0.97,
                transition: { duration: 0.1, ease: "easeInOut" }
              }}
            >
              Beta
            </motion.span>

            {/* Navigation Links with Enhanced Glass Effect */}
            <Link
              href="/ai-tools"
              onClick={(e) => onProtectedLink(e, "/ai-tools")}
              className="relative text-gray-700 dark:text-gray-300 
hover:text-black dark:hover:text-white 
px-3.5 py-2 rounded-full font-medium text-sm
transition-all duration-200 ease-out
hover:bg-white/20 hover:dark:bg-white/5
hover:backdrop-blur-sm hover:scale-102
active:scale-98
before:absolute before:inset-0 before:rounded-full
before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10
before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-200
after:absolute after:inset-0 after:rounded-full after:border after:border-white/10
after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200
z-10"
            >
              AI Tools
            </Link>

            <Link
              href="/#categories"
              className="relative text-gray-700 dark:text-gray-300 
hover:text-black dark:hover:text-white 
px-3.5 py-2 rounded-full font-medium text-sm
transition-all duration-200 ease-out
hover:bg-white/20 hover:dark:bg-white/5
hover:backdrop-blur-sm hover:scale-102
active:scale-98
before:absolute before:inset-0 before:rounded-full
before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10
before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-200
after:absolute after:inset-0 after:rounded-full after:border after:border-white/10
after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200
z-10"
            >
              Categories
            </Link>

            <Link
              href="/trending"
              className="relative text-gray-700 dark:text-gray-300 
hover:text-black dark:hover:text-white 
px-3.5 py-2 rounded-full font-medium text-sm
transition-all duration-200 ease-out
hover:bg-white/20 hover:dark:bg-white/5
hover:backdrop-blur-sm hover:scale-102
active:scale-98
before:absolute before:inset-0 before:rounded-full
before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10
before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-200
after:absolute after:inset-0 after:rounded-full after:border after:border-white/10
after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200
z-10"
            >
              Trending
            </Link>

            <Link
              href="/About"
              onClick={(e) => onProtectedLink(e, "/about")}
              className="relative text-gray-700 dark:text-gray-300 
hover:text-black dark:hover:text-white 
px-3.5 py-2 rounded-full font-medium text-sm
transition-all duration-200 ease-out
hover:bg-white/20 hover:dark:bg-white/5
hover:backdrop-blur-sm hover:scale-102
active:scale-98
before:absolute before:inset-0 before:rounded-full
before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10
before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-200
after:absolute after:inset-0 after:rounded-full after:border after:border-white/10
after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200
z-10"
            >
              About
            </Link>

            <Link
              href="/pricing"
              className="relative text-gray-700 dark:text-gray-300 
hover:text-black dark:hover:text-white 
px-3.5 py-2 rounded-full font-medium text-sm
transition-all duration-200 ease-out
hover:bg-white/20 hover:dark:bg-white/5
hover:backdrop-blur-sm hover:scale-102
active:scale-98
before:absolute before:inset-0 before:rounded-full
before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10
before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-200
after:absolute after:inset-0 after:rounded-full after:border after:border-white/10
after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200
z-10"
            >
              Pricing
            </Link>


            {/* Auth actions for mobile inside dropdown */}
            {user ? (
              <div className="md:hidden w-full flex items-center justify-center gap-3 pt-2 border-t border-white/20 dark:border-white/10 mt-1">
                <span className="text-xs bg-blue-500/20 backdrop-blur-sm text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/30">
                  {user.subscription_tier}
                </span>
                <button
                  onClick={() => { setNavOpen(false); onSignOut(); }}
                  className="text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="md:hidden w-full flex items-center justify-center gap-3 pt-2 border-t border-white/20 dark:border-white/10 mt-1">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
                  onClick={() => setNavOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200"
                  onClick={() => setNavOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right side */}
        <div className="flex items-center space-x-2 ml-auto z-30">
          <ThemeToggleButton variant="circle-blur" start="top-right" />
          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs bg-blue-500/20 backdrop-blur-sm text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full border border-blue-500/30">
                {user.subscription_tier}
              </span>
              <button
                onClick={onSignOut}
                className="text-gray-600 hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/login"
                className="text-gray-600 hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-gray-600 hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
