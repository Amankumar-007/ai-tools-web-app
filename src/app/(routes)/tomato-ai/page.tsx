"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase-browser";
import { highlight } from 'sugar-high';
import Modal from 'react-modal';
import AiInput from "@/components/ui/ai-input";

// Set modal app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

type Role = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTitleFromPrompt(text: string) {
  return (text || "New chat").split("\n")[0].slice(0, 40) || "New chat";
}

// Login Popup Component
function LoginPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to TomatoAI
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login or create an account to continue
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-900/90 dark:bg-gray-700/90 text-white py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-300 font-medium backdrop-blur-sm"
          >
            Login
          </button>
          
          <button
            onClick={() => router.push('/register')}
            className="w-full bg-green-600/90 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium backdrop-blur-sm"
          >
            Sign Up
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default function ChatGPTPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [messageAnimations, setMessageAnimations] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string>("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Copy code to clipboard function
  const copyToClipboard = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Authentication check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dark mode initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  // Update dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Load conversations from localStorage
  useEffect(() => {
    if (!user) return;
    
    try {
      const raw = localStorage.getItem(`chatgpt_convos_v1_${user.id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        setConvos(parsed);
        if (parsed.length) {
          setActiveId(parsed[0].id);
          setHasStartedChat(true);
        }
      }
    } catch {}
  }, [user]);

  // Persist conversations to localStorage
  useEffect(() => {
    if (!user) return;
    
    try {
      localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(convos));
    } catch {}
  }, [convos, user]);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) || null,
    [convos, activeId]
  );

  // Scroll to bottom of messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ 
        top: listRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [active?.messages.length]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);
  };

  function createNewChat(seed?: string) {
    const id = uid();
    const now = Date.now();
    const convo: Conversation = {
      id,
      title: formatTitleFromPrompt(seed || "New chat"),
      messages: seed
        ? [
            {
              id: uid(),
              role: "user",
              content: seed,
              createdAt: now,
            },
          ]
        : [],
      createdAt: now,
      updatedAt: now,
    };
    setConvos((prev) => [convo, ...prev]);
    setActiveId(id);
    setSidebarOpen(false);
    if (!hasStartedChat) setHasStartedChat(true);
    return convo;
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);
    setInput("");
    if (!hasStartedChat) setHasStartedChat(true);

    let convo = active;
    if (!convo) {
      convo = createNewChat();
    }

    const userMsg: Message = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    
    setMessageAnimations(prev => new Set([...prev, userMsg.id]));

    setConvos((prev) =>
      prev.map((c) =>
        c.id === convo!.id
          ? {
              ...c,
              title: c.messages.length === 0 ? formatTitleFromPrompt(text) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    try {
      const payload = {
        messages: [
          { role: "system", content: "You are TomatoAI, a helpful and professional AI assistant." },
          ...convo!.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.6,
      };

      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = (await res.json()) as { reply: string };
      
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply || "",
        createdAt: Date.now(),
      };

      setMessageAnimations(prev => new Set([...prev, assistantMsg.id]));

      setConvos((prev) =>
        prev.map((c) =>
          c.id === convo!.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } catch (err: any) {
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: `Error: ${err?.message || "Something went wrong"}`,
        createdAt: Date.now(),
      };
      setConvos((prev) =>
        prev.map((c) =>
          c.id === (convo?.id || "")
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // Helper to submit arbitrary text (used by AiInput and quick prompts)
  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Mirror sendMessage flow but with explicit text
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);
    if (!hasStartedChat) setHasStartedChat(true);

    let convo = active;
    if (!convo) {
      convo = createNewChat();
    }

    const userMsg: Message = { id: uid(), role: "user", content: trimmed, createdAt: Date.now() };
    setMessageAnimations(prev => new Set([...prev, userMsg.id]));

    setConvos((prev) =>
      prev.map((c) =>
        c.id === convo!.id
          ? {
              ...c,
              title: c.messages.length === 0 ? formatTitleFromPrompt(trimmed) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    try {
      const payload = {
        messages: [
          { role: "system", content: "You are TomatoAI, a helpful and professional AI assistant." },
          ...convo!.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: trimmed },
        ],
        model: "openai/gpt-4o-mini",
        temperature: 0.6,
      };

      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = (await res.json()) as { reply: string };

      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply || "",
        createdAt: Date.now(),
      };

      setMessageAnimations(prev => new Set([...prev, assistantMsg.id]));

      setConvos((prev) =>
        prev.map((c) =>
          c.id === convo!.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } catch (err: any) {
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: `Error: ${err?.message || "Something went wrong"}`,
        createdAt: Date.now(),
      };
      setConvos((prev) =>
        prev.map((c) =>
          c.id === (convo?.id || "")
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function deleteConvo(id: string) {
    setConvos((prevConvos) => {
      const updatedConvos = prevConvos.filter((c) => c.id !== id);
      
      if (user) {
        if (updatedConvos.length === 0) {
          localStorage.removeItem(`chatgpt_convos_v1_${user.id}`);
        } else {
          localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(updatedConvos));
        }
      }
      
      if (activeId === id) {
        setActiveId(updatedConvos.length > 0 ? updatedConvos[0].id : null);
        setHasStartedChat(updatedConvos.length > 0);
      }
      
      return updatedConvos;
    });
  }

  function clearAll() {
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);
    
    if (user) {
      localStorage.removeItem(`chatgpt_convos_v1_${user.id}`);
    }
  }

  function startNewConversation() {
    setActiveId(null);
    setHasStartedChat(false);
    setSidebarOpen(false);
    setMessageAnimations(new Set());
  }

  function formatMessage(content: string) {
    const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        let textContent = content.slice(lastIndex, match.index);
        
        textContent = textContent.replace(inlineCodeRegex, (_, code) => 
          `<code class="inline-code">${code}</code>`
        );
        
        parts.push(
          <div 
            key={`text-${lastIndex}`} 
            className="prose prose-gray dark:prose-invert max-w-none mb-4"
            dangerouslySetInnerHTML={{
              __html: textContent.replace(/\n/g, '<br />')
            }}
          />
        );
      }

      const language = match[1] || 'javascript';
      const code = match[2].trim();
      const codeId = `code-${match.index}-${Date.now()}`;
      const highlightedCode = highlight(code);
      
      parts.push(
        <div key={codeId} className="my-6 group relative">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg bg-white/10 dark:bg-gray-800/10 backdrop-blur-md hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-600/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm"></div>
                </div>
                <div className="h-4 w-px bg-gray-300/50 dark:bg-gray-600/50 mx-2"></div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider bg-gray-200/50 dark:bg-gray-600/50 px-3 py-1 rounded-md font-mono shadow-sm">
                  {language}
                </span>
              </div>
              
              <button
                onClick={() => copyToClipboard(code, codeId)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white/50 dark:bg-gray-600/50 hover:bg-gray-100/50 dark:hover:bg-gray-500/50 border border-gray-200/50 dark:border-gray-500/50 rounded-md transition-all duration-300 hover:shadow-md transform hover:scale-105 backdrop-blur-sm"
              >
                {copiedCode === codeId ? (
                  <>
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <div className="relative">
              <pre className="p-6 overflow-x-auto text-sm leading-6 bg-gray-50 text-gray-800 dark:bg-gray-950/90 dark:text-gray-100 backdrop-blur-sm">
                <code 
                  className="font-['SF_Mono','Monaco','Inconsolata','Roboto_Mono','Consolas','monospace'] text-[13px] block"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
              
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-50 dark:from-gray-900/90 to-transparent pointer-events-none opacity-30"></div>
            </div>
          </div>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      let textContent = content.slice(lastIndex);
      
      textContent = textContent.replace(inlineCodeRegex, (_, code) => 
        `<code class="inline-code">${code}</code>`
      );
      
      parts.push(
        <div 
          key={`text-${lastIndex}`} 
          className="prose prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: textContent.replace(/\n/g, '<br />')
          }}
        />
      );
    }

    return parts.length > 0 ? parts : (
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-['Inter','system-ui','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','sans-serif'] text-[15px] font-normal">
          {content}
        </div>
      </div>
    );
  }

  if (isAuthChecking) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-no-repeat bg-center bg-cover transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: isDarkMode 
            ? "url('/chatbot2.png')" 
            : "url('/chatbot1.png')",
          transition: 'background-image 1s ease-in-out'
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo.png" alt="TomatoAI" width={64} height={64} className="animate-pulse" />
          <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen font-['Inter','system-ui','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','sans-serif'] relative overflow-hidden antialiased transition-all duration-1000 ease-in-out"
      style={{
        backgroundColor: hasStartedChat ? (isDarkMode ? '#111827' : '#FFFFFF') : 'transparent',
        backgroundImage: !hasStartedChat 
          ? isDarkMode 
            ? 'url(/chatbot2.png)'
            : 'url(/chatbot1.png)'
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-color 1s ease-in-out, background-image 1s ease-in-out'
      }}
    >
      {/* Enhanced Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .inline-code {
          background-color: rgba(156, 163, 175, 0.2);
          border: 1px solid rgba(156, 163, 175, 0.3);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
          font-size: 0.875em;
          color: #ef4444;
        }
        
        .dark .inline-code {
          background-color: rgba(75, 85, 99, 0.4);
          border-color: rgba(75, 85, 99, 0.5);
          color: #fbbf24;
        }

        .sh__token--string { color: #a8cc8c; }
        .sh__token--keyword { color: #c792ea; }
        .sh__token--comment { color: #637777; font-style: italic; }
        .sh__token--punctuation { color: #89ddff; }
        .sh__token--number { color: #f78c6c; }
        .sh__token--function { color: #82aaff; }
        .sh__token--constant { color: #ffcb6b; }
        .sh__token--class-name { color: #ffcb6b; }
        .sh__token--operator { color: #89ddff; }
        .sh__token--boolean { color: #ff5874; }
        .sh__token--property { color: #80cbc4; }
        .sh__token--tag { color: #f07178; }
        .sh__token--attr-name { color: #ffcb6b; }
        .sh__token--attr-value { color: #c3e88d; }

        .dark .sh__token--string { color: #c3e88d; }
        .dark .sh__token--keyword { color: #c792ea; }
        .dark .sh__token--comment { color: #546e7a; }
        .dark .sh__token--function { color: #82aaff; }
        .dark .sh__token--number { color: #f78c6c; }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .message-enter {
          animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sidebar-enter {
          animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .input-focused {
          transform: scale(1.02);
        }
        
        .bounce-in {
          animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hide page side scrollbars */
        html, body {
          overflow: hidden;
        }
        /* Hide scrollbars but keep scroll functionality inside containers */
        *::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)}
      />

      {/* Transparent Navbar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors md:hidden backdrop-blur-sm"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.07, rotate: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-lg shadow-sm" />
            </motion.div>
            <span className="font-bold text-gray-900 dark:text-gray-100">TomatoAI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors backdrop-blur-sm"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginPopup(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900/90 dark:bg-gray-700/90 hover:bg-gray-800/90 dark:hover:bg-gray-600/90 rounded-lg transition-colors backdrop-blur-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transparent Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`hidden md:block fixed top-20 left-5 z-40 p-3 rounded-xl bg-white/30 dark:bg-gray-800/30 shadow-lg border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm ${
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Transparent Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm transition-all duration-300" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg border-r border-gray-200/30 dark:border-gray-600/30 shadow-2xl transform transition-all duration-300 ease-out">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100/30 dark:border-gray-700/30 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.07, rotate: 5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    >
                      <Image src="/logo.png" alt="TomatoAI" width={40} height={40} className="rounded-xl shadow-lg" />
                    </motion.div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-['Inter','system-ui','-apple-system','sans-serif']">TomatoAI</h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-['Inter','system-ui','-apple-system','sans-serif']">Professional AI Assistant</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={startNewConversation}
                  className="w-full px-4 py-3 bg-gray-900/90 dark:bg-gray-600/90 text-white rounded-xl hover:bg-gray-800/90 dark:hover:bg-gray-500/90 transition-all duration-300 text-sm font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl font-['Inter','system-ui','-apple-system','sans-serif'] backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Conversation
                  </div>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {convos.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12 fade-in">
                    <div className="w-16 h-16 bg-gray-100/30 dark:bg-gray-700/30 rounded-2xl mx-auto mb-6 flex items-center justify-center bounce-in backdrop-blur-sm">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No conversations yet</h3>
                    <p className="text-sm font-['Inter','system-ui','-apple-system','sans-serif']">Start your first conversation with TomatoAI</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 font-['Inter','system-ui','-apple-system','sans-serif']">
                      Recent Conversations
                    </h3>
                    {convos.map((c, index) => (
                      <div key={c.id} className="group sidebar-enter relative" style={{ animationDelay: `${index * 50}ms` }}>
                        <button
                          onClick={() => {
                            setActiveId(c.id);
                            setHasStartedChat(true);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-sm border backdrop-blur-sm ${
                            activeId === c.id 
                              ? "bg-gray-50/50 dark:bg-gray-600/50 text-gray-900 dark:text-gray-100 shadow-md border-gray-200/50 dark:border-gray-500/50" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400/80 dark:bg-gray-500/80 mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate pr-8 text-sm font-semibold font-['Inter','system-ui','-apple-system','sans-serif'] mb-1">
                                {c.title}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-['Inter','system-ui','-apple-system','sans-serif']">
                                <span>{c.messages.length} messages</span>
                                <span>•</span>
                                <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConvo(c.id);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4 text-red-400 hover:text-red-600 dark:hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {convos.length > 0 && (
                <div className="p-4 border-t border-gray-100/30 dark:border-gray-700/30 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm">
                  <button
                    onClick={clearAll}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 py-3 px-4 rounded-xl hover:bg-red-50/20 dark:hover:bg-red-900/20 transition-all duration-300 transform hover:scale-105 font-semibold font-['Inter','system-ui','-apple-system','sans-serif'] flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Conversations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative pt-16">
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {(!hasStartedChat || (!active && !loading)) ? (
            <div className="flex flex-col items-center justify-center h-full px-4 relative">
              <div className="max-w-2xl w-full text-center mb-12">
                <div className="mb-8 bounce-in">
                  <motion.div
                    whileHover={{ scale: 1.07, rotate: 5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="mx-auto mb-6"
                    style={{ width: 64, height: 64 }}
                  >
                    <Image 
                      src="/logo.png" 
                      alt="TomatoAI" 
                      width={64} 
                      height={64} 
                      className="rounded-2xl shadow-xl" 
                    />
                  </motion.div>
                  <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 fade-in font-['Inter','system-ui','-apple-system','sans-serif'] tracking-tight">
                    Hi, I'm TomatoAI
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-light fade-in font-['Inter','system-ui','-apple-system','sans-serif']" style={{ animationDelay: '200ms' }}>How can I help you today?</p>
                </div>

                <div className="relative mb-8">
                  <AiInput
                    onSubmitWithMode={(text, isSearch) => {
                      if (isSearch) {
                        router.push(`/search?q=${encodeURIComponent(text)}`);
                      } else {
                        sendText(text);
                      }
                    }}
                    submitting={loading}
                    disabled={loading}
                  />
                </div>

                {/* Quick prompts removed for a minimal layout */}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
              {active?.messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`space-y-4 ${messageAnimations.has(m.id) ? 'message-enter' : ''}`}
                >
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-gray-900/90 dark:bg-gray-600/90 text-white px-6 py-4 rounded-2xl max-w-[85%] shadow-lg transform hover:scale-102 transition-transform duration-300 backdrop-blur-sm">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-['Inter','system-ui','-apple-system','sans-serif'] font-normal">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-full shadow-sm" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-['Inter','system-ui','-apple-system','sans-serif']">TomatoAI</span>
                      </div>
                      <div className="ml-11">
                        {formatMessage(m.content)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="space-y-3 message-enter">
                  <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-full" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-['Inter','system-ui','-apple-system','sans-serif']">TomatoAI</span>
                  </div>
                  <div className="ml-11 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-['Inter','system-ui','-apple-system','sans-serif']">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasStartedChat && (
          <div className="border-gray-200/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md">
            <div className="max-w-4xl mx-auto ">
              <div className="relative">
                <AiInput
                  onSubmitWithMode={(text, isSearch) => {
                    if (isSearch) {
                      router.push(`/search?q=${encodeURIComponent(text)}`);
                    } else {
                      sendText(text);
                    }
                  }}
                  submitting={loading}
                  disabled={loading}
                />
              </div>
              
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}