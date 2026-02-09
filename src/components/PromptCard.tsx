// components/PromptCard.tsx
"use client";
import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  category: string;
  author: string;
  description: string;
  content: string;
}

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-full border border-yellow-500/20">
          {prompt.category}
        </span>
        <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
        </button>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {prompt.title}
      </h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        {prompt.description}
      </p>
      
      <div className="text-xs text-gray-500 mb-4 italic">
        by <span className="text-gray-300">@{prompt.author}</span>
      </div>

      <div className="relative bg-black/40 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="bg-yellow-500 text-black px-2 py-1 rounded text-[10px] font-bold">PROMPT</span>
        </div>
        <p className="line-clamp-3 leading-relaxed">
          {prompt.content}
        </p>
      </div>
    </div>
  );
}