'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { FiZap } from 'react-icons/fi';
import { Tool } from '@/types/ai-tools';

interface AISearchProps {
  tools: Tool[];
  onSearchResults: (results: Tool[]) => void;
  onReset: () => void;
}

export function AISearch({ tools, onSearchResults, onReset }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      onReset();
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        await handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      onReset();
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          tools,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      onSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to local search if API fails
      const results = tools.filter(tool => 
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.category.toLowerCase().includes(query.toLowerCase())
      );
      onSearchResults(results);
    } finally {
      setIsSearching(false);
      setIsTyping(false);
    }
  }, [query, tools, onSearchResults, onReset]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Search AI tools by name, category, or description..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsTyping(true);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onReset();
            }}
            className="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className={`absolute inset-y-0 right-0 px-4 flex items-center rounded-r-lg ${
            query.trim()
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          <FiZap className="h-5 w-5" />
        </button>
      </div>
      
      <AnimatePresence>
        {(isSearching || isTyping) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center"
          >
            {isSearching ? 'Searching for AI tools...' : 'Typing...'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
