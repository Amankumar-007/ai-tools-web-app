"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase-browser";
import { highlight } from 'sugar-high';
import Modal from 'react-modal';
import AiInput from "@/components/ui/ai-input";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import {
  Sparkles,
  Zap,
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
  Image as ImageIcon
} from 'lucide-react';
import { extractTextFromPdf } from "@/services/pdfService";
import { toast } from "sonner";
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// Set modal app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement('body');
}

// Dynamic import for Framer Motion to avoid SSR issues
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => ({ default: mod.motion.div })), {
  ssr: false,
  loading: () => <div />
});

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
  return (text || "New chat").split("\n").slice(0, 40).join(" ") || "New chat";
}

// Code Block Component with Copy Functionality
const CodeBlock = ({ language, value, copiedCode, onCopy }: { language: string, value: string, copiedCode: string, onCopy: (code: string, id: string) => void }) => {
  const codeId = useMemo(() => Math.random().toString(36).substring(7), []);

  useEffect(() => {
    Prism.highlightAll();
  }, [value, language]);

  return (
    <div className="my-4 group relative max-w-full rounded-lg overflow-hidden bg-[#1d1f21] border border-gray-700/60 shadow-lg" style={{ fontFamily: 'var(--font-mono)' }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] border-b border-gray-700/60">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs font-mono text-gray-300 px-2 py-0.5 rounded bg-[#3e3e3e] border border-gray-600/50">
            {language}
          </span>
        </div>
        <button
          onClick={() => onCopy(value, codeId)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-600/50 rounded transition-colors"
        >
          {copiedCode === codeId ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className={`language-${language}`} style={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5', background: 'transparent' }}>
        <code className={`language-${language}`}>{value}</code>
      </pre>
    </div>
  );
};

// Model Selection Modal Component
function ModelSelectionModal({ isOpen, onClose, selectedModel, onSelectModel }: {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}) {
  const models = [
    { id: "arcee-ai/trinity-large-preview:free", name: "Trinity Large Preview", type: "reasoning" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1T2 Chimera", type: "reasoning" },
    { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", type: "fast" },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "DeepSeek R1T Chimera", type: "reasoning" },
    { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1", type: "reasoning" },
    { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B", type: "compact" },
    { id: "stepfun/step-3.5-flash:free", name: "Step 3.5 Flash", type: "multimodal" },
    { id: "tngtech/tng-r1t-chimera:free", name: "TNG R1T Chimera", type: "reasoning" },
    { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", type: "large" },
    { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", type: "balanced" },
    { id: "upstage/solar-pro-3:free", name: "Solar Pro 3", type: "pro" },
    { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder", type: "code" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", type: "balanced" },
    { id: "arcee-ai/trinity-mini:free", name: "Trinity Mini", type: "compact" },
    { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen 3 Next 80B", type: "next" },
    { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", type: "compact" },
    { id: "nvidia/nemotron-nano-12b-2-vl:free", name: "Nemotron Nano 12B VL", type: "multimodal" },
    { id: "allenai/molmo2-8b:free", name: "Molmo 2 8B", type: "multimodal" },
    { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B v2", type: "compact" },
    { id: "venice/uncensored:free", name: "Venice Uncensored", type: "uncensored" },
    { id: "liquidai/lfm2.5-1.2b-thinking:free", name: "LFM 2.5 1.2B Thinking", type: "reasoning" },
    { id: "liquidai/lfm2.5-1.2b-instruct:free", name: "LFM 2.5 1.2B Instruct", type: "balanced" },
    { id: "nousresearch/hermes-3-405b-instruct:free", name: "Hermes 3 405B", type: "large" },
    { id: "mistralai/mistral-small-3.1-24b:free", name: "Mistral Small 3.1 24B", type: "compact" },
    { id: "qwen/qwen3-4b:free", name: "Qwen 3 4B", type: "compact" },
    { id: "google/gemma-3n-2b:free", name: "Gemma 3N 2B", type: "compact" },
    { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B", type: "compact" },
    { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B", type: "balanced" },
    { id: "google/gemma-3-4b:free", name: "Gemma 3 4B", type: "compact" },
    { id: "qwen/qwen2.5-vl-7b-instruct:free", name: "Qwen 2.5 VL 7B", type: "multimodal" },
    { id: "google/gemma-3n-4b:free", name: "Gemma 3N 4B", type: "compact" },
    { id: "meta-llama/llama-3.1-405b-instruct:free", name: "Llama 3.1 405B", type: "large" },
    { id: "openrouter/free:free", name: "OpenRouter Default", type: "default" },
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
      overlayClassName="fixed inset-0 bg-black/40 z-[9998]"
    >
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Switch Model</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none text-sm dark:text-gray-200"
            />
          </div>

          <div className="space-y-1 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
            {filteredModels.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${selectedModel === model.id
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="truncate">{model.name}</span>
                  <span className="text-[10px] opacity-40 uppercase tracking-widest">{model.type}</span>
                </div>
                {selectedModel === model.id && <Check className="w-3.5 h-3.5" />}
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

function ChatInterface() {
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
  const [attachment, setAttachment] = useState<{ type: 'image' | 'text', content?: string, url?: string, name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("tngtech/deepseek-r1t2-chimera:free");
  const [showModelModal, setShowModelModal] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthChecking && query && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('q');
      window.history.replaceState({}, '', newUrl.toString());

      setTimeout(() => {
        submitMessage(query);
      }, 100);
    }
  }, [isAuthChecking, query]);

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

        // Load activeId from sessionStorage (reset on tab close)
        const sessionActiveId = sessionStorage.getItem(`tomato_ai_active_id_${user.id}`);
        if (sessionActiveId && parsed.some(c => c.id === sessionActiveId)) {
          setActiveId(sessionActiveId);
          setHasStartedChat(true);
        } else {
          // If no session ID or ID not found, reset to landing state
          setActiveId(null);
          setHasStartedChat(false);
        }
      }
    } catch { }
  }, [user]);

  // Persist conversations to localStorage
  useEffect(() => {
    if (!user) return;

    try {
      localStorage.setItem(`chatgpt_convos_v1_${user.id}`, JSON.stringify(convos));
      if (activeId) {
        sessionStorage.setItem(`tomato_ai_active_id_${user.id}`, activeId);
      } else {
        sessionStorage.removeItem(`tomato_ai_active_id_${user.id}`);
      }
    } catch { }
  }, [convos, user, activeId]);

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
    sessionStorage.clear();
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

  // Helper to create or update the streaming assistant message
  function upsertAssistantStreaming(convoId: string, assistantId: string, patch: string, isStart = false) {
    setConvos(prev => prev.map(c => {
      if (c.id !== convoId) return c;
      const msgs = [...c.messages];
      const idx = msgs.findIndex(m => m.id === assistantId);
      if (idx === -1 && isStart) {
        msgs.push({ id: assistantId, role: "assistant", content: patch, createdAt: Date.now() });
      } else if (idx !== -1) {
        msgs[idx] = { ...msgs[idx], content: msgs[idx].content + patch };
      }
      return { ...c, messages: msgs, updatedAt: Date.now() };
    }));
  }

  const processFile = async (file: File) => {
    setIsUploading(true);
    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Image = reader.result as string;
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            body: JSON.stringify({ image: base64Image }),
          });
          const data = await res.json();
          if (data.url) {
            setAttachment({ type: 'image', url: data.url, name: file.name });
          }
          setIsUploading(false);
        };
      } else if (file.type === 'application/pdf') {
        const text = await extractTextFromPdf(file);
        setAttachment({ type: 'text', content: text, name: file.name });
        setIsUploading(false);
      } else {
        // Plain text
        const text = await file.text();
        setAttachment({ type: 'text', content: text, name: file.name });
        setIsUploading(false);
      }
    } catch (err) {
      console.error("File upload error", err);
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

  async function submitMessage(text: string) {
    if (!text) return;

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setLoading(true);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!hasStartedChat) setHasStartedChat(true);

    let convo = active;
    if (!convo) {
      convo = createNewChat();
    }

    const messageContent = attachment?.type === 'image' && attachment.url
      ? `![${attachment.name}](${attachment.url})\n\n${text}`
      : attachment?.type === 'text' && attachment.content
        ? `${text}\n\n[Attached File: ${attachment.name}]\n${attachment.content}`
        : text;

    const userMsg: Message = { id: uid(), role: "user", content: messageContent, createdAt: Date.now() };
    setMessageAnimations(prev => new Set([...prev, userMsg.id]));

    setConvos(prev => {
      if (!prev.some(c => c.id === convo?.id) && convo) {
        return [{
          ...convo,
          title: formatTitleFromPrompt(text),
          messages: [...convo.messages, userMsg],
          updatedAt: Date.now(),
        }, ...prev];
      }
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

    // Clear attachment state (optimistic)
    setAttachment(null);

    const assistantId = uid();
    setMessageAnimations(prev => new Set([...prev, assistantId]));
    upsertAssistantStreaming(convo!.id, assistantId, "", true);

    let apiMessages = [
      { role: "system", content: "You are TomatoAI, a helpful and professional AI assistant." },
      ...convo!.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    let lastMessageContent: any = text;
    let modelToUse = selectedModel;

    if (attachment?.type === 'image' && attachment.url) {
      lastMessageContent = [
        { type: 'text', text: text },
        { type: 'image_url', image_url: { url: attachment.url } }
      ];
      modelToUse = "google/gemini-2.0-flash-exp:free";
    } else if (attachment?.type === 'text' && attachment.content) {
      lastMessageContent = `${text}\n\n[Attached File Content]:\n${attachment.content}`;
    }

    apiMessages.push({ role: "user", content: lastMessageContent });

    try {
      const payload = {
        messages: apiMessages,
        model: modelToUse,
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

      const fallbackModel = res.headers.get("X-Fallback-Model");
      if (fallbackModel) {
        toast.info(`Switched to ${fallbackModel}`, {
          description: "The primary model was unavailable, so we switched to a backup provider.",
          duration: 5000,
        });
      }

      if (!res.body) {
        throw new Error("Readable stream not supported by browser/route.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          upsertAssistantStreaming(convo!.id, assistantId, chunk);
        }
      }
    } catch (err: any) {
      setConvos(prev =>
        prev.map(c =>
          c.id === convo!.id
            ? {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantId
                  ? { ...m, content: `Error: ${err?.message || "Something went wrong"}` }
                  : m
              ),
              updatedAt: Date.now(),
            }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    submitMessage(input.trim());
  }

  async function sendText(text: string) {
    submitMessage(text.trim());
  }

  // Helper to submit arbitrary text (used by AiInput and quick prompts)


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

  const MarkdownRenderer = ({ content }: { content: string }) => {
    const [copiedCode, setCopiedCode] = useState<string>("");

    const onCopy = (code: string, id: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    };

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const inline = props.inline;
            return !inline && match ? (
              <CodeBlock
                language={match[1]}
                value={String(children).replace(/\n$/, "")}
                copiedCode={copiedCode}
                onCopy={onCopy}
              />
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 pl-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-600 dark:text-gray-400 my-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">{children}</tr>,
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };




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

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
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

          <Link href="/" className="flex items-center gap-2">
            <MotionDiv
              whileHover={{ scale: 1.07, rotate: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Image src="/logo.png" alt="TomatoAI" width={32} height={32} className="rounded-lg shadow-sm" />
            </MotionDiv>
            <span className="font-bold text-gray-900 dark:text-gray-100">TomatoAI</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModelModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
              title="Select AI Model"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
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
        className={`hidden md:block fixed top-20 left-5 z-40 p-3 rounded-xl bg-white/30 dark:bg-gray-800/30 shadow-lg border border-gray-200/30 dark:border-gray-700/30 hover:border-gray-300/50 dark:hover:border-gray-600/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
            <div className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
              <div className="p-6 border-b border-gray-100/30 dark:border-gray-700/30 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center gap-3">
                    <MotionDiv
                      whileHover={{ scale: 1.07, rotate: 5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    >
                      <Image src="/logo.png" alt="TomatoAI" width={40} height={40} className="rounded-xl shadow-lg" />
                    </MotionDiv>
                    <div>
                      <h1 className="text-3xl font-extrabold">TomatoAI</h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-['Inter','system-ui','-apple-system','sans-serif']">Professional AI Assistant</p>
                    </div>
                  </Link>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 md:pb-4" ref={listRef}>
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
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-sm border backdrop-blur-sm ${activeId === c.id
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
      <main className="flex-1 flex flex-col relative pt-16 overflow-hidden">
        <div ref={listRef} className="flex-1 overflow-y-auto w-full">
          {(!hasStartedChat || (!active && !loading)) ? (
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
                  className={`space-y-4 ${messageAnimations.has(m.id) ? 'message-enter' : ''}`}
                >
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-gray-900/90 dark:bg-gray-600/90 text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl max-w-[90%] md:max-w-[85%] shadow-lg transform hover:scale-102 transition-transform duration-300 backdrop-blur-sm">
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-['Inter','system-ui','-apple-system','sans-serif'] font-normal">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <div className="ml-0 md:ml-11 overflow-x-auto">
                        <div className="max-w-full">
                          <MarkdownRenderer content={m.content} />
                        </div>
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
                  submitting={loading}
                  disabled={loading}
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
              className="p-3 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowModelModal(true)}
              className="p-3 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors relative group"
              title="Select AI Model"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
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
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={loading}
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
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2 rounded-full transition-all duration-200 ${input.trim()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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