'use client';
import React, { useState, useRef, useEffect } from 'react';
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

  return (
    <div className="relative min-h-screen p-2 sm:p-4 lg:p-6">
      {/* Fixed blurred background (light/dark) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: "url('/generated-image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: "url(" + "'/generated-image (1).png'" + ")",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(2px)',
          transform: 'scale(1.03)'
        }}
      />
      <Logo />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-2 sm:mb-4 px-4">
            Outlier AI
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto px-4">
            Transform your content with cutting-edge AI powered by Google&apos;s Gemini Flash
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-1 sm:p-2 border border-orange-200 shadow-lg w-full max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResult(null);
                    setError('');
                  }}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-200 text-xs sm:text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <span className="text-sm sm:text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Type Selector for Generate Tab */}
        {activeTab === 'generate' && (
          <div className="flex justify-center mb-4 sm:mb-6 px-4">
            <div className="grid grid-cols-2 sm:flex gap-2 w-full max-w-md sm:max-w-none">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    contentType === type.value
                      ? `${type.color} text-white shadow-lg`
                      : 'bg-white border border-orange-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-4">
          {/* Input Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-200 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl">
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
                {inputText.length} characters
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
              className="w-full h-48 sm:h-56 lg:h-64 bg-white border-2 border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:ring-2 sm:focus:ring-4 focus:ring-orange-100 transition-colors duration-200 resize-none"
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-red-600">
                {error}
              </div>
            )}
            
            <button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`mt-4 sm:mt-6 w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-colors duration-200 ${
                loading || !inputText.trim()
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">
                    {activeTab === 'optimize' ? 'Optimizing...' : 
                     activeTab === 'generate' ? 'Generating...' : 'Analyzing...'}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base lg:text-lg">
                  {activeTab === 'optimize' ? 'Optimize' : 
                   activeTab === 'generate' ? 'Generate' : 'Analyze'} Text
                </span>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-orange-200 shadow-xl">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg sm:text-xl lg:text-2xl">✨</span>
              Results
            </h3>
            
            {!result && !loading && (
              <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center text-gray-400">
                <div className="text-center px-4">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4">
                    🤖
                  </div>
                  <p className="text-sm sm:text-base">Your AI-powered results will appear here</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mb-4 mx-auto animate-spin" />
                  <p className="text-orange-600 font-medium text-sm sm:text-base">
                    {activeTab === 'optimize' ? 'Optimizing your text...' : 
                     activeTab === 'generate' ? 'Generating content...' : 'Analyzing text...'}
                  </p>
                </div>
              </div>
            )}

            {/* Optimization Results */}
            {result && activeTab === 'optimize' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-orange-600 text-sm sm:text-base">Improved Version</h4>
                    <button
                      onClick={() => copyToClipboard((result as OptimizeResult).improved)}
                      className="text-gray-500 hover:text-orange-600 transition-colors duration-200"
                    >
                      📋
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{(result as OptimizeResult).improved}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <h4 className="font-semibold text-blue-600 mb-2 text-sm sm:text-base">What Was Improved</h4>
                  <p className="text-gray-700 text-sm sm:text-base">{(result as OptimizeResult).explanation}</p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <h4 className="font-semibold text-orange-700 mb-2 text-sm sm:text-base">💡 Pro Tip</h4>
                  <p className="text-gray-700 text-sm sm:text-base">{(result as OptimizeResult).tip}</p>
                </div>

                {Boolean((result as OptimizeResult)?.analysis) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {(result as OptimizeResult).analysis?.readabilityScore}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Readability Score</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">Key Changes</div>
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
              </div>
            )}

            {/* Generation Results */}
            {result && activeTab === 'generate' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h4 className="font-semibold text-orange-600 text-sm sm:text-base">Generated Content</h4>
                  <button
                    onClick={() => copyToClipboard(typeof result === 'string' ? result : '')}
                    className="text-gray-500 hover:text-orange-600 transition-colors duration-200"
                  >
                    📋
                  </button>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {typeof result === 'string' ? result : ''}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {result && activeTab === 'analyze' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg font-bold text-blue-600">
                      {(result as AnalyzeResult).sentiment || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">Sentiment</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg font-bold text-green-600">
                      {(result as AnalyzeResult).wordCount || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                </div>

                {(result as AnalyzeResult).keyTopics && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-orange-600 mb-2 text-sm sm:text-base">Key Topics</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {(result as AnalyzeResult).keyTopics!.map((topic: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 bg-orange-200 rounded-full text-xs sm:text-sm text-orange-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(result as AnalyzeResult).suggestions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
                    <h4 className="font-semibold text-yellow-700 mb-2 text-sm sm:text-base">Suggestions</h4>
                    <ul className="space-y-1 text-gray-700 text-xs sm:text-sm">
                      {(result as AnalyzeResult).suggestions!.map((suggestion: string, idx: number) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 text-gray-600 px-4">
          <p className="font-medium text-xs sm:text-sm lg:text-base">
            Powered by Google Gemini Flash • Built with Next.js & Framer Motion by Aman Kumar
          </p>
        </div>
      </div>
    </div>
  );
};

export default OutlierAI;