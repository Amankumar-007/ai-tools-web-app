'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeTextWithGemini, generateContent, analyzeText } from '@/lib/gemini';
import Logo from '@/components/Logo';

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

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'optimize', label: 'Text Optimizer', icon: '✨' },
    { id: 'generate', label: 'Content Generator', icon: '🚀' },
    { id: 'analyze', label: 'Content Analyzer', icon: '🔍' }
  ];

  const contentTypes: { value: ContentType; label: string; color: string }[] = [
    { value: 'blog', label: 'Blog Post', color: 'bg-orange-500' },
    { value: 'social', label: 'Social Media', color: 'bg-orange-400' },
    { value: 'email', label: 'Email', color: 'bg-orange-600' },
    { value: 'marketing', label: 'Marketing', color: 'bg-orange-700' }
  ];

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
        response = await optimizeTextWithGemini(inputText) as OptimizeResult;
      } else if (activeTab === 'generate') {
        response = await generateContent(inputText, contentType) as string;
      } else if (activeTab === 'analyze') {
        response = await analyzeText(inputText) as AnalyzeResult;
      } else {
        response = '';
      }
      
      setResult(response);
    } catch (err) {
      setError('Something went wrong. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <Logo />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-4"
            animate={{ 
              backgroundPosition: ['0%', '100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            Outlier AI
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-700 max-w-2xl mx-auto"
          >
            Transform your content with cutting-edge AI powered by Google&apos;s Gemini Flash
          </motion.p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-2 border border-orange-200 shadow-lg">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                  setError('');
                }}
                className={`px-6 py-3 rounded-xl mx-1 flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Type Selector for Generate Tab */}
        <AnimatePresence>
          {activeTab === 'generate' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <div className="flex gap-2">
                {contentTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => setContentType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      contentType === type.value
                        ? `${type.color} text-white shadow-lg`
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

        {/* Main Content */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-orange-200 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">
                  {activeTab === 'optimize' ? '📝' : activeTab === 'generate' ? '✍️' : '📊'}
                </span>
                {activeTab === 'optimize' ? 'Input Text' : 
                 activeTab === 'generate' ? 'Content Prompt' : 'Text to Analyze'}
              </h3>
              <motion.span 
                className="text-sm text-orange-600 font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {inputText.length} characters
              </motion.span>
            </div>
            
            <motion.textarea
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
              className="w-full h-64 bg-white border-2 border-orange-200 rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 resize-none"
              whileFocus={{ scale: 1.02 }}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-red-600"
              >
                {error}
              </motion.div>
            )}
            
            <motion.button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`mt-6 w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                loading || !inputText.trim()
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </div>
              ) : (
                `${activeTab === 'optimize' ? 'Optimize' : 
                   activeTab === 'generate' ? 'Generate' : 'Analyze'} Text`
              )}
            </motion.button>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-orange-200 shadow-xl"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Results
              </h3>
              
              {!result && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex items-center justify-center text-gray-400"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🤖
                    </motion.div>
                    <p>Your AI-powered results will appear here</p>
                  </div>
                </motion.div>
              )}

              {/* Optimization Results */}
              {result && activeTab === 'optimize' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-orange-600">Improved Version</h4>
                      <motion.button
                        onClick={() => copyToClipboard((result as OptimizeResult).improved)}
                        className="text-gray-500 hover:text-orange-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        📋
                      </motion.button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{(result as OptimizeResult).improved}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">What Was Improved</h4>
                    <p className="text-gray-700">{(result as OptimizeResult).explanation}</p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-orange-700 mb-2">💡 Pro Tip</h4>
                    <p className="text-gray-700">{(result as OptimizeResult).tip}</p>
                  </div>

                  {Boolean((result as OptimizeResult)?.analysis) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(result as OptimizeResult).analysis?.readabilityScore}%
                        </div>
                        <div className="text-sm text-gray-600">Readability Score</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-2">Key Changes</div>
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
                  className="bg-orange-50 border border-orange-200 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-orange-600">Generated Content</h4>
                    <motion.button
                      onClick={() => copyToClipboard(typeof result === 'string' ? result : '')}
                      className="text-gray-500 hover:text-orange-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      📋
                    </motion.button>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {typeof result === 'string' ? result : ''}
                  </div>
                </motion.div>
              )}

              {/* Analysis Results */}
              {result && activeTab === 'analyze' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {(result as AnalyzeResult).sentiment || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Sentiment</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-green-600">
                        {(result as AnalyzeResult).wordCount || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Words</div>
                    </div>
                  </div>

                  {(result as AnalyzeResult).keyTopics && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-600 mb-2">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {(result as AnalyzeResult).keyTopics!.map((topic: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-200 rounded-full text-sm text-orange-700"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(result as AnalyzeResult).suggestions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-700 mb-2">Suggestions</h4>
                      <ul className="space-y-1 text-gray-700 text-sm">
                        {(result as AnalyzeResult).suggestions!.map((suggestion: string, idx: number) => (
                          <li key={idx}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-12 text-gray-600"
        >
          <p className="font-medium">Powered by Google Gemini Flash • Built with Next.js & Framer Motion by Aman Kumar</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OutlierAI;