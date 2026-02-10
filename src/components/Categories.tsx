'use client';

import Link from 'next/link';
import {
  Image as ImageIcon,
  Video,
  Mic,
  Briefcase,
  Layers,
  Code,
  Bot,
  Zap,
  Palette,
  FileText,
  ArrowUpRight
} from 'lucide-react';

const categories = [
  { name: 'AI Image Tools', count: 303, icon: ImageIcon, color: 'text-blue-400' },
  { name: 'AI Video Tools', count: 173, icon: Video, color: 'text-purple-400' },
  { name: 'AI Audio Generators', count: 145, icon: Mic, color: 'text-emerald-400' },
  { name: 'AI Business Tools', count: 1527, icon: Briefcase, color: 'text-orange-400' },
  { name: 'Misc AI Tools', count: 592, icon: Layers, color: 'text-slate-400' },
  { name: 'AI Code Tools', count: 167, icon: Code, color: 'text-indigo-400' },
  { name: 'Automation Tools', count: 455, icon: Bot, color: 'text-rose-400' },
  { name: 'AI Productivity Tools', count: 607, icon: Zap, color: 'text-yellow-400' },
  { name: 'AI Art Generators', count: 118, icon: Palette, color: 'text-pink-400' },
  { name: 'AI Text Generators', count: 302, icon: FileText, color: 'text-cyan-400' },
];

export default function Categories() {
  return (
    <section className="relative w-full py-24 px-6 overflow-hidden">
      {/* Subtle Background Radial Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
              Categories
            </h2>
            <p className="text-neutral-400 max-w-md leading-relaxed">
              Browse a curated collection of <span className="text-white font-medium">2,461</span> specialized AI tools designed to augment your workflow.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="px-4 py-2 rounded-full border border-neutral-800 text-xs font-medium uppercase tracking-widest text-neutral-500">
              Updated Daily
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-neutral-800/50 border border-neutral-800 rounded-2xl overflow-hidden">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/ai-tools?category=${encodeURIComponent(category.name.split(' ')[0])}`}
                className="group relative bg-black p-8 transition-all duration-500 hover:bg-neutral-900/50"
              >
                {/* Arrow Icon - appears on hover */}
                <ArrowUpRight
                  className="absolute top-6 right-6 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-neutral-600"
                  size={18}
                />

                <div className="relative z-10">
                  <div className={`mb-6 inline-block transition-transform duration-500 group-hover:scale-110`}>
                    <Icon size={24} strokeWidth={1.5} className={category.color} />
                  </div>

                  <h3 className="text-base font-medium text-neutral-200 group-hover:text-white transition-colors">
                    {category.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-neutral-500">
                      {category.count.toLocaleString()} tools
                    </span>
                    <div className="h-px w-0 group-hover:w-8 transition-all duration-500 bg-neutral-700" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}