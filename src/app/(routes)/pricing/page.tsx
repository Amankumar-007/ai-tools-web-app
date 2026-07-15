'use client'
import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import MainNavbar from '@/components/MainNavbar';
import { getCurrentUser, signOut, User } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

const PricingPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
  };

  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>,
    href: string
  ) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    } else {
      router.push(href);
    }
  };

  const languages = [
    { text: "Free", font: "font-sans" },
    { text: "मुफ़्त", font: "font-serif" },
    { text: "Gratis", font: "font-mono" },
    { text: "無料", font: "font-sans" },
    { text: "Gratuit", font: "font-serif" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-500 font-sans flex flex-col relative overflow-hidden">
      <MainNavbar
        user={user}
        onSignOut={handleSignOut}
        onProtectedLink={handleProtectedLink}
      />

      {/* Subtle Marquee Background */}
      <div className="absolute top-[20%] left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none z-0">
        <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
          {[...languages, ...languages, ...languages].map((item, i) => (
            <span key={i} className={`text-[12rem] font-bold uppercase tracking-tighter ${item.font}`}>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <main className="flex-grow z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 text-center max-w-3xl mx-auto">

          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
            Powerful AI tools, <br className="hidden md:block" />
            <span className="text-zinc-500 dark:text-zinc-400 italic">democratized.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-light">
            From smart assistants to complex workflows, experience the next generation of productivity without the barrier to entry.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Basic Tier */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-xl flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-1">Basic</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">For individual exploration.</p>
            </div>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-light tracking-tighter">$0</span>
              <span className="text-sm text-zinc-400">/ forever</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Basic AI Assistant', '100 queries per month', 'Community support', 'Standard speed'].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Check size={16} className="mt-0.5 text-zinc-900 dark:text-zinc-100" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button className="w-full flex items-center justify-between px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
              Start Chatting
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Pro Tier (Inverted for aesthetic emphasis) */}
          <div className="p-8 rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-8 px-3 py-1 bg-zinc-800 dark:bg-zinc-200 rounded-b-lg text-[10px] font-bold tracking-widest uppercase">
              Most Popular
            </div>
            <div className="mb-8 mt-2">
              <h3 className="text-lg font-medium mb-1">Pro Suite</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">For power users.</p>
            </div>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-light tracking-tighter">$0</span>
              <span className="text-sm text-zinc-400 dark:text-zinc-500">/ forever</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Unlimited AI Chat', 'Custom AI Workflows', 'Priority Response Time', 'Early access to tools'].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="mt-0.5 text-zinc-100 dark:text-zinc-900" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button className="w-full flex items-center justify-between px-6 py-3 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:opacity-90 transition-opacity text-sm font-medium">
              Unlock Pro
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-xl flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-1">Enterprise</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">For scaling teams.</p>
            </div>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-light tracking-tighter">$0</span>
              <span className="text-sm text-zinc-400">/ forever</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Custom Model Training', 'Full API Access', 'Team Collaboration', 'Dedicated Support'].map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <Check size={16} className="mt-0.5 text-zinc-900 dark:text-zinc-100" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button className="w-full flex items-center justify-between px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
              Contact Sales
              <ArrowRight size={16} />
            </button>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-12 z-10">
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          The best intelligence is shared intelligence.
        </p>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;