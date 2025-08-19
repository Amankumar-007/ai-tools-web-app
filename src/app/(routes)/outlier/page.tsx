'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'optimize' | 'generate' | 'analyze';
type ContentType = 'blog' | 'social' | 'email' | 'marketing';
type OptimizeResult = {
  improved: string;
  explanation?: string;
  tip?: string;
  analysis?: {
    readabilityScore?: number;
    keyChanges?: string[];
  };
};
type AnalyzeResult = {
  sentiment?: string;
  wordCount?: number;
  keyTopics?: string[];
  suggestions?: string[];
};

const OutlierAI = () => {
  const [activeTab, setActiveTab] = useState<TabId>('optimize');
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<OptimizeResult | AnalyzeResult | string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [contentType, setContentType] = useState<ContentType>('blog');

  const tabs: { id: TabId; label: string; icon: string; shortLabel: string }[] = [
    { id: 'optimize', label: 'Text Optimizer', icon: '✨', shortLabel: 'Optimize' },
    { id: 'generate', label: 'Content Generator', icon: '🚀', shortLabel: 'Generate' },
    { id: 'analyze', label: 'Content Analyzer', icon: '🔍', shortLabel: 'Analyze' }
  ];

  const contentTypes: { value: ContentType; label: string; color: string }[] = [
    { value: 'blog', label: 'Blog', color: 'bg-orange-500' },
    { value: 'social', label: 'Social', color: 'bg-orange-400' },
    { value: 'email', label: 'Email', color: 'bg-orange-600' },
    { value: 'marketing', label: 'Marketing', color: 'bg-orange-700' }
  ];

  // Mock API functions for demo
  const mockOptimizeText = async (text: string): Promise<OptimizeResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      improved: text.charAt(0).toUpperCase() + text.slice(1) + " This text has been optimized for clarity and engagement.",
      explanation: "Improved sentence structure, added engaging elements, and enhanced readability.",
      tip: "Consider using active voice and shorter sentences for better impact.",
      analysis: {
        readabilityScore: 85,
        keyChanges: ["Clarity", "Engagement", "Structure"]
      }
    };
  };

  const mockGenerateContent = async (prompt: string, type: ContentType): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Generated ${type} content based on: "${prompt}"\n\nThis is a sample generated content that would be created by the AI based on your prompt. It includes relevant information, engaging tone, and proper formatting suitable for ${type} purposes.`;
  };

  const mockAnalyzeText = async (text: string): Promise<AnalyzeResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      sentiment: "Positive",
      wordCount: text.split(' ').length,
      keyTopics: ["Technology", "Innovation", "Content"],
      suggestions: [
        "Add more specific examples",
        "Include call-to-action",
        "Consider shorter paragraphs"
      ]
    };
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let response: OptimizeResult | AnalyzeResult | string = '';
      
      if (activeTab === 'optimize') {
        response = await mockOptimizeText(inputText) as OptimizeResult;
      } else if (activeTab === 'generate') {
        response = await mockGenerateContent(inputText, contentType) as string;
      } else if (activeTab === 'analyze') {
        response = await mockAnalyzeText(inputText) as AnalyzeResult;
      }
      
      setResult(response);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
            Outlier AI
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-xl mx-auto px-4">
            Transform your content with AI powered by Google Gemini Flash
          </p>
        </div>

        {/* Responsive Tab Navigation */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-orange-200 shadow-md">
            <div className="flex">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResult(null);
                    setError('');
                  }}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl mx-0.5 sm:mx-1 flex items-center gap-1 sm:gap-2 transition-all duration-300 text-xs sm:text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Type Selector for Generate Tab */}
        <AnimatePresence>
          {activeTab === 'generate' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                {contentTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => setContentType(type.value)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
                      contentType === type.value
                        ? `${type.color} text-white shadow-md`
                        : 'bg-white border border-orange-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content - Responsive Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-200 shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-lg sm:text-xl">
                  {activeTab === 'optimize' ? '📝' : activeTab === 'generate' ? '✍️' : '📊'}
                </span>
                <span className="hidden sm:inline">
                  {activeTab === 'optimize' ? 'Input Text' : 
                   activeTab === 'generate' ? 'Content Prompt' : 'Text to Analyze'}
                </span>
                <span className="sm:hidden">
                  {activeTab === 'optimize' ? 'Input' : 
                   activeTab === 'generate' ? 'Prompt' : 'Analyze'}
                </span>
              </h3>
              <span className="text-xs sm:text-sm text-orange-600 font-medium">
                {inputText.length}
              </span>
            </div>
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeTab === 'optimize' 
                  ? "Paste your text here to optimize it..." 
                  : activeTab === 'generate'
                  ? "Describe what content you want to generate..."
                  : "Paste text here to analyze..."
              }
              className="w-full h-32 sm:h-40 lg:h-48 bg-white border-2 border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-300 resize-none"
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50 border border-red-300 rounded-xl text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}
            
            <motion.button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`mt-4 w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                loading || !inputText.trim()
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </div>
              ) : (
                `${activeTab === 'optimize' ? 'Optimize' : 
                   activeTab === 'generate' ? 'Generate' : 'Analyze'} Text`
              )}
            </motion.button>
          </div>

          {/* Results Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-200 shadow-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl">✨</span>
              Results
            </h3>
            
            <div className="max-h-80 sm:max-h-96 lg:max-h-[500px] overflow-y-auto">
              {!result && !loading && (
                <div className="h-32 sm:h-40 lg:h-48 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl lg:text-6xl mb-2 sm:mb-4">🤖</div>
                    <p className="text-xs sm:text-sm">Your AI-powered results will appear here</p>
                  </div>
                </div>
              )}

              {/* Optimization Results */}
              {result && activeTab === 'optimize' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-orange-600 text-sm sm:text-base">Improved Version</h4>
                      <motion.button
                        onClick={() => copyToClipboard((result as OptimizeResult).improved)}
                        className="text-gray-500 hover:text-orange-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        📋
                      </motion.button>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">{(result as OptimizeResult).improved}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-600 mb-2 text-sm sm:text-base">What Was Improved</h4>
                    <p className="text-gray-700 text-xs sm:text-sm">{(result as OptimizeResult).explanation}</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-orange-700 mb-2 text-sm sm:text-base">💡 Pro Tip</h4>
                    <p className="text-gray-700 text-xs sm:text-sm">{(result as OptimizeResult).tip}</p>
                  </div>

                  {Boolean((result as OptimizeResult)?.analysis) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          {(result as OptimizeResult).analysis?.readabilityScore}%
                        </div>
                        <div className="text-xs text-gray-600">Readability</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <div className="text-xs text-gray-600 mb-2">Key Changes</div>
                        <div className="flex flex-wrap gap-1">
                          {(result as OptimizeResult).analysis?.keyChanges?.map((change: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-orange-200 rounded text-xs text-orange-700"
                            >
                              {change}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Generation Results */}
              {result && activeTab === 'generate' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-orange-600 text-sm sm:text-base">Generated Content</h4>
                    <motion.button
                      onClick={() => copyToClipboard(typeof result === 'string' ? result : '')}
                      className="text-gray-500 hover:text-orange-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      📋
                    </motion.button>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                    {typeof result === 'string' ? result : ''}
                  </div>
                </motion.div>
              )}

              {/* Analysis Results */}
              {result && activeTab === 'analyze' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <div className="text-base sm:text-lg font-bold text-blue-600">
                        {(result as AnalyzeResult).sentiment || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Sentiment</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <div className="text-base sm:text-lg font-bold text-green-600">
                        {(result as AnalyzeResult).wordCount || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Words</div>
                    </div>
                  </div>

                  {(result as AnalyzeResult).keyTopics && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                      <h4 className="font-semibold text-orange-600 mb-2 text-sm">Key Topics</h4>
                      <div className="flex flex-wrap gap-1">
                        {(result as AnalyzeResult).keyTopics!.map((topic: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-200 rounded-full text-xs text-orange-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(result as AnalyzeResult).suggestions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <h4 className="font-semibold text-yellow-700 mb-2 text-sm">Suggestions</h4>
                      <ul className="space-y-1 text-gray-700 text-xs">
                        {(result as AnalyzeResult).suggestions!.map((suggestion: string, idx: number) => (
                          <li key={idx}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="text-center mt-6 sm:mt-8 text-gray-600">
          <p className="text-xs sm:text-sm">Powered by Google Gemini Flash • Built with Next.js & Framer Motion</p>
        </div>
      </div>
    </div>
  );
};

export default OutlierAI;