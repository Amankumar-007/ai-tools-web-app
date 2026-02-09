"use client";

import React, { useState, useEffect } from 'react';
import { Search, Share2, Mail, Linkedin, Twitter, Facebook, PlayCircle, X } from 'lucide-react';

// --- DATA: Categories & Websites for Favicons ---
const categories = [
  { id: 'all', name: 'All', website: null },
  { id: 'chatgpt', name: 'ChatGPT', website: 'openai.com' },
  { id: 'midjourney', name: 'Midjourney', website: 'midjourney.com' },
  { id: 'stablediffusion', name: 'Stable Diffusion', website: 'stability.ai' },
  { id: 'elevenlabs', name: 'ElevenLabs', website: 'elevenlabs.io' },
  { id: 'claude', name: 'Claude AI', website: 'anthropic.com' },
  { id: 'gemini', name: 'Gemini AI', website: 'deepmind.google' },
  { id: 'runway', name: 'Runway ML', website: 'runwayml.com' },
  { id: 'heygen', name: 'HeyGen AI', website: 'heygen.com' },
  { id: 'hubspot', name: 'HubSpot', website: 'hubspot.com' },
  { id: 'perplexity', name: 'Perplexity AI', website: 'perplexity.ai' },
  { id: 'notion', name: 'Notion AI', website: 'notion.so' },
  { id: 'copilot', name: 'Microsoft Copilot', website: 'microsoft.com' },
  { id: 'canva', name: 'Canva AI', website: 'canva.com' },
  { id: 'adobe', name: 'Adobe Firefly', website: 'firefly.adobe.com' },
  { id: 'suno', name: 'Suno AI', website: 'suno.com' },
];

// --- DATA: Real YouTube Videos ---
const videos = [
  { id: 1, title: 'ChatGPT Full Course 2026 | Beginner to Pro', author: 'Simplilearn', category: 'chatgpt', videoId: 'J_QQ9rCLwSM' },
  { id: 2, title: 'Advanced Midjourney V6 Guide - Styles & Parameters', author: 'Sam W.', category: 'midjourney', videoId: 'tur9h4y1IPs' },
  { id: 3, title: 'Stable Diffusion 3 Tutorial for Beginners', author: 'AI Art Tech', category: 'stablediffusion', videoId: '3l16w8P-zJ4' },
  { id: 4, title: 'ElevenLabs Tutorial 2025 (Full Guide)', author: 'Impekable', category: 'elevenlabs', videoId: 'YqS-3QpOmns' },
  { id: 5, title: 'Claude 3 API Crash Course for Beginners', author: 'Leon van Zyl', category: 'claude', videoId: 'lelQhH8J_x4' },
  { id: 6, title: 'Master Gemini 3.0 for Work in 12 Minutes', author: 'Jeff Su', category: 'gemini', videoId: 'bTLmt9BKGVc' },
  { id: 7, title: 'Runway Gen-2 & Gen-3 Full Tutorial', author: 'Runway Research', category: 'runway', videoId: 'qg64j6jF2_g' },
  { id: 8, title: 'HeyGen Tutorial - How to Create AI Videos', author: 'Minn Media', category: 'heygen', videoId: 'Z833UyIqYWQ' },
  { id: 9, title: 'HubSpot Workflows with AI (2025)', author: 'HubSpot Fans', category: 'hubspot', videoId: 'yf7G1Uloqj0' },
  { id: 10, title: 'How to Use Perplexity AI: The Search AI', author: 'Kevin Stratvert', category: 'perplexity', videoId: 'bOHfJZ4DVqE' },
  { id: 11, title: 'Notion AI Tutorial: Is It Really Worth It?', author: 'David DeWinter', category: 'notion', videoId: 'SnbMRRZ2_Ag' },
  { id: 12, title: 'Microsoft 365 Copilot Tutorial for Beginners', author: 'Tech Solutions', category: 'copilot', videoId: '6nwIKjYRtgg' },
  { id: 13, title: 'How to Use Canva AI & Magic Studio', author: 'Brenda Cadman', category: 'canva', videoId: '6EIf2Hmia60' },
  { id: 14, title: 'Adobe Firefly Tutorial 2026: Beginner Guide', author: 'Better Creator', category: 'adobe', videoId: 'Gni6gzKrXzY' },
  { id: 15, title: 'Suno AI Tutorial 2026 (For Beginners)', author: 'Chill Panic', category: 'suno', videoId: '72R1NjNaUnE' },
];

export default function AITutorialsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Filter Logic
  const filteredVideos = videos.filter((video) => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideoId(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-700">

      {/* 1. HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="bg-[#E84E1B] text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm tracking-wide">
            AI Tutorials Hub
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-gray-400">
              <Twitter size={20} className="hover:text-black cursor-pointer transition-colors" />
              <Facebook size={20} className="hover:text-blue-600 cursor-pointer transition-colors" />
              <Linkedin size={20} className="hover:text-blue-700 cursor-pointer transition-colors" />
              <Share2 size={20} className="hover:text-blue-400 cursor-pointer transition-colors" />
              <Mail size={20} className="hover:text-red-500 cursor-pointer transition-colors" />
            </div>
            <div className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'tutorial' : 'tutorials'}
            </div>
          </div>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative w-full max-w-4xl mx-auto mb-10">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search for an AI tool or tutorial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 px-12 rounded-full bg-white border border-gray-200 shadow-sm text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
          </div>
        </div>

        {/* 3. FILTERS (DYNAMIC LOGOS) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200
                ${activeCategory === cat.id
                  ? 'bg-[#E84E1B] border-[#E84E1B] text-white shadow-md scale-105'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:scale-105'
                }
              `}
            >
              {cat.website && (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${cat.website}&sz=64`}
                  alt={`${cat.name} logo`}
                  className="w-5 h-5 object-contain rounded-sm"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              {cat.name}
            </button>
          ))}
        </div>

        {/* 4. VIDEO GRID */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                // Changed from <a> to <div> with onClick
                onClick={() => setSelectedVideoId(video.videoId)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                      <PlayCircle className="text-white drop-shadow-md" size={48} fill="currentColor" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#E84E1B] bg-[#E84E1B]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {categories.find(c => c.id === video.category)?.name}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">Play Video</span>
                  </div>

                  <h3 className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2 group-hover:text-[#E84E1B] transition-colors">
                    {video.title}
                  </h3>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {video.author.charAt(0)}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{video.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-gray-300 mb-4">
              <Search size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No tutorials found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              We couldn't find any videos for "{searchQuery}" in the selected category.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-6 text-[#E84E1B] font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* --- VIDEO MODAL --- */}
      {selectedVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideoId(null)} // Close on backdrop click
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent close when clicking inside modal
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideoId(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>

            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}