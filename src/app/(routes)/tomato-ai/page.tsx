"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase-browser";
import { authFetch } from "@/lib/auth-fetch";
import Modal from 'react-modal';
import AiInput from "@/components/ui/ai-input";
import LightningToggle from "@/components/ui/lightning-toggle";
import {
  Sparkles,
  Code,
  Brain,
  Scan,
  Eye,
  Check,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Search,
  ChevronRight,
  Info,
  FileText,
  Languages,
  Type,
  FileSearch,
  Palette,
  Scissors,
  Maximize2,
  Cat,
  Image as ImageIcon,
  Square,
  Plus
} from 'lucide-react';
import { toast } from "sonner";
// Set modal app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Dynamic import for Framer Motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div />
});
const MarkdownRenderer = dynamic(() => import('@/components/TomatoMarkdown'), {
  loading: () => <div className="whitespace-pre-wrap text-sm leading-7">Loading message…</div>,
});

type Role = "user" | "assistant" | "system";
const DEFAULT_MODEL = "openrouter/free";
const LIGHTNING_MODEL = "nvidia/nemotron-3.5-lightning:free";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  status?: 'stopped' | 'interrupted';
  image?: { url: string; name: string };
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
  return (text || "New chat").split("\n").slice(0, 40).join(" ") || "New chat";
}

