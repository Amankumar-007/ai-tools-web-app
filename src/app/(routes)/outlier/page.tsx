'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeTextWithGemini, generateContent, analyzeText } from '@/lib/gemini';

const OutlierAI = () => {
  const [activeTab, setActiveTab] = useState('optimize');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const [contentType, setContentType] = useState('blog');

  const tabs = [
    { id: 'optimize', label: 'Text Optimizer', icon: '✨' },
    { id: 'generate', label: 'Content Generator', icon: '🚀' },
    { id: 'analyze', label: 'Content Analyzer', icon: '🔍' }
  ];

  const contentTypes = [
    { value: 'blog', label: 'Blog Post', color: 'bg-blue-500' },
    { value: 'social', label: 'Social Media', color: 'bg-pink-500' },
    { value: 'email', label: 'Email', color: 'bg-green-500' },
    { value: 'marketing', label: 'Marketing', color: 'bg-purple-500' }
  ];

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (activeTab === 'optimize') {
        response = await optimizeTextWithGemini(inputText);
      } else if (activeTab === 'generate') {
        response = await generateContent(inputText, contentType);
      } else if (activeTab === 'analyze') {
        response = await analyzeText(inputText);
      }
      
      setResult(response);
    } catch (err) {
      setError('Something went wrong. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
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
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Transform your content with cutting-edge AI powered by Google's Gemini Flash
          </motion.p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-2 border border-slate-700/50">
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
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
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
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
            className="bg-slate-800/30 backdrop-blur-lg rounded-3xl p-6 border border-slate-700/50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">
                  {activeTab === 'optimize' ? '📝' : activeTab === 'generate' ? '✍️' : '📊'}
                </span>
                {activeTab === 'optimize' ? 'Input Text' : 
                 activeTab === 'generate' ? 'Content Prompt' : 'Text to Analyze'}
              </h3>
              <motion.span 
                className="text-sm text-gray-400"
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
              className="w-full h-64 bg-slate-900/50 border border-slate-600/50 rounded-2xl p-4 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
              whileFocus={{ scale: 1.02 }}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300"
              >
                {error}
              </motion.div>
            )}
            
            <motion.button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`mt-6 w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                loading || !inputText.trim()
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
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
              className="bg-slate-800/30 backdrop-blur-lg rounded-3xl p-6 border border-slate-700/50"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
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
                  <div className="bg-slate-900/50 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-green-400">Improved Version</h4>
                      <motion.button
                        onClick={() => copyToClipboard(result.improved)}
                        className="text-gray-400 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        📋
                      </motion.button>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{result.improved}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">What Was Improved</h4>
                    <p className="text-gray-300">{result.explanation}</p>
                  </div>

                  <div className="bg-slate-900/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">💡 Pro Tip</h4>
                    <p className="text-gray-300">{result.tip}</p>
                  </div>

                  {result.analysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {result.analysis.readabilityScore}%
                        </div>
                        <div className="text-sm text-gray-400">Readability Score</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <div className="text-sm text-gray-400 mb-2">Key Changes</div>
                        <div className="flex flex-wrap gap-1">
                          {result.analysis.keyChanges?.map((change, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300"
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
                  className="bg-slate-900/50 rounded-2xl p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-green-400">Generated Content</h4>
                    <motion.button
                      onClick={() => copyToClipboard(result)}
                      className="text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      📋
                    </motion.button>
                  </div>
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {result}
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
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {result.sentiment || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">Sentiment</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {result.wordCount || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">Words</div>
                    </div>
                  </div>

                  {result.keyTopics && (
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.keyTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions && (
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">Suggestions</h4>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        {result.suggestions.map((suggestion, idx) => (
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
          className="text-center mt-12 text-gray-400"
        >
          <p>Powered by Google Gemini Flash • Built with Next.js & Framer Motion BY Aman Kumar</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OutlierAI;