'use client';

import React, { useState } from 'react';
import { ExternalLink, Heart, Sparkles, ArrowUpRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Tool {
  id: string;
  name: string;
  category: string;
  website: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  description: string;
  features: string[];
  rating?: number;
  popular?: boolean;
  logo?: string;
}

const getPricingColor = (pricing: string) => {
  switch (pricing) {
    case 'Free': return 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200';
    case 'Freemium': return 'from-blue-50 to-blue-100 text-blue-700 border-blue-200';
    case 'Paid': return 'from-slate-50 to-slate-100 text-slate-700 border-slate-200';
    default: return 'from-gray-50 to-gray-100 text-gray-700 border-gray-200';
  }
};

export const ToolCard = ({ tool }: { tool: Tool }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden"
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getPricingColor(tool.pricing)} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
              {tool.logo ? (
                <img 
                  src={tool.logo} 
                  alt={`${tool.name} logo`} 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to Sparkles icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Sparkles className={`h-5 w-5 text-purple-500 ${tool.logo ? 'hidden' : ''}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{tool.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm">
                  {tool.category}
                </span>
                {tool.popular && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'}`}
            aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
              strokeWidth={isLiked ? 0 : 1.5} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-slate-600 mb-5 leading-relaxed line-clamp-3">
          {tool.description}
        </p>

        {/* Features */}
        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.features.slice(0, 4).map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-purple-50 group-hover:border-purple-100 group-hover:text-purple-700 transition-colors"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Rating */}
          {tool.rating && (
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= Math.round(tool.rating!) ? 'fill-current' : 'text-slate-200'}`} 
                  strokeWidth={0}
                />
              ))}
              <span className="ml-1 text-xs font-medium text-slate-500">
                {tool.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getPricingColor(tool.pricing).replace('border-\w+-\d+', '')} border`}>
                {tool.pricing}
              </span>
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group/button inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors"
              >
                Visit Website
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export const ToolCardSkeleton = () => (
  <div className="flex flex-col h-full rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
    <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="pt-4 mt-4 border-t border-slate-100">
        <div className="h-8 bg-slate-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);