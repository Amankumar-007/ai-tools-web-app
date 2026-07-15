"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const expiringModels = [
  {
    id: 'tencent-hy3',
    provider: 'Tencent',
    name: 'Hy3',
    details: '6.91T tokens',
    expiryDate: '2026-07-21',
    favicon: 'https://www.google.com/s2/favicons?domain=tencent.com&sz=128'
  },
  {
    id: 'qwen3-next',
    provider: 'Qwen',
    name: 'Qwen3 Next 80B',
    details: 'Instruct',
    expiryDate: '2026-07-19',
    favicon: 'https://www.google.com/s2/favicons?domain=qwenlm.ai&sz=128'
  },
  {
    id: 'qwen3-coder',
    provider: 'Qwen',
    name: 'Qwen3 Coder 480B',
    details: 'A35B',
    expiryDate: '2026-07-19',
    favicon: 'https://www.google.com/s2/favicons?domain=qwenlm.ai&sz=128'
  }
];

export default function ExpiringModelsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveModels, setHasActiveModels] = useState(true);

  const activeModels = useMemo(() => {
    const today = new Date();
    return expiringModels.filter(m => new Date(m.expiryDate) > today);
  }, []);

  useEffect(() => {
    if (activeModels.length === 0) {
      setHasActiveModels(false);
      return;
    }

    const hasDismissed = sessionStorage.getItem('expiringModalsModalDismissed');
    if (hasDismissed) return;

    // Open after 5 seconds (5 * 1000 ms)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5 * 1000);

    return () => clearTimeout(timer);
  }, [activeModels]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    sessionStorage.setItem('expiringModalsModalDismissed', 'true');
  };

  const handleBannerClick = () => {
    setIsOpen(false);
    sessionStorage.setItem('expiringModalsModalDismissed', 'true');
  };

  if (!hasActiveModels) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px] rounded-[32px] shadow-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10"
          >
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="relative p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-5 rounded-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-900 dark:text-white uppercase">
                    Limited Time Offer
                  </span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                  Premium Intelligence
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px]">
                  Unlock advanced reasoning models at zero cost before they expire.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {activeModels.map((model, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.1, duration: 0.4, ease: "easeOut" }}
                    key={`${model.id}-${idx}`} 
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-black/[0.04] dark:border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/5 p-2 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center">
                        <img src={model.favicon} alt={`${model.provider} logo`} className="w-full h-full object-contain drop-shadow-sm" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {model.provider} {model.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {model.details}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold tracking-wider text-green-600 dark:text-emerald-400 uppercase mb-0.5">
                        Free
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Until {formatDate(model.expiryDate).split(' ')[1]} {formatDate(model.expiryDate).split(' ')[0]}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/tomato-ai"
                  onClick={handleBannerClick}
                  className="relative w-full py-4 rounded-xl font-semibold text-sm text-center text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="relative z-10">Claim Access Now</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-black/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl font-medium text-sm text-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  No, thanks
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
