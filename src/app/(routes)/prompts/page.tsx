// app/prompts/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import PromptCard from '@/components/PromptCard';

interface Prompt {
  id: string;
  title: string;
  category: string;
  author: string;
  description: string;
  content: string;
}

export default function PromptList() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/nano-banana.json');
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  // Extract unique categories from the data
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(prompts.map(prompt => prompt.category)));
    return ["All", ...uniqueCategories.sort()];
  }, [prompts]);

  // Filter prompts based on selected category
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "All") return prompts;
    return prompts.filter(prompt => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 selection:bg-yellow-500/30">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Nano Banana Prompts
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A curated directory of {prompts.length} high-quality image generation prompts for Gemini 3 and Nano models.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm font-semibold ${
                selectedCategory === cat
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "border border-white/10 bg-white/5 hover:bg-yellow-500 hover:text-black hover:border-yellow-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-20 mb-4"></div>
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-full mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Grid Layout */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrompts.map((item) => (
              <PromptCard key={item.id} prompt={item} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredPrompts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No prompts found in the "{selectedCategory}" category.</p>
          </div>
        )}
      </main>
    </div>
  );
}