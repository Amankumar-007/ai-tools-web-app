"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  MessageSquare,
  Brain,
  Copy,
  Check,
  X,
  ChevronLeft,
  Edit3,
  LucideIcon,
} from "lucide-react";

// Types
type SummaryType = "general" | "bullet" | "executive" | "academic";
type FeatureId = "summary" | "keywords" | "questions" | "analysis";
type Feature = {
  id: FeatureId;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
};

type ResultsState = Record<FeatureId, string | undefined>;
type LoadingState = Record<FeatureId, boolean | undefined>;

// Gemini API configuration and utility functions
const GEMINI_API_KEY =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "your-api-key-here";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const geminiAPI = {
  async generateContent(
    prompt: string,
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
    } = {}
  ): Promise<string> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          topK: options.topK ?? 40,
          topP: options.topP ?? 0.95,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
    );
  },

  async summarizeText(
    text: string,
    type: SummaryType = "general"
  ): Promise<string> {
    const prompts: Record<SummaryType, string> = {
      general: `Provide a clear and concise summary of the following text in 3-5 key points:\n\n${text}`,
      bullet: `Create a bullet-point summary of the main ideas from this text:\n\n${text}`,
      executive: `Write an executive summary of the following content, highlighting the most critical information:\n\n${text}`,
      academic: `Provide an academic-style summary with key findings and conclusions:\n\n${text}`,
    };

    return this.generateContent(prompts[type]);
  },

  async extractKeywords(text: string): Promise<string> {
    const prompt = `Extract the most important keywords and key phrases from this text. Return them as a comma-separated list:\n\n${text}`;
    return this.generateContent(prompt);
  },

  async generateQuestions(text: string): Promise<string> {
    const prompt = `Based on this text, generate 5 thoughtful questions that test understanding of the main concepts:\n\n${text}`;
    return this.generateContent(prompt);
  },

  async analyzeContent(text: string): Promise<string> {
    const prompt = `Analyze this content and provide insights about:\n1. Main themes\n2. Tone and sentiment\n3. Target audience\n4. Key takeaways\n\nText:\n${text}`;
    return this.generateContent(prompt);
  },
};

const features: Feature[] = [
  {
    id: "summary",
    name: "Summarize",
    icon: FileText,
    description: "Generate smart summaries",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "keywords",
    name: "Keywords",
    icon: Sparkles,
    description: "Extract key terms",
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "questions",
    name: "Questions",
    icon: MessageSquare,
    description: "Generate questions",
    color: "from-orange-500 to-pink-500",
  },
  {
    id: "analysis",
    name: "Analyze",
    icon: Brain,
    description: "Content insights",
    color: "from-orange-500 to-purple-500",
  },
];

const summaryTypes: { value: SummaryType; label: string }[] = [
  { value: "general", label: "General Summary" },
  { value: "bullet", label: "Bullet Points" },
  { value: "executive", label: "Executive Summary" },
  { value: "academic", label: "Academic Summary" },
];

const initialResultsState: ResultsState = {
  summary: undefined,
  keywords: undefined,
  questions: undefined,
  analysis: undefined,
};

const initialLoadingState: LoadingState = {
  summary: false,
  keywords: false,
  questions: false,
  analysis: false,
};

const AISummariesTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [results, setResults] = useState<ResultsState>(initialResultsState);
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState);
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>("general");
  const [copied, setCopied] = useState<FeatureId | "">("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleProcess = async (featureId: FeatureId): Promise<void> => {
    if (!inputText.trim()) {
      alert("Please enter some text to process");
      return;
    }

    setLoading((prev) => ({ ...prev, [featureId]: true }));
    setActiveFeature(featureId);
    setSidebarOpen(true);

    try {
      let result: string | undefined;
      switch (featureId) {
        case "summary":
          result = await geminiAPI.summarizeText(inputText, summaryType);
          break;
        case "keywords":
          result = await geminiAPI.extractKeywords(inputText);
          break;
        case "questions":
          result = await geminiAPI.generateQuestions(inputText);
          break;
        case "analysis":
          result = await geminiAPI.analyzeContent(inputText);
          break;
        default:
          result = undefined;
      }
      setResults((prev) => ({ ...prev, [featureId]: result }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error processing:", error);
      alert("Error processing text. Please check your API key and try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [featureId]: false }));
    }
  };

  const copyToClipboard = async (
    text: string,
    id: FeatureId | ""
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy text:", err);
    }
  };

  const closeSidebar = (): void => {
    setSidebarOpen(false);
    setActiveFeature(null);
  };

  const currentFeature = features.find((f) => f.id === activeFeature);
  const currentResult = activeFeature ? results[activeFeature] : undefined;

  const wordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Active Feature Info */}
          {currentFeature && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${currentFeature.color} rounded-lg flex items-center justify-center`}
                >
                  <currentFeature.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {currentFeature.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentFeature.description}
                  </p>
                </div>
              </div>

              {activeFeature && loading[activeFeature] && (
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          )}

          {/* Summary Type Selector */}
          {activeFeature === "summary" && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Summary Type</h4>
              <div className="space-y-2">
                {summaryTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSummaryType(type.value)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                      summaryType === type.value
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                    type="button"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleProcess("summary")}
                disabled={loading.summary}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                type="button"
              >
                Regenerate Summary
              </button>
            </div>
          )}

          {/* Other Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Other Features</h4>
            <div className="space-y-2">
              {features
                .filter((f) => f.id !== activeFeature)
                .map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleProcess(feature.id)}
                    disabled={loading[feature.id] || !inputText.trim()}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}
                    >
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 text-sm">
                        {feature.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {feature.description}
                      </div>
                    </div>
                    {loading[feature.id] && (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin ml-auto"></div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Text Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Text Info</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Characters: {inputText.length}</div>
              <div>Words: {wordCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-80" : ""
        }`}
      >
        {!sidebarOpen ? (
          // Home View
          <div>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    AI Content Analyzer
                  </h1>
                  <p className="text-gray-600">Powered by Gemini Flash API</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Input Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Enter Your Text
                </h2>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your content here to analyze with AI..."
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none text-gray-800 text-base leading-relaxed"
                />

                <div className="mt-3 text-sm text-gray-500">
                  {inputText.length} characters • {wordCount} words
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleProcess(feature.id)}
                    disabled={!inputText.trim()}
                    className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Result View
          <div className="min-h-screen bg-white">
            {/* Result Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={closeSidebar}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                      aria-label="Back"
                      type="button"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center space-x-3">
                      {currentFeature && (
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${currentFeature.color} rounded-lg flex items-center justify-center`}
                        >
                          <currentFeature.icon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                          {activeFeature === "summary"
                            ? `${
                                summaryType.charAt(0).toUpperCase() +
                                summaryType.slice(1)
                              } Summary`
                            : currentFeature?.name}
                        </h1>
                        <p className="text-sm text-gray-600">
                          {currentFeature?.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentResult && activeFeature && (
                    <button
                      onClick={() =>
                        copyToClipboard(currentResult, activeFeature)
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                      type="button"
                    >
                      {copied === activeFeature ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Result Content */}
            <div className="p-6">
              {activeFeature && loading[activeFeature] ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your content...</p>
                  </div>
                </div>
              ) : currentResult ? (
                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-gray max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base bg-gray-50 rounded-lg p-6">
                      {currentResult}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Processing your request...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummariesTool;