// Model Selection Modal Component
function ModelSelectionModal({ isOpen, onClose, selectedModel, onSelectModel }: {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}) {
  const models = [
    { id: "openrouter/free", name: "Auto Free Router", type: "smart", logo: "https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128" },
    { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B IT", type: "balanced", logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
    { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B IT", type: "fast", logo: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
    { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B", type: "compact", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
    { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B", type: "large", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
    { id: "nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra 550B", type: "large", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
    { id: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", type: "fast", logo: "https://www.google.com/s2/favicons?domain=nvidia.com&sz=128" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", type: "compact", logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=128" },
    { id: "poolside/laguna-xs-2.1:free", name: "Laguna XS 2.1", type: "reasoning", logo: "https://www.google.com/s2/favicons?domain=poolside.ai&sz=128" },
    { id: "poolside/laguna-s-2.1:free", name: "Laguna S 2.1", type: "reasoning", logo: "https://www.google.com/s2/favicons?domain=poolside.ai&sz=128" },
    { id: "cohere/north-mini-code:free", name: "Cohere North Mini Code", type: "code", logo: "https://www.google.com/s2/favicons?domain=cohere.com&sz=128" },
    { id: "z-ai/glm-5.2:free", name: "GLM 5.2", type: "balanced", logo: "https://www.google.com/s2/favicons?domain=zhipuai.cn&sz=128" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      overlayClassName="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-[9998]"
    >
      <MotionDiv
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl rounded-[32px] w-full max-w-[460px] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative p-6 pb-4 border-b border-gray-100/50 dark:border-white/5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Intelligence Models</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the AI brain for your task</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative p-6 pt-4 z-10">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-medium dark:text-gray-200 transition-all placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar pr-2">
            {filteredModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-200 group ${selectedModel === model.id
                  ? "bg-slate-900 dark:bg-white border-transparent shadow-md"
                  : "bg-white/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-gray-100 dark:border-white/5"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 overflow-hidden bg-white shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
                    <img src={model.logo} alt={model.name} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold truncate ${selectedModel === model.id ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>{model.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${selectedModel === model.id ? 'text-white/70 dark:text-gray-900/70' : 'text-gray-400 dark:text-gray-500'}`}>{model.type}</span>
                  </div>
                </div>
                {selectedModel === model.id && (
                  <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center mr-1">
                    <Check className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </MotionDiv>
    </Modal>
  );
}

// Login Popup Component
function LoginPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      overlayClassName="fixed inset-0 bg-black/40 z-[9998]"
    >
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-white dark:bg-[#111111] rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-white/10 relative text-center"
      >
        <div className="mb-6 mx-auto w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
          <LogIn className="w-6 h-6 text-white dark:text-black" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 px-4 leading-relaxed">Sign in to access AI tools and save your chats.</p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-black py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all font-semibold text-sm"
          >
            Sign In
          </button>

          <button
            onClick={() => router.push('/register')}
            className="w-full bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all font-semibold text-sm"
          >
            Create Account
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-widest font-medium"
        >
          Close
        </button>
      </MotionDiv>
    </Modal>
  );
}

// Suggested Questions Data - Split into two rows
const SUGGESTED_QUESTIONS_ROW1 = [
  { label: "Chat with PDF", icon: FileText, query: "Can you help me analyze a PDF document?" },
  { label: "Translate", icon: Languages, query: "Translate this text for me: " },
  { label: "Analyze Image", icon: Eye, query: "What's in this image?" },
  { label: "Grammar check", icon: Type, query: "Check the grammar of this sentence: " },
  { label: "AI Detector", icon: ShieldCheck, query: "Is this text AI-generated?" },
];

const SUGGESTED_QUESTIONS_ROW2 = [
  { label: "Image Generation", icon: ImageIcon, query: "Generate an image of " },
  { label: "Style Transfer", icon: Palette, query: "Apply a different style to this image." },
  { label: "AI Cartoon Mode", icon: Cat, query: "Turn this photo into a cartoon." },
  { label: "Background Remover", icon: Scissors, query: "Remove the background from this image." },
  { label: "Image Upscaler", icon: Maximize2, query: "Upscale this image to high resolution." },
];

function SuggestionMarquee({ onSelect }: { onSelect: (query: string) => void }) {
  return (
    <div className="w-full flex flex-col gap-4 py-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      {/* Row 1 */}
      <div className="flex animate-marquee whitespace-nowrap gap-4 items-center group">
        {[...SUGGESTED_QUESTIONS_ROW1, ...SUGGESTED_QUESTIONS_ROW1, ...SUGGESTED_QUESTIONS_ROW1].map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.query)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#111111]/80 hover:bg-[#1a1a1a]/90 border border-white/10 rounded-full transition-all text-[13px] text-gray-300 hover:text-white font-medium shadow-sm backdrop-blur-md group-hover:pause"
          >
            <item.icon className="w-4 h-4 opacity-70" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex animate-marquee-slow whitespace-nowrap gap-4 items-center group transition-all">
        {[...SUGGESTED_QUESTIONS_ROW2, ...SUGGESTED_QUESTIONS_ROW2, ...SUGGESTED_QUESTIONS_ROW2].map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.query)}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#111111]/80 hover:bg-[#1a1a1a]/90 border border-white/10 rounded-full transition-all text-[13px] text-gray-300 hover:text-white font-medium shadow-sm backdrop-blur-md group-hover:pause"
          >
            <item.icon className="w-4 h-4 opacity-70" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatInterface({ forceChatView = false }: { forceChatView?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingConversationId, setStreamingConversationId] = useState<string | null>(null);
  const [chatError, setChatError] = useState('');
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image' | 'text', content?: string, url?: string, name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const previousModelRef = useRef(DEFAULT_MODEL);
  const [showModelModal, setShowModelModal] = useState(false);
  const [customMemory, setCustomMemory] = useState("");
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef(true);
  const requestActiveRef = useRef(false);
  const lastFailedRequestRef = useRef<{ convoId: string; payload: { messages: any[]; model: string; temperature: number }; partialId?: string } | null>(null);

  const selectModel = (model: string) => {
    if (model === LIGHTNING_MODEL) {
      if (selectedModel !== LIGHTNING_MODEL) previousModelRef.current = selectedModel;
    } else {
      previousModelRef.current = model;
    }
    setSelectedModel(model);
  };

  const toggleLightning = () => {
    if (selectedModel === LIGHTNING_MODEL) {
      setSelectedModel(previousModelRef.current === LIGHTNING_MODEL ? DEFAULT_MODEL : previousModelRef.current);
    } else {
      previousModelRef.current = selectedModel;
      setSelectedModel(LIGHTNING_MODEL);
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  useEffect(() => {
    if (!sidebarOpen) return;
    sidebarCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const drawer = sidebarCloseRef.current?.closest('aside');
      const focusable = drawer?.querySelectorAll<HTMLElement>('a, button, input');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [sidebarOpen]);

  const router = useRouter();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isAuthChecking) return;
    if (!isLoaded || loadedUid !== (user?.id || 'anon')) return;
    if (hasTriggeredRef.current) return;

    const pendingPrompt = localStorage.getItem('pending_prompt');
    const urlQuery = new URLSearchParams(window.location.search).get('q');
    const promptToUse = pendingPrompt || urlQuery;

    if (promptToUse) {
      hasTriggeredRef.current = true;
      const isFromUrl = !!urlQuery;

      // Cleanup localStorage and URL
      if (pendingPrompt) localStorage.removeItem('pending_prompt');
      if (urlQuery && typeof window !== 'undefined') {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('q');
        window.history.replaceState({}, '', newUrl.pathname);
      }

      // Submit immediately
      submitMessage(promptToUse, isFromUrl);
    }
  }, [isAuthChecking, isLoaded, loadedUid, user?.id]);

  // Authentication check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
      } catch (err) {
        console.error("Auth session error:", err);
        setUser(null);
      } finally {
        setIsAuthChecking(false);
      }
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
    if (isAuthChecking) return;
    abortControllerRef.current?.abort();
    const uid = user?.id || 'anon';
    setLoadedUid(null);

    try {
      // Migrate anonymous chats on login
      if (user) {
        const anonRaw = localStorage.getItem('chatgpt_convos_v1_anon');
        if (anonRaw) {
          const anonParsed = JSON.parse(anonRaw) as Conversation[];
          if (anonParsed.length > 0) {
            const userRaw = localStorage.getItem(`chatgpt_convos_v1_${user.id}`);
            const userParsed = userRaw ? (JSON.parse(userRaw) as Conversation[]) : [];
            const existingIds = new Set(userParsed.map(c => c.id));
            const newAnonParsed = anonParsed.filter(c => !existingIds.has(c.id));

            const merged = [...newAnonParsed, ...userParsed];
            localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(merged));
            localStorage.removeItem('chatgpt_convos_v1_anon');

            const anonActiveId = sessionStorage.getItem('tomato_ai_active_id_anon');
            if (anonActiveId) {
              sessionStorage.setItem(`tomato_ai_active_id_${user.id}`, anonActiveId);
              sessionStorage.removeItem('tomato_ai_active_id_anon');
            }
          } else {
            localStorage.removeItem('chatgpt_convos_v1_anon');
          }
        }
      }

      const raw = localStorage.getItem(`chatgpt_convos_v1_${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        setConvos(parsed);

        // Load activeId from sessionStorage (reset on tab close)
        const sessionActiveId = sessionStorage.getItem(`tomato_ai_active_id_${uid}`);
        if (sessionActiveId && parsed.some(c => c.id === sessionActiveId)) {
          setActiveId(sessionActiveId);
          setHasStartedChat(true);
        } else {
          // If no session ID or ID not found, reset to landing state
          setActiveId(null);
          setHasStartedChat(false);
        }
      } else {
        setConvos([]);
        setActiveId(null);
        setHasStartedChat(false);
      }

      // Load custom memory
      const memory = localStorage.getItem(`tomato_ai_custom_memory_${uid}`);
      if (memory) {
        setCustomMemory(memory);
      } else {
        setCustomMemory("");
      }
    } catch {
      setConvos([]);
      setActiveId(null);
      setHasStartedChat(false);
    } finally {
      setLoadedUid(uid);
      setIsLoaded(true);
    }
  }, [user?.id, isAuthChecking]);

  // Persist conversations to localStorage
  useEffect(() => {
    if (isAuthChecking) return;
    const uid = user?.id || 'anon';
    if (loadedUid !== uid) return;

    try {
      localStorage.setItem(`chatgpt_convos_v1_${uid}`, JSON.stringify(convos));
      if (activeId) {
        sessionStorage.setItem(`tomato_ai_active_id_${uid}`, activeId);
      } else {
        sessionStorage.removeItem(`tomato_ai_active_id_${uid}`);
      }
    } catch { }
  }, [convos, user?.id, activeId, loadedUid, isAuthChecking]);

  const active = useMemo(
    () => convos.find((c) => c.id === activeId) || null,
    [convos, activeId]
  );
  const filteredConvos = useMemo(() => convos.filter((conversation) =>
    conversation.title.toLowerCase().includes(conversationSearch.trim().toLowerCase())
  ), [convos, conversationSearch]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [activeId, active?.messages.length]);

  useEffect(() => {
    if (stickToBottomRef.current && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [streamingText]);

  // Track scroll position to collapse input
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasStartedChat]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);
    sessionStorage.clear();
  };

  function startNewConversation() {
    stopGenerating();
    setChatError('');
    setActiveId(null);
    setHasStartedChat(false);
    setSidebarOpen(false);
    setInput("");
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      if (newUrl.searchParams.has('q')) {
        newUrl.searchParams.delete('q');
        window.history.replaceState({}, '', newUrl.pathname);
      }
    }
  }

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

  async function runCompletion(convoId: string, payload: { messages: any[]; model: string; temperature: number }) {
    if (requestActiveRef.current) return;
    requestActiveRef.current = true;
    setLoading(true);
    setChatError('');
    setStreamingConversationId(convoId);
    setStreamingText('');
    lastFailedRequestRef.current = null;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const assistantId = uid();
    let fullText = '';
    let lastPaint = 0;
    let status: Message['status'];

    try {
      const response = await authFetch('/api/chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'The AI service is unavailable. Please try again.');
      }
      if (!response.body) throw new Error('The response could not be streamed. Please try again.');
      const fallbackModel = response.headers.get('X-Fallback-Model');
      if (fallbackModel) toast.info(`Switched to ${fallbackModel}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        if (Date.now() - lastPaint > 60) {
          setStreamingText(fullText);
          lastPaint = Date.now();
        }
      }
      fullText += decoder.decode();
      if (!fullText.trim()) throw new Error('The AI returned an empty response. Please try again.');
    } catch (error) {
      if (controller.signal.aborted) {
        status = 'stopped';
      } else {
        status = 'interrupted';
        setChatError(error instanceof Error ? error.message : 'The response was interrupted. Please try again.');
        lastFailedRequestRef.current = { convoId, payload, partialId: fullText.trim() ? assistantId : undefined };
      }
    } finally {
      if (fullText.trim()) {
        const assistant: Message = { id: assistantId, role: 'assistant', content: fullText, createdAt: Date.now(), status };
        setConvos((previous) => previous.map((conversation) => conversation.id === convoId
          ? { ...conversation, messages: [...conversation.messages, assistant], updatedAt: Date.now() }
          : conversation));
      }
      setStreamingText('');
      setStreamingConversationId(null);
      setLoading(false);
      abortControllerRef.current = null;
      requestActiveRef.current = false;
    }
  }

  const processFile = async (file: File) => {
    setIsUploading(true);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file smaller than 10 MB.');
      if (file.type.startsWith('image/')) {
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Could not read the image.'));
          reader.readAsDataURL(file);
        });
        const res = await authFetch('/api/upload-image', { method: 'POST', body: JSON.stringify({ image: base64Image }) });
        if (!res.ok) throw new Error('Could not upload the image.');
        const data = await res.json();
        if (!data.url) throw new Error('The image upload did not return a URL.');
        setAttachment({ type: 'image', url: data.url, name: file.name });
      } else if (file.type === 'application/pdf') {
        const { extractTextFromPdf } = await import('@/services/pdfService');
        const text = await extractTextFromPdf(file);
        if (!text.trim()) throw new Error('No readable text was found in the PDF.');
        setAttachment({ type: 'text', content: text.slice(0, 40_000), name: file.name });
      } else {
        const text = await file.text();
        if (!text.trim()) throw new Error('The file is empty.');
        setAttachment({ type: 'text', content: text.slice(0, 40_000), name: file.name });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not attach the file.');
      setAttachment(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be selected again if needed
    e.target.value = "";
  };

  const handleAiInputFileSelect = (file: File | null) => {
    if (file) {
      processFile(file);
    } else {
      setAttachment(null);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function submitMessage(text: string, forceNewChat = false) {
    if (!text.trim() || requestActiveRef.current || isUploading) return;

    if (!user) {
      const totalAnonMessages = convos.reduce((acc, c) => acc + c.messages.filter(m => m.role === 'user').length, 0);
      if (totalAnonMessages >= 1) {
        localStorage.setItem('pending_prompt', text);
        setShowLoginPopup(true);
        return;
      }
    }

    requestActiveRef.current = true;
    setChatError('');
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!hasStartedChat) setHasStartedChat(true);

    let convo = forceNewChat ? null : active;
    if (!convo) convo = createNewChat();

    const messageContent = attachment?.type === 'image' && attachment.url
      ? `![${attachment.name}](${attachment.url})\n\n${text}`
      : attachment?.type === 'text' && attachment.content
        ? `${text}\n\n[Attached File: ${attachment.name}]\n${attachment.content.slice(0, 40_000)}`
        : text;

    const userMsg: Message = { id: uid(), role: "user", content: messageContent, createdAt: Date.now(),
      image: attachment?.type === 'image' && attachment.url ? { url: attachment.url, name: attachment.name } : undefined };
    setConvos(prev => {
      return prev.map(c =>
        c.id === convo?.id
          ? {
            ...c,
            title: c.messages.length === 0 ? formatTitleFromPrompt(text) : c.title,
            messages: [...c.messages, userMsg],
            updatedAt: Date.now(),
          }
          : c
      );
    });
    setAttachment(null);

    const apiMessages: any[] = [{
      role: 'system',
      content: `You are TomatoAI, a helpful AI assistant. Answer the user's request directly. If you are unsure, say so.` +
        (customMemory.trim() ? `\n\nUser context: ${customMemory.trim().slice(0, 2_000)}` : ''),
    }, ...convo.messages.slice(-20).map((message) => ({
      role: message.role,
      content: message.image
        ? [{ type: 'text', text: message.content.replace(/^!\[[^\]]*\]\([^)]*\)\s*/, '').slice(0, 12_000) }, { type: 'image_url', image_url: { url: message.image.url } }]
        : message.content.slice(0, 12_000),
    }))];

    let lastMessageContent: any = text;
    let modelToUse = selectedModel;
    if (attachment?.type === 'image' && attachment.url) {
      lastMessageContent = [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: attachment.url } }
      ];
      modelToUse = 'google/gemma-4-31b-it:free';
    } else if (attachment?.type === 'text' && attachment.content) {
      lastMessageContent = `${text}\n\n[Attached File Content]:\n${attachment.content.slice(0, 40_000)}`;
    }
    if (convo.messages.slice(-20).some((message) => message.image)) modelToUse = 'google/gemma-4-31b-it:free';
    apiMessages.push({ role: 'user', content: lastMessageContent });
    requestActiveRef.current = false;
    await runCompletion(convo.id, { messages: apiMessages, model: modelToUse, temperature: 0.6 });
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    submitMessage(input.trim());
  }

  async function sendText(text: string) {
    submitMessage(text.trim());
  }

  function retryLastResponse() {
    const request = lastFailedRequestRef.current;
    if (request && request.convoId === activeId && !requestActiveRef.current) {
      if (request.partialId) setConvos((previous) => previous.map((conversation) => conversation.id === request.convoId
        ? { ...conversation, messages: conversation.messages.filter((message) => message.id !== request.partialId) }
        : conversation));
      void runCompletion(request.convoId, request.payload);
    }
  }


  function deleteConvo(id: string) {
    if (activeId === id) stopGenerating();
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
    stopGenerating();
    setChatError('');
    setSidebarOpen(false);
    setConvos([]);
    setActiveId(null);
    setHasStartedChat(false);

    if (user) {
      localStorage.removeItem(`chatgpt_convos_v1_${user.id}`);
    }
    router.push('/tomato-ai');
  }

  if (isAuthChecking) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-slate-50 bg-center bg-no-repeat dark:bg-slate-950"
        style={{ backgroundImage: `url('/${isDarkMode ? 'chatbot2.png' : 'chatbot1.png'}')`, backgroundSize: '100% 100%' }}
      >
        {/* `isAuthChecking` starts true, so this is what the server renders
            and what a crawler sees. It therefore carries the page's heading
            and a real description of the product rather than just a spinner. */}
        <div className="flex flex-col items-center gap-4 max-w-xl px-6 text-center">
          <Image src="/logo.png" alt="TomatoAI" width={64} height={64} className="animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            TomatoAI Chat
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            A free AI assistant for questions, brainstorming, writing and code. Switch between leading
            open-source and commercial language models, upload a PDF or image to ask about it, and keep your
            conversation history in one place.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Because different models are good at different things, TomatoAI Chat lets you change model mid-conversation
            rather than committing up front: a fast model for quick questions, a stronger reasoning model when a problem
            needs working through, and a code-focused model for debugging. Custom instructions carry your context across
            every conversation, so you are not restating who you are and what you are working on each time.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Attach a PDF, document or screenshot and ask questions about it directly. Responses stream as they are
            generated, code blocks are syntax-highlighted and one click from being copied, and your history stays
            available so earlier answers remain easy to find.
          </p>
          <div className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-dvh overflow-hidden bg-slate-50 bg-center bg-no-repeat font-inter antialiased dark:bg-slate-950"
      style={{ backgroundImage: !hasStartedChat ? `url('/${isDarkMode ? 'chatbot2.png' : 'chatbot1.png'}')` : 'none', backgroundSize: '100% 100%' }}
    >
      {/* Enhanced Custom Styles */}
      <style jsx global>{`
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

        /* Syntax highlighting styles */
        .sh__token--string { color: #22c55e; }
        .sh__token--keyword { color: #8b5cf6; }
        .sh__token--comment { color: #6b7280; font-style: italic; }
        .sh__token--punctuation { color: #64748b; }
        .sh__token--number { color: #f59e0b; }
        .sh__token--function { color: #3b82f6; }
        .sh__token--constant { color: #ef4444; }
        .sh__token--class-name { color: #f59e0b; }
        .sh__token--operator { color: #64748b; }
        .sh__token--boolean { color: #ef4444; }
        .sh__token--property { color: #06b6d4; }
        .sh__token--tag { color: #ef4444; }
        .sh__token--attr-name { color: #f59e0b; }
        .sh__token--attr-value { color: #22c55e; }
        
        .dark .sh__token--string { color: #4ade80; }
        .dark .sh__token--keyword { color: #a78bfa; }
        .dark .sh__token--comment { color: #9ca3af; }
        .dark .sh__token--function { color: #60a5fa; }
        .dark .sh__token--number { color: #fbbf24; }
        .dark .sh__token--constant { color: #f87171; }
        .dark .sh__token--property { color: #22d3ee; }
        
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

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-slow {
          animation: marquee 50s linear infinite;
        }
        .pause {
          animation-play-state: paused !important;
        }

        /* 3D code card shadows */
        .code-card {
          transition: box-shadow 200ms ease, transform 200ms ease;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.05),
            0 3px 6px rgba(0, 0, 0, 0.08),
            0 10px 20px rgba(0, 0, 0, 0.06);
        }
        .code-card:hover {
          transform: none;
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.05),
            0 3px 6px rgba(0, 0, 0, 0.08),
            0 10px 20px rgba(0, 0, 0, 0.06);
        }
        .dark .code-card {
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.35),
            0 6px 10px rgba(0, 0, 0, 0.35),
            0 18px 32px rgba(0, 0, 0, 0.45);
        }
        .dark .code-card:hover {
          box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.35),
            0 6px 10px rgba(0, 0, 0, 0.35),
            0 18px 32px rgba(0, 0, 0, 0.45);
        }
        .code-card-inner {
          background-image: radial-gradient(ellipse at top, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%);
        }
        .dark .code-card-inner {
          background-image: radial-gradient(ellipse at top, rgba(255,255,255,0.06), rgba(255,255,255,0) 60%);
        }
      `}</style>

      {/* Login Popup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />

      {/* Memory Modal */}
      <Modal
        isOpen={showMemoryModal}
        onRequestClose={() => setShowMemoryModal(false)}
        className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
        overlayClassName="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm z-[9998] transition-all duration-300"
      >
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Custom Instructions</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Add rules and preferences that TomatoAI will remember across all chats.
            </p>
          </div>

          <textarea
            value={customMemory}
            onChange={(e) => setCustomMemory(e.target.value)}
            className="w-full h-36 p-4 rounded-xl bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 resize-none outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400/20 dark:focus:ring-zinc-600/20 placeholder-zinc-400 dark:placeholder-zinc-600 transition-all text-sm leading-relaxed"
            placeholder="For example: Always write code in Python. Keep answers concise. Speak in a friendly tone."
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowMemoryModal(false)}
              className="px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const uid = user?.id || 'anon';
                localStorage.setItem(`tomato_ai_custom_memory_${uid}`, customMemory);
                setShowMemoryModal(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs transition-all shadow-sm"
            >
              Save instructions
            </button>
          </div>
        </div>
      </Modal>

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={selectedModel}
        onSelectModel={selectModel}
      />


      {/* Conversation drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() => setSidebarOpen(false)}
          />
          <aside role="dialog" aria-modal="true" aria-label="Conversations" className="absolute bottom-0 left-0 top-0 w-[min(88vw,340px)] border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-full flex-col overflow-hidden">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-5 flex items-center justify-between">
                  <Link href="/" onClick={() => setSidebarOpen(false)} className="flex min-w-0 items-center gap-3">
                    <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
                    <div>
                      {/* Sidebar brand label, not the page heading — the page's
                          single <h1> lives in the chat's empty state below. */}
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">TomatoAI</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Your workspace</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    ref={sidebarCloseRef}
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close conversations"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={startNewConversation}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Plus className="h-4 w-4" /> New chat
                </button>

                <button
                  onClick={() => { setSidebarOpen(false); setShowMemoryModal(true); }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="h-4 w-4" /> Personal instructions
                  </div>
                </button>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} placeholder="Search chats" aria-label="Search conversations" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
                  {conversationSearch && <button type="button" onClick={() => setConversationSearch('')} aria-label="Clear chat search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-4 w-4" /></button>}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {filteredConvos.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{convos.length ? 'No matching chats' : 'No conversations yet'}</h3>
                    <p className="text-sm">{convos.length ? 'No chats match your search.' : 'Start your first conversation with TomatoAI.'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Recent chats
                    </h3>
                    {filteredConvos.map((c) => (
                      <div key={c.id} className="group relative">
                        <button
                          onClick={() => {
                            setActiveId(c.id);
                            setHasStartedChat(true);
                            setSidebarOpen(false);
                            setChatError('');
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeId === c.id
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="truncate pr-8 text-sm font-medium mb-1">
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
                          aria-label={`Delete ${c.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConvo(c.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:opacity-100 dark:hover:bg-red-900/20 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
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

              <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Explore</p>
                  <nav aria-label="Explore TomatoAI" className="grid grid-cols-2 gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <Link href="/ai-tools" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">AI tools</Link>
                    <Link href="/prompts" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">Prompts</Link>
                    <Link href="/ai-workflows" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">Workflows</Link>
                    <Link href="/ai-videos" onClick={() => setSidebarOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-900">Videos</Link>
                  </nav>
                  {convos.length > 0 && <button
                    onClick={clearAll}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear all chats
                  </button>}
                </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Transparent Navbar — inline, scrolls with content, takes no fixed space */}
        <header className="flex shrink-0 items-center justify-between gap-3 bg-transparent px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
          <button
            ref={menuButtonRef}
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Open conversations"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Image src="/logo.png" alt="" width={30} height={30} className="h-7 w-7 shrink-0 object-contain" />
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">TomatoAI</span>
          </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelModal(true)}
              className="hidden rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 sm:block"
              title="Select AI Model"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100/20 dark:hover:bg-gray-800/20 transition-colors"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/20 dark:hover:bg-gray-700/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginPopup(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900/70 dark:bg-gray-700/70 hover:bg-gray-800/80 dark:hover:bg-gray-600/80 rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto w-full">
          {(!forceChatView && (!hasStartedChat || (!active && !loading))) ? (
            <div className="flex flex-col items-center justify-center h-full px-4 relative">
              <div className="max-w-2xl w-full text-center mb-12">
                <div className="mb-8 bounce-in">
                  <MotionDiv
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
                  </MotionDiv>
                  {selectedModel === LIGHTNING_MODEL ? (
                    <>
                      <h1 className="lightning-title-enter mb-4 bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-6xl font-black uppercase tracking-tighter text-transparent dark:from-yellow-400 dark:to-amber-400">
                        Lightning
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 font-medium fade-in font-['Inter','system-ui','-apple-system','sans-serif']" style={{ animationDelay: '200ms' }}>
                        Ultra-fast responses. Powered by Nemotron 3.5 Lightning.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 fade-in font-['Inter','system-ui','-apple-system','sans-serif'] tracking-tight">
                        Hi, I'm TomatoAI
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400 font-light fade-in font-['Inter','system-ui','-apple-system','sans-serif']" style={{ animationDelay: '200ms' }}>
                        How can I help you today?
                      </p>
                    </>
                  )}
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
                    onStop={stopGenerating}
                    submitting={loading}
                    disabled={isUploading}
                    onLightningSelect={toggleLightning}
                    lightningActive={selectedModel === LIGHTNING_MODEL}
                    onModelSelect={() => setShowModelModal(true)}
                    selectedModel={selectedModel}
                    value={input}
                    onChange={setInput}
                    textareaRef={textareaRef}
                  />
                </div>

                <div className="w-full max-w-xl mx-auto overflow-hidden">
                  <SuggestionMarquee onSelect={(query) => {
                    setInput(query);
                    textareaRef.current?.focus();
                  }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
              {active?.messages.map((m) => (
                <div
                  key={m.id}
                  className="space-y-4"
                >
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl max-w-[90%] md:max-w-[85%] shadow-sm">
                        {m.image && <img src={m.image.url} alt={m.image.name} loading="lazy" className="mb-3 max-h-72 max-w-full rounded-lg object-contain" />}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-['Inter','system-ui','-apple-system','sans-serif'] font-normal">
                          {m.image ? m.content.replace(/^!\[[^\]]*\]\([^)]*\)\s*/, '') : m.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <div className="ml-0 md:ml-11 overflow-x-auto">
                        <div className="max-w-full">
                          <MarkdownRenderer content={m.content} />
                          {m.status === 'stopped' && <span className="mt-2 block text-xs text-slate-500">Stopped</span>}
                          {m.status === 'interrupted' && <span className="mt-2 block text-xs text-amber-600">Response interrupted</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && streamingConversationId === activeId && (
                <div className="space-y-3" aria-live="polite">
                  <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-full" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-['Inter','system-ui','-apple-system','sans-serif']">TomatoAI</span>
                  </div>
                  {streamingText ? <div className="ml-0 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800 dark:text-slate-100 md:ml-11">{streamingText}</div> : <div className="ml-11 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 font-['Inter','system-ui','-apple-system','sans-serif']">Thinking...</span>
                  </div>}
                </div>
              )}
              {chatError && lastFailedRequestRef.current?.convoId === activeId && (
                <div role="alert" className="ml-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100 md:ml-11">
                  <p>{chatError}</p>
                  <button type="button" onClick={retryLastResponse} className="mt-2 font-semibold underline underline-offset-2">Retry response</button>
                </div>
              )}
            </div>
          )}
        </div>

        {(hasStartedChat || forceChatView) && (
          <div className="hidden md:block border-t border-gray-200/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <AiInput
                  onSubmitWithMode={(text, isSearch) => {
                    if (isSearch) {
                      router.push(`/search?q=${encodeURIComponent(text)}`);
                    } else {
                      sendText(text);
                    }
                  }}
                  onStop={stopGenerating}
                  submitting={loading}
                  disabled={isUploading}
                  onLightningSelect={toggleLightning}
                  lightningActive={selectedModel === LIGHTNING_MODEL}
                  onFileSelect={handleAiInputFileSelect}
                  onModelSelect={() => setShowModelModal(true)}
                  selectedModel={selectedModel}
                  value={input}
                  onChange={setInput}
                  textareaRef={textareaRef}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Mobile Input Bar with Integrated Send Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200/80 dark:border-gray-700/80 p-3 md:hidden z-10 backdrop-blur-lg">
        {attachment && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg max-w-[200px] relative group">
            <span className="text-xs truncate max-w-full text-gray-600 dark:text-gray-300">
              {attachment.name}
            </span>
            <button
              onClick={removeAttachment}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="relative w-full">
          <div className="relative flex items-end bg-gray-100/90 dark:bg-gray-700/90 rounded-2xl shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
              className="p-3 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowModelModal(true)}
              aria-label="Choose AI model"
              className="p-3 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors relative group"
              title="Select AI Model"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <LightningToggle active={selectedModel === LIGHTNING_MODEL} onToggle={toggleLightning} size="md" />
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize the textarea
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              placeholder="Message TomatoAI..."
              className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-3 pl-4 pr-12 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading || isUploading}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!loading) void sendMessage(); } }}
              rows={1}
              style={{
                minHeight: '24px',
                maxHeight: '150px',
                lineHeight: '1.5',
                fontSize: '16px',
                WebkitAppearance: 'none',
                paddingRight: '60px',
              }}
            />

            {/* Send Button - Integrated Inside Input */}
            <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
              {input && (
                <button
                  type="button"
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-600/50"
                  onClick={() => {
                    setInput('');
                    const textarea = document.querySelector('textarea');
                    if (textarea) textarea.style.height = 'auto';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <button
                type={loading ? "button" : "submit"}
                disabled={!loading && (!input.trim() || isUploading)}
                onClick={loading ? stopGenerating : undefined}
                aria-label={loading ? 'Stop generating' : 'Send message'}
                className={`p-2 rounded-full transition-all duration-200 ${loading
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : input.trim()
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <Square className="w-5 h-5 fill-current" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transform rotate-0 transition-transform duration-200 group-hover:rotate-12"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChatGPTPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  );
}
