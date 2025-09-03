"use client"
import { useState } from "react"
import { generateContentWithGemini } from "@/lib/contentGenerator"
import AiInput from "@/components/ui/ai-input" // Assuming you saved that component separately
import { Loader2, Plus, MessageSquare, History, X } from "lucide-react"
import { motion } from "framer-motion"
import Logo from "@/components/Logo"

interface HistoryItem {
  id: string
  input: string
  output: string
  timestamp: Date
}

export default function ContentGeneratorPage() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const optimized = await generateContentWithGemini(input)
      setResult(optimized)
      
      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        input: input.trim(),
        output: optimized,
        timestamp: new Date()
      }
      setHistory(prev => [newItem, ...prev])
    } catch (err) {
      setResult("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setInput("")
    setResult(null)
  }

  const handleHistoryClick = (item: HistoryItem) => {
    setInput(item.input)
    setResult(item.output)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative min-h-screen flex">
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
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden"
      >
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col h-full"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">History</h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-[#ff3f17]/90 hover:bg-[#ff3f17] text-white rounded-xl transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No history yet</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleHistoryClick(item)}
                    className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-all duration-200 group"
                  >
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-1">
                      {item.input}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatTimeAgo(item.timestamp)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8 relative">
        {/* Sidebar Toggle */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed top-6 left-6 z-10 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all"
          >
            <History className="w-5 h-5" />
          </motion.button>
        )}

        <div className="max-w-2xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
          >
            Content Generator
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mb-6"
          >
            Paste any text below. Gemini will optimize it for clarity and impact.
          </motion.p>
        </div>

        {/* Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <AiInputWrapper
            input={input}
            setInput={setInput}
            onGenerate={handleGenerate}
          />
        </motion.div>

        {/* Output */}
        <div className="max-w-4xl mx-auto mt-8">
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              {/* Enhanced Loading Animation */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-[#ff3f17] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-16 h-16 border-4 border-orange-300 dark:border-orange-700 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
                <div className="absolute inset-4 w-12 h-12 border-4 border-red-300 dark:border-red-700 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
              </div>
              
              <div className="text-center">
                <motion.h3 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
                >
                  AI is crafting your content...
                </motion.h3>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  <span>✨ Analyzing topic</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  >
                    {" • 🎯 Structuring content • 📝 Optimizing clarity"}
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                staggerChildren: 0.1
              }}
              className="mt-6"
            >
              {/* Content Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 p-4 bg-gradient-to-r from-[#ff3f17]/10 to-orange-500/10 dark:from-[#ff3f17]/20 dark:to-orange-500/20 rounded-xl border border-[#ff3f17]/20 dark:border-[#ff3f17]/30"
              >
                <div className="flex items-center gap-2 text-[#ff3f17] dark:text-orange-400">
                  <div className="w-2 h-2 bg-[#ff3f17] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Generated Content</span>
                </div>
              </motion.div>

              {/* Main Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <div className="p-8 lg:p-10">
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none"
                    style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.8'
                    }}
                  >
                    <div 
                      className="text-gray-800 dark:text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: result
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
                          .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 first:mt-0">$1</h2>')
                          .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">$1</h3>')
                          .replace(/^\d+\.\s(.*$)/gm, '<div class="flex items-start gap-3 my-3"><span class="flex-shrink-0 w-6 h-6 bg-[#ff3f17]/10 dark:bg-[#ff3f17]/20 text-[#ff3f17] dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-semibold mt-1">•</span><span>$1</span></div>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-8 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Content generated successfully</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigator.clipboard.writeText(result)}
                      className="px-3 py-1.5 bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg border border-neutral-200 dark:border-neutral-600 transition-colors"
                    >
                      Copy Content
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .prose h2 {
          border-bottom: 2px solid #ff3f17;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem !important;
        }
        
        .prose h3 {
          color: #ff3f17;
        }
      `}</style>
    </div>
  )
}

// Enhanced Wrapper with your existing logic
function AiInputWrapper({
  input,
  setInput,
  onGenerate,
}: {
  input: string
  setInput: (val: string) => void
  onGenerate: () => void
}) {
  return (
    <div className="w-full py-4">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-xl border rounded-[22px] border-black/5 p-1 w-full mx-auto shadow-lg"
      >
        <div className="relative rounded-2xl border border-black/5 bg-neutral-800/5 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onGenerate()
              }
            }}
            placeholder="Enter raw or boring text to optimize..."
            className="w-full p-4 text-sm rounded-2xl resize-none bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none min-h-[120px] transition-all focus:bg-black/10 dark:focus:bg-white/10"
          />
          <div className="flex justify-end p-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGenerate}
              className="bg-[#ff3f17]/90 hover:bg-[#ff3f17] transition-colors text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg"
            >
              Optimize
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
    
  )
}