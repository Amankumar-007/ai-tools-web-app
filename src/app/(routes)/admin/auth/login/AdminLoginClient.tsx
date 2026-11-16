'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Lock, Mail, Eye, EyeOff, Key,
  Sparkles, Check, ArrowRight, ShieldAlert, Cpu, Terminal, Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginClient() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  const performLogin = async (id: string, pass: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      if (data.token) {
        try {
          localStorage.setItem('tomato_admin_token', data.token);
          document.cookie = `tomato_admin_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        } catch {}
      }

      setSuccessMsg('Security verification passed! Entering Dashboard...');
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during authentication.');
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(identifier, password);
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Light Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-50 rounded-full blur-[100px] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Top Header Card */}
        <div className="rounded-3xl bg-white/80 border border-slate-200 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">

          {/* Logo & Security Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Admin Console</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
              Tomato AI platform & database management gateway.
            </p>
          </div>

          {/* Error / Success Notifications */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-3"
              >
                <ShieldAlert size={18} className="text-rose-500 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-3"
              >
                <Check size={18} className="text-emerald-500 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@tomato.ai"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Master Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            ← Return to Tomato AI Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
