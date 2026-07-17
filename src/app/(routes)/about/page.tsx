"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Cpu,
  Layers,
  Shield,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Workflow,
  Sparkles,
  Database,
  Terminal,
  Zap,
  TrendingUp,
  Lock,
  Code
} from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/supabase";
import MainNavbar from "@/components/MainNavbar";
import JsonLd, {
  OrganizationStructuredData,
  breadcrumbListStructuredData,
  faqPageStructuredData
} from "@/components/JsonLd";

interface User {
  id: string;
  email: string;
  subscription_tier: 'FREE' | 'PRO' | 'PREMIUM';
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid';
}

export default function About() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"mission" | "orchestration" | "roadmap">("mission");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser as User | null);
      } catch (error) {
        console.error("Error retrieving user session:", error);
      }
    };
    fetchUser();
  }, []);

  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>,
    href: string
  ) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      router.push(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 4000);
    }
  };

  // Structured Data for SEO
  const aboutFaqs = [
    {
      question: "What is TomatoAi?",
      answer: "TomatoAi is a premium curated AI tools, SaaS platforms, and workflows directory. We help developers, professionals, and creators find the best artificial intelligence SaaS tools, compared by pricing, API costs, and community reviews."
    },
    {
      question: "Is TomatoAi free to use?",
      answer: "Yes, searching our curated SaaS database, copy-pasting developer prompts, and importing workflows is completely free."
    }
  ];

  const breadcrumbs = breadcrumbListStructuredData([
    { name: "Home", url: "https://tomatoai.in" },
    { name: "About Us", url: "https://tomatoai.in/about" }
  ]);

  const faqSchema = faqPageStructuredData(aboutFaqs);

  // Tab text contents for dynamic story section (Tailored for SaaS & detailed)
  const tabContents = {
    mission: {
      title: "Empowering Workflows Everywhere",
      description: "We believe every developer, engineer, and creator deserves a distraction-free discovery layer. Our mission is to connect builders with production-ready AI capabilities and empower them to automate manual, repetitive tasks. TomatoAi filters out raw landing page noise to unlock your true automated potential, focusing strictly on high-performance integrations.",
      kicker: "01 . CORE PURPOSE"
    },
    orchestration: {
      title: "Multi-Agent Integration Pipelines",
      description: "TomatoAi is engineered for professional workflow integration. We provide complete integration pathways, custom developer blueprints, and multi-agent n8n templates to orchestrate AI models directly inside your enterprise software stack, allowing you to run autonomous background workflows with ease.",
      kicker: "02 . ENGINEERING"
    },
    roadmap: {
      title: "The Future of Autonomous Workspaces",
      description: "Our 2026/2027 vision introduces real-time token cost calculators, direct API endpoints to query trending AI products programmatically, and unified team dashboards to share and execute workflows collectively. We are building the foundational infrastructure for agentic orchestration.",
      kicker: "03 . VISION 2027"
    }
  };

  return (
    <>
      <JsonLd data={OrganizationStructuredData} />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={faqSchema} />

      {/* Actual Nav Bar displayed at the top */}
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />

      <main className="min-h-screen bg-[#fafafc] dark:bg-[#08080c] text-[#0f172a] dark:text-[#f8fafc] font-sans transition-colors duration-300 pb-16">

        {/* ===================== HERO CARD SECTION ===================== */}
        <div className="pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 w-full">
          <section className="relative w-full min-h-[calc(100vh-8rem)] bg-gradient-to-br from-[#d4e4f7] via-[#e2edfa] to-[#f2f7fc] dark:from-[#131b26] dark:via-[#182333] dark:to-[#0f1520] p-8 sm:p-16 rounded-[40px] flex flex-col justify-between overflow-hidden shadow-sm">

            {/* Spacer */}
            <div className="w-full h-8 z-10" />

            {/* Mid Layout: Heading & Summary Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end z-10 pt-8 sm:pt-16 w-full max-w-7xl mx-auto">
              <div className="lg:col-span-7 flex flex-col items-start">

                <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-2xl">
                  Empowering Workflows Everywhere
                </h2>
              </div>
              <div className="lg:col-span-5 flex flex-col items-start lg:items-end lg:text-right gap-4">
                <p className="text-sm sm:text-base text-slate-700/90 dark:text-slate-300 max-w-sm font-light leading-relaxed">
                  A premium SaaS directory and automation hub for developers to search, compare, and integrate the world&apos;s best AI tools.
                </p>
                <button
                  onClick={(e) => handleProtectedLink(e, "/ai-tools")}
                  className="px-8 py-3.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md cursor-pointer"
                >
                  Explore AI Directory
                </button>
              </div>
            </div>

            {/* Public ab.png Image in the center (absolute positioned, extra big format) */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none z-0">
              <div className="relative w-[380px] sm:w-[580px] md:w-[820px] h-[380px] sm:h-[580px] md:h-[820px] translate-y-24 sm:translate-y-36">
                <Image
                  src="/ab.png"
                  alt="TomatoAi Assistant Panel"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 350px, (max-width: 1024px) 580px, 820px"
                />
              </div>
            </div>

            {/* Huge "About Us" heading aligned exactly like mockup */}
            <div className="relative z-10 w-full select-none pointer-events-none mt-24 max-w-7xl mx-auto">
              <h1 className="text-[4.5rem] sm:text-[9rem] md:text-[14rem] font-bold leading-none tracking-tighter text-slate-955 dark:text-white text-center sm:text-left drop-shadow-sm">
                About Us
              </h1>
            </div>

          </section>
        </div>

        {/* Outer container for subsequent sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 flex flex-col gap-24">

          {/* ===================== HOW TO SCALE WITH TOMATOAI ===================== */}
          <section className="py-8 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-16 tracking-tight">
              How to scale your output with TomatoAi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">

              {/* Step 1 */}
              <div className="group relative p-8 rounded-3xl bg-white dark:bg-[#0c0d10] border border-slate-200/50 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
                <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-100 dark:text-white/5 select-none transition-colors group-hover:text-blue-500/10">01</span>
                <div className="w-14 h-14 rounded-2xl bg-[#ebf4fa] dark:bg-slate-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm border border-slate-200/20 transition-transform group-hover:scale-105">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Search AI Tools</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Browse through our curated index of 1200+ verified AI models, SaaS platforms, and software with detailed filter options.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group relative p-8 rounded-3xl bg-white dark:bg-[#0c0d10] border border-slate-200/50 dark:border-white/5 hover:border-pink-500/30 dark:hover:border-pink-500/20 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
                <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-100 dark:text-white/5 select-none transition-colors group-hover:text-pink-500/10">02</span>
                <div className="w-14 h-14 rounded-2xl bg-[#ebf4fa] dark:bg-slate-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm border border-slate-200/20 transition-transform group-hover:scale-105">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Compare Pricing</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Analyze subscription options, free quotas, and API pricing models side-by-side to optimize your developer spend.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group relative p-8 rounded-3xl bg-white dark:bg-[#0c0d10] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
                <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-100 dark:text-white/5 select-none transition-colors group-hover:text-indigo-500/10">03</span>
                <div className="w-14 h-14 rounded-2xl bg-[#ebf4fa] dark:bg-slate-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm border border-slate-200/20 transition-transform group-hover:scale-105">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Load Workflows</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Access pre-built n8n templates, python integration scripts, and custom API execution blueprints for quick deployment.
                </p>
              </div>

              {/* Step 4 */}
              <div className="group relative p-8 rounded-3xl bg-white dark:bg-[#0c0d10] border border-slate-200/50 dark:border-white/5 hover:border-violet-500/30 dark:hover:border-violet-500/20 transition-all duration-300 flex flex-col items-center text-center shadow-sm">
                <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-100 dark:text-white/5 select-none transition-colors group-hover:text-violet-500/10">04</span>
                <div className="w-14 h-14 rounded-2xl bg-[#ebf4fa] dark:bg-slate-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shadow-sm border border-slate-200/20 transition-transform group-hover:scale-105">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Deploy Automation</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  Chain multiple AI tools together to automate complex business operations and scale your weekly output speed.
                </p>
              </div>

            </div>
          </section>

          {/* ===================== WHAT IS THE STORY SECTION ===================== */}
          <section className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
                What is the story of tomatoTool?
              </h2>

              {/* Interactive Pill Tabs */}
              <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200/20 dark:border-white/10 shadow-inner">
                {(["mission", "orchestration", "roadmap"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === tab
                      ? "bg-slate-950 dark:bg-white text-white dark:text-black shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                  >
                    {tab === "mission" ? "Mission" : tab === "orchestration" ? "Orchestration" : "Future Roadmap"}
                  </button>
                ))}
              </div>

              {/* Story Tab Description Panel */}
              <div className="min-h-[180px] w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                      {tabContents[activeTab].kicker}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      {tabContents[activeTab].title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light text-base sm:text-lg">
                      {tabContents[activeTab].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Image Column (High tech code matrix graphic) */}
            <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-lg border border-slate-200/50 dark:border-white/5 bg-slate-950">
                <Image
                  src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
                  alt="Premium abstract digital code visualization"
                  fill
                  className="object-cover opacity-75"
                  sizes="(max-width: 768px) 100vw, 440px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Terminal className="w-3.5 h-3.5" /> Tomato OS v4.1
                  </span>
                </div>
              </div>
            </div>

          </section>

          {/* ===================== STATISTICS DASHBOARD ===================== */}
          <section className="py-8 flex flex-col gap-6">

            {/* Top Row: 3 Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Stat 1 */}
              <div className="group p-8 rounded-[24px] bg-white dark:bg-[#0c0d10] border border-slate-200/60 dark:border-white/5 hover:border-blue-500/20 dark:hover:border-blue-500/10 transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Global SaaS Tools</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4 group-hover:scale-[1.02] transition-transform duration-300 origin-left">1,200+</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-light mt-4">
                    AI tools and platforms cataloged with complete pricing data, key features, and reviews.
                  </p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="group p-8 rounded-[24px] bg-white dark:bg-[#0c0d10] border border-slate-200/60 dark:border-white/5 hover:border-pink-500/20 dark:hover:border-pink-500/10 transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Builders</span>
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4 group-hover:scale-[1.02] transition-transform duration-300 origin-left">15K+</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-light mt-4">
                    SaaS builders and developers sharing custom prompt templates and automated workflows.
                  </p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="group p-8 rounded-[24px] bg-white dark:bg-[#0c0d10] border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/10 transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Integration Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4 group-hover:scale-[1.02] transition-transform duration-300 origin-left">92%</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-light mt-4">
                    Reduction in custom software research time compared to bulk un-vetted directories.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Row: Large Stat, Robot Image & Small Stat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Stat 4: Secure Payments (Left - 5 cols) */}
              <div className="lg:col-span-5 p-8 rounded-[24px] bg-white dark:bg-[#0c0d10] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between min-h-[240px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">API Actions Run</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Terminal className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">10.000.000+</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-light mt-4">
                    Automated prompts and API workflows executed through our ready-to-run blueprints.
                  </p>
                </div>
              </div>

              {/* Horizontal Robot Image Card (Center - 4 cols) */}
              <div className="lg:col-span-4 relative rounded-[24px] overflow-hidden min-h-[240px] border border-slate-200/60 dark:border-white/5 shadow-md bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
                  alt="Robot Assistant working on technology systems"
                  fill
                  className="object-cover opacity-85"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>

              {/* Stat 5: Fast Growth (Right - 3 cols) */}
              <div className="lg:col-span-3 p-8 rounded-[24px] bg-white dark:bg-[#0c0d10] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between min-h-[240px] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Growth Velocity</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mt-4">x5</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-light mt-4">
                    Expansion in our automation templates and verified list over the past quarter.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ===================== WHY DEVELOPERS CHOOSE US ===================== */}
          <section className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Column: Title + Grid Checklist */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-12">
                Why builders choose us?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">

                <div className="p-2.5 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                    <Search className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Seamless Searching</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    Easily filter down to the exact SaaS model, API tool, or framework in just a click.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3">
                    <Code className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Developer Ready</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    Get straight to execution with complete code triggers, n8n JSON nodes, and prompt sheets.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Vetted Curation</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    Every tool is tested by our engineering team to verify pricing accuracy and capability.
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Ad-Free Platform</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    No flashing banners or tracking scripts. A clean, high-performance interface focused on search.
                  </p>
                </div>

              </div>
            </div>

            {/* Right Column: Code IDE Image Mockup */}
            <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-[24px] overflow-hidden shadow-lg border border-slate-200/50 dark:border-white/5 bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                  alt="Code IDE visualization"
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-transparent opacity-40" />
              </div>
            </div>

          </section>

          {/* ===================== TESTIMONIAL PANEL ===================== */}
          <section className="py-8">
            <div className="w-full rounded-[32px] bg-[#ebf4fa] dark:bg-[#121922] p-8 sm:p-12 border border-slate-200/40 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

              {/* Left Column: Robot face portrait */}
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[220px] aspect-square rounded-[24px] overflow-hidden shadow-inner border border-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=500&q=80"
                    alt="Sleek white humanoid robot portrait representation"
                    fill
                    className="object-cover animate-[float_6s_ease-in-out_infinite]"
                    sizes="220px"
                  />
                </div>
              </div>

              {/* Right Column: Quote and Name */}
              <div className="md:col-span-8 flex flex-col items-start text-left">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xl md:text-2xl font-bold tracking-tighter text-[#0f172a] dark:text-white uppercase font-[Montserrat]">
                    TOMATOAI
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified Creator
                  </span>
                </div>
                <blockquote className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-light leading-relaxed mb-6 italic">
                  &ldquo;TomatoAi has become our primary resource for researching LLMs and finding emerging developer tools. The n8n automation templates alone saved our team weeks of development effort. It is the ultimate directory for modern SaaS builders looking to maximize their engineering output.&rdquo;
                </blockquote>
                <cite className="not-italic flex items-center gap-3">
                  <div>
                    <span className="font-bold text-slate-955 dark:text-white block text-sm sm:text-base">Aman Kumar</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Lead Architect, TomatoAi Group</span>
                  </div>
                </cite>
              </div>

            </div>
          </section>

          {/* ===================== JOIN OUR NEWSLETTER ===================== */}
          <section className="py-12 relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#d4e4f7] via-[#e2edfa] to-[#f2f7fc] dark:from-[#131b26] dark:via-[#182333] dark:to-[#0f1520] p-8 md:p-16 border border-slate-200/40 dark:border-white/5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">

            {/* Left Info Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                Stay Ahead of the AI Curve
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-6">
                Be the first to discover emerging AI SaaS tools, newly loaded n8n workflows, and expert integration guides.
              </p>

              {/* Checkbox Checklist */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold mb-8 lg:mb-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Weekly Top 5 SaaS releases analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3 free pre-built n8n templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero spam, unsubscribe at any time</span>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-md p-6 bg-white/70 dark:bg-black/25 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl shadow-sm">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form
                      onSubmit={handleSubscribe}
                      className="w-full flex flex-col gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <input
                        type="email"
                        required
                        placeholder="Your Business Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-5 py-3 rounded-full bg-white dark:bg-[#151c28] text-[#0f172a] dark:text-white border border-slate-300/40 dark:border-white/10 text-sm focus:outline-none focus:border-slate-500 font-light"
                      />
                      <button
                        type="submit"
                        className="w-full px-6 py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Subscribe Now
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold px-6 py-4 rounded-full bg-green-500/10 border border-green-500/20 text-sm"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Success! You have been subscribed.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </section>

          {/* ===================== MINIMAL FOOTER & GIANT LOGO ===================== */}
          <section className="pt-8 pb-8 flex flex-col gap-12">

            {/* Giant Logo Watermark */}
            <div className="w-full overflow-hidden select-none pointer-events-none">
              <h1 className="text-[5rem] sm:text-[9rem] md:text-[14rem] font-bold text-slate-900/5 dark:text-white/5 uppercase tracking-tighter text-center leading-none">
                tomatoTool
              </h1>
            </div>

            {/* Copyright block */}
            <div className="flex justify-between items-center text-xs text-slate-400 font-light border-t border-slate-200/50 dark:border-white/5 pt-6 w-full">
              <span>&copy; 2026 tomatoTool. All rights reserved.</span>
              <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" onClick={() => router.push("/")}>Back to Home</span>
            </div>

          </section>

        </div>

      </main>
    </>
  );
}