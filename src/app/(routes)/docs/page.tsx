import Link from "next/link";
import { ArrowLeft, Search, Zap, Shield, Cpu, Code, Clock } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070709] transition-colors duration-500">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#070709]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-sm">
              <Search className="w-4 h-4" />
              <span>Search docs...</span>
              <kbd className="hidden lg:inline-block ml-4 px-2 py-0.5 rounded bg-white dark:bg-black/20 text-[10px] font-semibold border border-slate-200 dark:border-white/10">⌘K</kbd>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-28 flex flex-col gap-8">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Getting Started</h4>
              <ul className="flex flex-col gap-3 text-sm">
                <li><Link href="#introduction" className="text-blue-600 dark:text-blue-400 font-medium">Introduction</Link></li>
                <li><Link href="#core-features" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Core Features</Link></li>
                <li><Link href="#ai-models" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">AI Models</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Security & Data</h4>
              <ul className="flex flex-col gap-3 text-sm">
                <li><Link href="#privacy" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy First</Link></li>
                <li><Link href="#session-sync" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Session Syncing</Link></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400">
          
          <div id="introduction" className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Welcome to TomatoAI
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              TomatoAI is a unified, frictionless AI platform designed to provide instant access to the world&apos;s best open-source and commercial language models. Zero sign-ups required, zero data harvesting, just pure intelligence at your fingertips.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Instant Access</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Start chatting from the homepage instantly.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Local Storage</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Conversations never leave your browser.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10 my-12" />

          <div id="core-features" className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Core Features</h2>
            <div className="space-y-8 not-prose">
              <div className="flex gap-4">
                <div className="mt-1 text-blue-500"><Code className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Beautiful Code Blocks</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    All AI-generated code is automatically formatted with syntax highlighting, line numbers, and an instant &quot;Copy to Clipboard&quot; button. You can even toggle word wrap for long lines of code.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 text-purple-500"><Clock className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Pending Prompt Execution</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Type a question into the Hero or Venice sections on the homepage, and TomatoAI will automatically route you to the chat interface and seamlessly execute your prompt with zero delay.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10 my-12" />

          <div id="ai-models" className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Supported AI Models</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              TomatoAI dynamically routes your requests to the most capable model based on your query, or you can manually select from our curated list.
            </p>
            <div className="overflow-x-auto not-prose">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="pb-3 text-sm font-semibold text-slate-900 dark:text-white">Model</th>
                    <th className="pb-3 text-sm font-semibold text-slate-900 dark:text-white">Provider</th>
                    <th className="pb-3 text-sm font-semibold text-slate-900 dark:text-white">Best For</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">Llama 3 70B</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Meta</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Balanced, Creative Writing</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">Qwen Coder</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Alibaba</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Programming, Logic</td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">Gemini Pro</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Google Deepmind</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">Complex Reasoning</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-white/10 my-12" />

          <div id="privacy" className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Privacy & Session Management</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              If you use TomatoAI anonymously, all chats and histories are stored entirely within your browser&apos;s <code>localStorage</code>. They are not sent to any database, meaning clearing your cache will permanently delete your chat history.
            </p>
            <div id="session-sync" className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 not-prose">
              <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-2">Supabase Sync</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                By creating a free account via Supabase Auth, you gain the ability to sync your `localStorage` chats to the cloud, allowing you to seamlessly pick up conversations on your phone, tablet, or another computer.
              </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
