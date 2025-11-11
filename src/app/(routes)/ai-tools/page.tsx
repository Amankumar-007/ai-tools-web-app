'use client';
import React, { useState, useEffect, useMemo, JSX } from 'react';
import { 
  Search, Sparkles, Zap, Filter, X, 
  ChevronDown, ChevronUp, ExternalLink, 
  ArrowRight, Users, Star, Clock, Layers, 
  BarChart as BarChart2, MessageSquare, FileText, Code, 
  Mic, Music, Palette, BookOpen, FileCheck,
  MonitorPlay, LayoutGrid, List, SlidersHorizontal,
  Image as ImageIcon, Video, FileVideo, Headphones, Cpu, FileSearch,
  File, FileText as FileTextIcon, FileCode, Podcast, FileAudio, BarChart3,
  FileCog, FileInput, FileOutput, FileQuestion, FileSpreadsheet, FileType,
  FileVideo2, FileVolume2, FileX, Filter as FilterIcon, FolderSearch, Gauge,
  GitBranch, GitCommit, GitMerge, GitPullRequest, Gitlab, Globe, Grid, Hash,
  Headset, HelpCircle, Image, Inbox, Laptop, Layout, LifeBuoy, Link2, List as ListIcon,
  Loader, Lock, Mail, MapPin, Maximize2, Menu, MessageCircle, Mic2, Minimize2,
  Minus, Moon, MoreHorizontal, MoreVertical, MousePointer, Move, Music2, Paperclip,
  Pause, PauseCircle, Percent, Phone, PhoneCall, PhoneForwarded, PhoneIncoming,
  PhoneMissed, PhoneOff, PhoneOutgoing, PieChart, Play, PlayCircle, Plus,
  PlusCircle, Pocket, Power, Printer, Radio, RefreshCw, Repeat, RotateCcw,
  Save, Scissors, Search as SearchIcon, Send, Server, Settings, Share2, Shield,
  ShieldOff, ShoppingBag, ShoppingCart, Shuffle, Sidebar, SkipBack, SkipForward,
  Slash, Sliders, Smartphone, Speaker, Square, Star as StarIcon, StopCircle,
  Sun, Sunrise, Sunset, Tablet, Tag, Target, Terminal, Thermometer, ThumbsDown,
  ThumbsUp, ToggleLeft, ToggleRight, Trash2, TrendingDown, TrendingUp, Truck,
  Tv, Type, Umbrella, Underline, Unlock, Upload, User, UserCheck, UserMinus,
  UserPlus, UserX, Users as UsersIcon, Video as VideoIcon, VideoOff, Voicemail,
  Volume, Volume1, Volume2, VolumeX, Watch, Wifi, WifiOff, Wind, X as XIcon,
  XCircle, Zap as ZapIcon, ZoomIn, ZoomOut, type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Pricing = 'Free' | 'Freemium' | 'Paid' | 'All';

interface Tool {
  name: string;
  category: string;
  website: string;
  pricing: Pricing;
  description: string;
  features: string[];
  rating?: number;
  freeTier?: boolean;
  apiAvailable?: boolean;
  platforms?: string[];
  bestFor?: string[];
  learningCurve?: 'Beginner' | 'Intermediate' | 'Advanced';
}

const AIToolsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPricing, setSelectedPricing] = useState<typeof pricingOptions[number]>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/ai-tools.json');
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        const data: Tool[] = await response.json();
        setTools(data);
        
        // Extract and set unique categories
        const categories = Array.from(new Set(data.map(tool => tool.category)));
        setAvailableCategories(categories);
        
        // Initialize all categories as expanded
        const expanded: Record<string, boolean> = {};
        categories.forEach(cat => {
          expanded[cat] = true;
        });
        setExpandedCategories(expanded);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const pricingOptions = ['All', 'Free', 'Freemium', 'Paid'] as const;
  
  // Get all unique categories from tools
  const categories = useMemo(() => {
    return ['All', ...availableCategories.sort()];
  }, [availableCategories]);

  const filteredTools = useMemo(() => {
    if (!tools.length) return [];
    
    return tools.filter(tool => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
                          tool.name.toLowerCase().includes(searchLower) ||
                          tool.description.toLowerCase().includes(searchLower) ||
                          tool.category.toLowerCase().includes(searchLower) ||
                          (tool.features || []).some(f => f.toLowerCase().includes(searchLower));
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      
      // Pricing filter
      const matchesPricing = selectedPricing === 'All' || tool.pricing === selectedPricing;
      
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, searchTerm, selectedCategory, selectedPricing]);

  const groupedTools = useMemo(() => {
    const grouped: Record<string, Tool[]> = {};
    
    filteredTools.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });
    
    // Sort categories alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc: Record<string, Tool[]>, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [filteredTools]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    tools.forEach(tool => {
      stats[tool.category] = (stats[tool.category] || 0) + 1;
    });
    return stats;
  }, [tools]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getPricingColor = (pricing: Pricing) => {
    switch(pricing) {
      case 'Free': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Freemium': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Paid': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, JSX.Element> = {
      // Generic categories
      'AI Chat': <MessageSquare className="w-4 h-4" />,
      'AI Search': <SearchIcon className="w-4 h-4" />,
      'Image Generation': <Image className="w-4 h-4" />,
      'Video Generation': <VideoIcon className="w-4 h-4" />,
      'Content Writing': <FileTextIcon className="w-4 h-4" />,
      'Coding': <Code className="w-4 h-4" />,
      'Voice Generation': <Mic2 className="w-4 h-4" />,
      'Music Generation': <Music2 className="w-4 h-4" />,
      'Design': <Palette className="w-4 h-4" />,
      'Automation': <Zap className="w-4 h-4" />,
      'Productivity': <BarChart2 className="w-4 h-4" />,
      'Research': <BookOpen className="w-4 h-4" />,
      'Document Analysis': <FileTextIcon className="w-4 h-4" />,
      'Transcription': <FileTextIcon className="w-4 h-4" />,
      'Presentation': <MonitorPlay className="w-4 h-4" />,
      'SEO': <BarChart2 className="w-4 h-4" />,
      'Podcast/Video': <Podcast className="w-4 h-4" />,
      'No-Code Development': <Cpu className="w-4 h-4" />,
      'Content Analysis': <FileSearch className="w-4 h-4" />,
      'Image/Video Generation': <Image className="w-4 h-4" />,
      'Video Creation': <VideoIcon className="w-4 h-4" />,
      'Interactive Content': <Layout className="w-4 h-4" />,
      'Enterprise AI': <Server className="w-4 h-4" />,
      'SEO Tools': <BarChart3 className="w-4 h-4" />,
      'Text Analytics': <FileTextIcon className="w-4 h-4" />,
      'Meeting AI': <VideoIcon className="w-4 h-4" />
    };

    return iconMap[category] || <Layers className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedPricing('All');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedPricing !== 'All' || searchTerm !== '';

  if (loading) {
    return (
      <div className="min-h-[70%] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading AI Tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70%] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Tools</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Make sure ai-tools.json is in /public/data/</p>
        </div>
      </div>
    );
  }

  const toggleToolSelection = (tool: Tool) => {
    setSelectedTools(prev => {
      const isSelected = prev.some(t => t.name === tool.name);
      if (isSelected) {
        return prev.filter(t => t.name !== tool.name);
      } else if (prev.length < 4) {
        return [...prev, tool];
      }
      return prev;
    });
  };

  const clearComparison = () => {
    setSelectedTools([]);
    setCompareMode(false);
  };

  // Tool Card Component
  const ToolCard = ({ tool }: { tool: Tool }) => {
    const isSelected = selectedTools.some(t => t.name === tool.name);
    
    return (
    <motion.div 
      className={`group cursor-pointer h-full relative ${isSelected ? 'ring-2 ring-purple-500 rounded-xl' : ''}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={() => compareMode && toggleToolSelection(tool)}
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100">
        {/* Card Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${getPricingColor(tool.pricing)}`}>
                  {getCategoryIcon(tool.category)}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(tool.pricing)}`}>
                  {tool.pricing}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {tool.category}
              </p>
            </div>
            <a 
              href={tool.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-purple-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="px-5 pb-4 flex-1">
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {tool.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Top Features:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tool.features.slice(0, 3).map((feature, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100"
                >
                  {feature}
                </span>
              ))}
              {tool.features.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded-md border border-gray-100">
                  +{tool.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between group-hover:text-purple-600 text-sm font-medium text-gray-700 transition-colors"
          >
            <span>Visit Website</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        {compareMode && (
          <div className="absolute top-2 right-2">
            <button 
              className={`p-2 rounded-full ${isSelected ? 'bg-purple-100 text-purple-600' : 'bg-white/80 text-gray-400 hover:bg-gray-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleToolSelection(tool);
              }}
            >
              {isSelected ? (
                <div className="w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full">
                  <span className="text-xs font-medium">{selectedTools.findIndex(t => t.name === tool.name) + 1}</span>
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )};

  // List View Item Component
  const ListItem = ({ tool }: { tool: Tool }) => (
    <motion.div 
      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
      whileHover={{ x: 5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          {getCategoryIcon(tool.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {tool.name}
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 ${getPricingColor(tool.pricing)}`}>
              {tool.pricing}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{tool.category}</p>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tool.features.slice(0, 3).map((feature, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 md:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          Visit
        </a>
      </div>
    </motion.div>
  );

  // Comparison Modal
  const ComparisonModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold">Compare Tools ({selectedTools.length}/4)</h3>
          <div className="flex gap-2">
            <button 
              onClick={clearComparison}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={clearComparison}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {selectedTools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                    {selectedTools.map(tool => (
                      <th key={tool.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tool.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Website</td>
                    {selectedTools.map(tool => (
                      <td key={`${tool.name}-website`} className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a href={tool.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Site
                        </a>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Category</td>
                    {selectedTools.map(tool => (
                      <td key={`${tool.name}-category`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tool.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pricing</td>
                    {selectedTools.map(tool => (
                      <td key={`${tool.name}-pricing`} className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPricingColor(tool.pricing)}`}>
                          {tool.pricing}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Description</td>
                    {selectedTools.map(tool => (
                      <td key={`${tool.name}-desc`} className="px-6 py-4 text-sm text-gray-500">
                        {tool.description}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Key Features</td>
                    {selectedTools.map(tool => (
                      <td key={`${tool.name}-features`} className="px-6 py-4">
                        <ul className="list-disc pl-5 space-y-1">
                          {tool.features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="text-sm text-gray-600">{feature}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select up to 4 tools to compare</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[70%] bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative">
      {showCompareModal && <ComparisonModal />}
    

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-6 max-w-4xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{tools.length}+ AI Tools & Counting</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Discover & Compare the
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mt-2">
                Best AI Tools
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed"
            >
              Find the perfect AI solution for your needs. Our curated collection is constantly updated with the latest tools for developers, designers, and businesses.
            </motion.p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mt-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2">
                  <Search className="w-6 h-6 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="Search AI tools, features, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-4 text-lg text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition mr-2"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-xl font-medium transition-all ${
                      showFilters 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </div>

      {/* Filters Panel */}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-900 placeholder-gray-500 sm:text-sm"
                placeholder="Search AI tools by name, category, or feature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedTools.length > 0) {
                    setShowCompareModal(true);
                  } else {
                    setCompareMode(!compareMode);
                  }
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  compareMode || selectedTools.length > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                {compareMode ? 'Comparing...' : selectedTools.length > 0 ? `Compare (${selectedTools.length})` : 'Compare Tools'}
              </button>
              
              {compareMode && (
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <div className="hidden md:flex items-center bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2 text-gray-500" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                      {Object.values({
                        ...(selectedCategory !== 'All' && { category: 1 }),
                        ...(selectedPricing !== 'All' && { pricing: 1 }),
                        ...(searchTerm && { search: 1 })
                      }).length}
                    </span>
                  )}
                </button>
                
                {/* Filter Dropdown */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                          <button 
                            onClick={() => setShowFilters(false)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <div key={category} className="flex items-center">
                                <input
                                  id={`category-${category}`}
                                  type="radio"
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                  checked={selectedCategory === category}
                                  onChange={() => setSelectedCategory(category)}
                                />
                                <label 
                                  htmlFor={`category-${category}`}
                                  className="ml-3 text-sm text-gray-700 flex items-center justify-between w-full"
                                >
                                  <span>{category}</span>
                                  {category !== 'All' && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                      {categoryStats[category] || 0}
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {pricingOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => setSelectedPricing(option === selectedPricing ? 'All' : option)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg text-center border transition-colors ${
                                  option === selectedPricing
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                        <button
                          onClick={clearFilters}
                          className="text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                          Reset filters
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory('All')}
                      className="ml-1.5 -mr-1 inline-flex items-center justify-center rounded-full p-0.5 text-purple-400 hover:bg-purple-200 hover:text-purple-600 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPricing !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedPricing}
                    <button 
                      onClick={() => setSelectedPricing('All')}
                      className="ml-1.5 -mr-1 inline-flex items-center justify-center rounded-full p-0.5 text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Search: "{searchTerm}"
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 -mr-1 inline-flex items-center justify-center rounded-full p-0.5 text-green-400 hover:bg-green-200 hover:text-green-600 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-1 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredTools.map((tool, index) => (
                <ToolCard key={`${tool.name}-${index}`} tool={tool} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredTools.map((tool, index) => (
                <ListItem key={`${tool.name}-${index}`} tool={tool} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty State */}
        {filteredTools.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4">
              <Search className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any AI tools matching your search. Try adjusting your filters or search query.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {filteredTools.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                <X className="w-5 h-5" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-20 mt-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0dGVybiBpZD0icGF0dGVybi1iYXNlIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiPjwvcmVjdD48cGF0aCBkPSJNMzAgMTVMMTUgMzBNNDUgMTVMMzAgMzBNMzAgMzBMNDUgNDVNMTUgMTVMMzAgME0xNSQ1TDAgMjBNMzAgMEwxNSA1TTMwIDBMMzAgMTVNMTUgNDVMMCAzME0xNSA0NUwzMCA2ME0xNSA0NUwzMCAzME0zMCA2MEw0NSA0NU0zMCA2MFY0NU0zMCA2MEwxNSA0NU0zMCA2MEw0NSA0NU0zIDI4TDE1IDQ1TTE1IDQ1TDI4IDI4TTE1IDQ1VjMxTTE1IDQ1TDI4IDU4TTE1IDQ1TDIgNTgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvcGF0aD48L3BhdHRlcm4+PC9zdmc+')]"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Transform Your Workflow?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Discover the perfect AI tools to boost your productivity and creativity today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Explore All Tools
            </button>
            <a
              href="#submit-tool"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Submit Your Tool
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  AI Tools Hub
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Discover and compare the best AI tools to boost your productivity, creativity, and business growth.
                Our curated collection is updated regularly to bring you the latest innovations in artificial intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Categories</h3>
              <ul className="mt-4 space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <li key={category}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(category);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#submit-tool" className="text-sm text-gray-400 hover:text-white transition-colors">Submit a Tool</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} AI Tools Hub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIToolsDirectory;